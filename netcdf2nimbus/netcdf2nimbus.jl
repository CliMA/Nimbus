using NCDatasets
using NetCDF: ncread
using BSON
using JSON
using ArgParse

function get_args()
    s = ArgParseSettings()
    @add_arg_table! s begin
        "-i", "--input"
            help = "directory for input data"
			default = "-1"
		"-o", "--output"
			help = "directory for output data."
			required = true
		"-s", "--site_num"
			help = "ID number of site."
			default = "-1"
		"-n", "--name"
			help = "simulation identifier."
			default = "-1"
		"--db_add"
			help = "flag to convert simulation data and recompile database."
			action = :store_true
		"--db_compile"
			help = "flag to recompile database without adding new entry. no other arguments needed."
			action = :store_true
		"--add"
			help = "flag to convert simulation data without adding to database."
			action = :store_true
		"--no_vol"
			help = "flag to ignore volumetric data in input site directory."
			action = :store_true
    end
    return parse_args(s)
end

function handle_arg_errors(args)

	#--------------------------------------
	#TAG ERRORS / WARNINGS
	#--------------------------------------
	if args["db_add"] && args["db_compile"] || args["db_add"] && args["add"] || args["add"] && args["db_compile"]
		println("-----------------------------------------------------------------")
		println("ERROR: Multiple mode tags entered. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end

	if (args["db_add"] || args["add"]) && (args["site_num"] == "-1" || args["name"] == "-1")
		println("-----------------------------------------------------------------")
		println("ERROR: You must provide a valid site number and simulation ID. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end

	if args["db_compile"] && (args["site_num"] != "-1" || args["name"] != "-1")
		println("-----------------------------------------------------------------")
		println("WARNING: You entered a site number or simulation ID, but are in compile mode; no new data will be added.")
		println("-----------------------------------------------------------------")
	end

	if !args["db_compile"] && !args["db_add"] && !args["add"]
		println("-----------------------------------------------------------------")
		println("ERROR: No mode tag given. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end

	if !args["db_compile"] && args["input"] == "-1"
		println("-----------------------------------------------------------------")
		println("ERROR: Please enter a valid input directory. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end
	#--------------------------------------
	#DIRECTORY ERRORS
	#--------------------------------------
	if !args["db_compile"] && !isdir(args["input"])
		println("-----------------------------------------------------------------")
		println("ERROR: Given input directory does not exist. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end

	if !args["db_compile"] && !isdir(args["input"] * "/site" * args["site_num"])
		println("-----------------------------------------------------------------")
		println("ERROR: Given input site directory does not exist. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end

	if !args["db_compile"] && isdir(args["output"] * "/site" * args["site_num"] * "/" * args["name"])
		println("-----------------------------------------------------------------")
		println("ERROR: Given output simulation ID already exists. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end

	if args["db_compile"] && !isdir(args["output"])
		println("-----------------------------------------------------------------")
		println("ERROR: Given output directory does not exist and therefore cannot be compiled. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end
end

function get_volumetric_data(dump_aux, dump_state)

    # VARIABLE EXCEPTIONS
	num_time_steps = size(Dataset(dump_state)["time"])[1]

	state_vars = keys(Dataset(dump_state))
	state_vars = [var for var in state_vars if
		var != "x" &&
		var != "y" &&
		var != "z" &&
		var != "time"]

	aux_vars = keys(Dataset(dump_aux))
	aux_vars = [var for var in aux_vars if
		var != "x" &&
		var != "y" &&
		var != "z" &&
		var != "time" &&
		var != "coord[1]" &&
		var != "coord[2]" &&
		var != "coord[3]"]

	all_vol_vars = vcat(state_vars, aux_vars)

	# CREATE EMPTY ARRAY TO HOW DICTIONARY FOR EACH TIME STAMP
	time_stamps = []

	for time in 1:num_time_steps

		vol_data = Dict(var => [] for var in all_vol_vars)

		for var in state_vars
			temp = ncread(dump_state,var)
			push!(vol_data[var], temp[:,:,:,time])
		end

		for var in aux_vars
			temp = ncread(dump_aux,var)
			push!(vol_data[var], temp[:,:,:,time])
		end

		vol_data = Dict(var => vol_data[var][1] for var in all_vol_vars)
		push!(time_stamps, vol_data)
	end

	return time_stamps
end

function get_diagnostic_data(file_core, file_default)

    # VARIABLE EXCEPTIONS
    core_vars = keys(Dataset(file_core))
    core_vars = [var for var in core_vars if var != "time" && var != "z"]
    def_vars = keys(Dataset(file_default))
    def_vars = [var for var in def_vars if var != "z"]

    all_diag_vars = vcat(def_vars, core_vars)

    diag_data = Dict(var => [] for var in all_diag_vars)

	for var in core_vars
		temp = ncread(file_core, var)
		push!(diag_data[var], temp)
    end

	for var in def_vars
		temp = ncread(file_default, var)
		push!(diag_data[var], temp)
    end

	diag_data = Dict(var => diag_data[var][1] for var in all_diag_vars)

    return diag_data
end

function get_meta_data(vol, parsed_args, core, default, aux=nothing, state=nothing)

    core_vars = keys(Dataset(core))
    core_vars = [var for var in core_vars if var != "z"]
    def_vars = keys(Dataset(default))
    def_vars = [var for var in def_vars if var != "time" && var != "z"]

    all_diag_vars = vcat(core_vars, def_vars)
	diag_num_time_stamps = size(Dataset(default)["time"])[1]
	diag_time_stamps = Dataset(default)["time"]
	default = Dataset(default)

	if vol
	    ds_vars = keys(Dataset(state))
	    ds_vars = [var for var in ds_vars if
	        var != "x" &&
	        var != "y" &&
	        var != "z" &&
			var != "time"]
	    dsa_vars = keys(Dataset(aux))
	    dsa_vars = [var for var in dsa_vars if
	        var != "time" &&
	        var != "coord[1]" &&
	        var != "coord[2]" &&
	        var != "coord[3]" &&
	        var != "x" &&
	        var != "y" &&
	        var != "z"]

	    all_vol_vars = vcat(ds_vars, dsa_vars)
		vol_num_time_stamps = size(Dataset(state)["time"])[1]
		vol_time_stamps = Dataset(state)["time"]

	    state = Dataset(state)
	end


	if vol
	    meta_data = Dict(
			"simulation_id" => parsed_args["name"],
			"vol" => true,

			"volumetric_variables" => all_vol_vars,
			"volumetric_num_time_stamps" => vol_num_time_stamps,
			"volumetric_time_stamps" => vol_time_stamps,
			"volumetric_duration" => state["time"][end],
	        "x" => state["x"],
	        "y" => state["y"],
	        "z" => state["z"],
	        "x_extent" => state["x"][end],
	        "y_extent" => state["y"][end],
	        "z_extent" => state["z"][end],

			"diagnostic_variables" => all_diag_vars,
			"diagnostic_num_time_stamps" => diag_num_time_stamps,
			"diagnostic_time_stamps" => diag_time_stamps,
			"diagnostic_duration" => default["time"][end],
			"diagnostic_altitudes" => default["z"],
	        "diagnostic_altitude_extent" => default["z"][end]
	    )
	else
		meta_data = Dict(
			"simulation_id" => parsed_args["name"],
			"vol" => false,

			"diagnostic_variables" => all_diag_vars,
			"diagnostic_num_time_stamps" => diag_num_time_stamps,
			"diagnostic_time_stamps" => diag_time_stamps,
			"diagnostic_duration" => default["time"][end],
			"diagnostic_altitudes" => default["z"],
	        "diagnostic_altitude_extent" => default["z"][end]
	    )
	end
    return meta_data
end

function get_geo_data(site_num)
	site = parse(Int64, site_num)
	geo = Dataset("geolocation.nc")
	site_data = Dict(
		"lat" =>  geo["lat"][site],
		"lon" => geo["lon"][site]
	)
	return site_data
end

function compile_database(output_folder)

	if isfile("database.json")
		rm("database.json")
	end

	nimbus_data = Dict(
		"output_dir" => output_folder,
		"sites" => []
	)
	sites = sort(readdir(output_folder))
	sites = [site for site in sites if !occursin(".DS_Store", site)]
	if size(sites)[1] == 0
		println("WARNING: no sites in output folder - database will be empty...")
	end
	for site in sites
		site_data = Dict(
			"site_num" => site[end-1:end],
			"geocoordinates" => get_geo_data(site[end-1:end]),
			"simulations" => []
		)
		sims = sort(readdir(output_folder * "/" * site))
		sims = [sim for sim in sims if !occursin(".DS_Store", sim)]
		for sim in sims
			meta_file = output_folder * "/" * site * "/" * sim * "/_meta.json"
			sim_meta = JSON.parsefile(meta_file)
			vol = sim_meta["vol"]
			if vol
				sim_data = Dict(
					"sim_id" => sim_meta["simulation_id"],
					"vol" => true,
					"x_extent" => sim_meta["x_extent"],
					"y_extent" => sim_meta["y_extent"],
					"z_extent" => sim_meta["z_extent"],
					"diagnostic_duration" => sim_meta["diagnostic_duration"],
					"diagnostic_num_time_stamps" => sim_meta["diagnostic_num_time_stamps"],
					"volumetric_duration" => sim_meta["volumetric_duration"],
					"volumetric_num_time_stamps" => sim_meta["volumetric_num_time_stamps"]
				)
			else
				sim_data = Dict(
					"sim_id" => sim_meta["simulation_id"],
					"vol" => false,
					"z_extent" => sim_meta["diagnostic_altitude_extent"],
					"diagnostic_duration" => sim_meta["diagnostic_duration"],
					"diagnostic_num_time_stamps" => sim_meta["diagnostic_num_time_stamps"]
				)
			end
			push!(site_data["simulations"], sim_data)
		end
		push!(nimbus_data["sites"], site_data)
	end
	return nimbus_data
end

function write_to_json(data, target_file)
	d = JSON.json(data)
	open(target_file, "w") do x
		write(x,d)
	end
end

# function add_to_database(output_folder, site_num, sim_id)
# 	# read database.json and add simulation data in the right site folder
# 	if !isfile("database.json")
# 		# error - no database file - run in compile mode
# 	end
#
# 	db = JSON.parsefile("database.json")
#
# 	# check if site folder already exists in database
# 	site_exists = false
# 	site_index = 1
# 	for site in db["sites"]
# 		if site["site_num"] == site_num
# 			site_exists = true
# 		end
# 		if !site_exists
# 			site_index+=1
# 		end
# 	end
#
# 	# if site folder doesnt already exist
# 	if !site_exists
# 		site_data = Dict(
# 			"site_num" => site_num,
# 			"geocoordinates" => get_geo_data(site_num),
# 			"simulations" => []
# 		)
# 		meta_file = output_folder * "/site" * site_num * "/" * sim * "/_meta.json"
# 		sim_meta = JSON.parsefile(meta_file)
# 		sim_data = Dict(
# 			"sim_id" => sim_meta["simulation_id"],
# 			"x_extent" => sim_meta["x_extent"],
# 			"y_extent" => sim_meta["y_extent"],
# 			"z_extent" => sim_meta["z_extent"],
# 			"diagnostic_duration" => sim_meta["diagnostic_duration"],
# 			"diagnostic_num_time_stamps" => sim_meta["diagnostic_num_time_stamps"],
# 			"volumetric_duration" => sim_meta["volumetric_duration"],
# 			"volumetric_num_time_stamps" => sim_meta["volumetric_num_time_stamps"]
# 		)
# 		push!(site_data["simulations"], sim_data)
# 		push!(db["sites"], site_data)
#
# 	# if site folder exists and we're just adding the indicated simulation
# 	else
# 		meta_file = output_folder * "/site" * site_num * "/" * sim * "/_meta.json"
# 		sim_meta = JSON.parsefile(meta_file)
# 		sim_data = Dict(
# 			"sim_id" => sim_meta["simulation_id"],
# 			"x_extent" => sim_meta["x_extent"],
# 			"y_extent" => sim_meta["y_extent"],
# 			"z_extent" => sim_meta["z_extent"],
# 			"diagnostic_duration" => sim_meta["diagnostic_duration"],
# 			"diagnostic_num_time_stamps" => sim_meta["diagnostic_num_time_stamps"],
# 			"volumetric_duration" => sim_meta["volumetric_duration"],
# 			"volumetric_num_time_stamps" => sim_meta["volumetric_num_time_stamps"]
# 		)
# 		push!(db["sites"][site_index]["simulations"], sim_data)
# 	end
#
# 	return db
# end

function main()

	parsed_args = get_args()
	handle_arg_errors(parsed_args)

	println("-----------------------------------------------------------------")
	output_folder = parsed_args["output"]
	if !isdir(output_folder)
		mkdir(output_folder)
	end

	#--------------------------------------
	# PHASE 1. COVNERT DATA (FOR MODES --db_add and --add)
	#--------------------------------------
	if parsed_args["db_add"] || parsed_args["add"]

		#--------------------------------------
		#FILE SETUP
		#--------------------------------------
	    files = sort(readdir(parsed_args["input"] * "/site" * parsed_args["site_num"], join=true))
	    files = [file for file in files if occursin(".nc", file)]

		vol = false

		#ASSIGN INPUT FILES
		if (size(files)[1] == 4 || size(files)[1] == 5) && !parsed_args["no_vol"]
			println("Locating data...")
			println("\tvolumetric and diagnostic data located...")
			diagnostic_file_01 = files[1]
			diagnostic_file_02 = files[2]
			dump_aux_file = files[3]
			dump_state_file = files[4]
			vol = true
		elseif size(files)[1] >= 2
			println("Locating data...")
			println("\tdiagnostic data located...")
			diagnostic_file_01 = files[1]
			diagnostic_file_02 = files[2]
		else
			println("ERROR: Unrecognized input files. Exiting...")
			println("-----------------------------------------------------------------")
			exit()
		end

		println("Converting data...")

		site_folder = output_folder * "/site" * parsed_args["site_num"]
		if !isdir(site_folder)
			mkdir(site_folder)
		end
		sim_folder = site_folder * "/" * parsed_args["name"]
		mkdir(sim_folder)
	    # diag_target_file = sim_folder * "/_diagnostic.bson"
		diag_target_file = sim_folder * "/_diagnostic.json"
	    meta_target_file = sim_folder * "/_meta.json"
		if vol
			mkdir(sim_folder * "/volumetric")
			vol_target_folder = sim_folder * "/volumetric"
		end

		#--------------------------------------
		#DATA CONVERSION
		#--------------------------------------
		if vol
	    	volumetric_data = get_volumetric_data(dump_aux_file, dump_state_file)
			meta_data = get_meta_data(vol, parsed_args, diagnostic_file_01, diagnostic_file_02, dump_aux_file, dump_state_file)
		else
			meta_data = get_meta_data(vol, parsed_args, diagnostic_file_01, diagnostic_file_02)
		end

	    diagnostic_data = get_diagnostic_data(diagnostic_file_01, diagnostic_file_02)


		#--------------------------------------
		#PRINT STATEMENTS AND FILE OUTPUT
		#--------------------------------------

		#META DATA
		write_to_json(meta_data, meta_target_file)

		#DIAGNOSTIC DATA
		write_to_json(diagnostic_data, diag_target_file)
		# bson(diag_target_file, diagnostic_data)
		println("\tconverting diagnostic data...")

		#VOLUMETRIC DATA
		if vol
			counter = 1
			println("\tconverting volumetric data...")
			for time_stamp in volumetric_data
				write_to_json(time_stamp, vol_target_folder * "/volumetric_" * string(counter) * ".json")
				# bson(vol_target_folder * "/volumetric_" * string(counter) * ".bson", time_stamp)
				println("\t\ttimestamp " * string(counter) * "...")
				counter+=1
			end
		end

		#FINAL PRINT
		println("\tconsolidating meta data...")
		println("-----------------------------------------------------------------")
		println("Simulation Site: " * parsed_args["site_num"])
		println("Simulation ID: " * parsed_args["name"])
		if vol
			println("\tvolumetric duration: " * string(meta_data["volumetric_duration"]))
			println("\tvolumetric number of time stamps: " * string(meta_data["volumetric_num_time_stamps"]))
		    println("\tvolumetric extents: \n" *
				"\t\tx: " * string(meta_data["x_extent"]) *
				"\n" *
				"\t\ty: " * string(meta_data["y_extent"]) *
				"\n" *
				"\t\tz: " * string(meta_data["z_extent"]))
		end
		println("\tdiagnostic duration: " * string(meta_data["diagnostic_duration"]))
		println("\tdiagnostic number of time stamps: " * string(meta_data["diagnostic_num_time_stamps"]))
		println("\tdiagnostic altitude extent: \n" *
			"\t\tz: " * string(meta_data["diagnostic_altitude_extent"]))
		println("-----------------------------------------------------------------")
	end

	#--------------------------------------
	# PHASE 2. COMPILE DATABASE (FOR MODES --db_add and --db_compile)
	#--------------------------------------
	if parsed_args["db_compile"] || parsed_args["db_add"]
		println("Outputting nimbus_meta.json...")
		database = compile_database(output_folder)
		nm = JSON.json(database)
		open("database.json", "w") do x
			write(x, nm)
		end
	end
	println("FINISHED")
	println("-----------------------------------------------------------------")
end

main()
