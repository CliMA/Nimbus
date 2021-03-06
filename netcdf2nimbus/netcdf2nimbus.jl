using NCDatasets
using NetCDF: ncread
using BSON
using JSON
using ArgParse
using Statistics

# lists to limit variables for testing
VOLUMETRIC_VARIABLES = ["ρ","ρu[3]","moisture.ρq_tot","moisture.temperature","moisture.θ_v","moisture.q_liq","moisture.q_ice"]
# DIAGNOSTIC_VARIABLES = []
SLICES_PER_FILE = 20

function get_args()
    s = ArgParseSettings()
    @add_arg_table! s begin
        "-i", "--input"
            help = "directory for input data"
			default = "-1"
		"-o", "--output"
			help = "directory for output data."
			required = true
		"-n", "--name"
			help = "simulation identifier."
			default = "-1"
		"-d", "--dbName"
			help = "file name for database file."
			default = "nimbusDB.json"
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

	if (args["db_add"] || args["add"]) && (args["name"] == "-1")
		println("-----------------------------------------------------------------")
		println("ERROR: You must provide a valid site number and simulation ID. Exiting...")
		println("-----------------------------------------------------------------")
		exit()
	end

	if args["db_compile"] && (args["name"] != "-1")
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

	if !args["db_compile"] && !isdir(args["input"])
		println("-----------------------------------------------------------------")
		println("ERROR: Given input site directory does not exist. Exiting...")
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

function get_volumetric_data(dump_aux, dump_state, df) #df = downsample_factor

    # VARIABLE EXCEPTIONS
	num_time_steps = size(Dataset(dump_state)["time"])[1]
	num_altitudes = size(Dataset(dump_state)["z"])[1]

	state_vars = keys(Dataset(dump_state))
	state_vars = [var for var in state_vars if
		var != "x" &&
		var != "y" &&
		var != "z" &&
		var != "time" &&
		in(var, VOLUMETRIC_VARIABLES)] #delete this line to include all variables

	aux_vars = keys(Dataset(dump_aux))
	aux_vars = [var for var in aux_vars if
		var != "x" &&
		var != "y" &&
		var != "z" &&
		var != "time" &&
		var != "coord[1]" &&
		var != "coord[2]" &&
		var != "coord[3]" &&
		in(var, VOLUMETRIC_VARIABLES)] #delete this line to include all variables

	all_vol_vars = vcat(state_vars, aux_vars)

	# CREATE EMPTY ARRAY FOR EACH TIME STAMP
	time_stamps = []
	for time in 1:num_time_steps
		# CREATE EMPTY ARRAY FOR EACH ALTITUDE VALUE 
		altitudes = []
		for z in 1:SLICES_PER_FILE:num_altitudes-SLICES_PER_FILE
			vol_data = Dict(var => [] for var in all_vol_vars)

			for var in state_vars
				temp = ncread(dump_state,var)
				push!(vol_data[var], temp[1:df:end,1:df:end,z:df:z+SLICES_PER_FILE-1,time])
			end

			for var in aux_vars
				temp = ncread(dump_aux,var)
				push!(vol_data[var], temp[1:df:end,1:df:end,z:df:z+SLICES_PER_FILE-1,time])
			end

			vol_data = Dict(var => vol_data[var][1] for var in all_vol_vars)
			push!(altitudes, vol_data)
		end
		push!(time_stamps, altitudes)
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

	timeline_vars = ["tke","ql","cld_frac"]

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
			var != "time" &&
			in(var, VOLUMETRIC_VARIABLES)] #delete this line to include all variables]
	    dsa_vars = keys(Dataset(aux))
	    dsa_vars = [var for var in dsa_vars if
	        var != "time" &&
	        var != "coord[1]" &&
	        var != "coord[2]" &&
	        var != "coord[3]" &&
	        var != "x" &&
	        var != "y" &&
	        var != "z" &&
			in(var, VOLUMETRIC_VARIABLES)] #delete this line to include all variables]

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
	        "diagnostic_altitude_extent" => default["z"][end],

			"timeline_data" => Dict(var => Statistics.mean(default[var], dims=1) for var in timeline_vars)
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
	        "diagnostic_altitude_extent" => default["z"][end],

			"timeline_data" => Dict(var => Statistics.mean(default[var], dims=1) for var in timeline_vars)
	    )
	end
    return meta_data
end

function get_geo_data(site_num, nimbus_dir)
	site = parse(Int64, site_num)
	geo = Dataset(nimbus_dir * "/netcdf2nimbus" * "/geolocation.nc")
	site_data = Dict(
		"lat" =>  geo["lat"][site],
		"lon" => geo["lon"][site]
	)
	return site_data
end

function compile_database(output_folder, nimbus_dir, dbName)

	if isfile(nimbus_dir * "/" * dbName)
		rm(nimbus_dir * "/" * dbName)
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
			# "site_num" => site[end-1:end],
			"site_num" => site[findfirst("site",site)[end]+1:end],
			"geocoordinates" => get_geo_data(site[end-1:end], nimbus_dir),
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
					"volumetric_num_time_stamps" => sim_meta["volumetric_num_time_stamps"],

					"timeline_data" => sim_meta["timeline_data"]
				)
			else
				sim_data = Dict(
					"sim_id" => sim_meta["simulation_id"],
					"vol" => false,
					"z_extent" => sim_meta["diagnostic_altitude_extent"],
					"diagnostic_duration" => sim_meta["diagnostic_duration"],
					"diagnostic_num_time_stamps" => sim_meta["diagnostic_num_time_stamps"],

					"timeline_data" => sim_meta["timeline_data"]
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

function main()

	parsed_args = get_args()
	handle_arg_errors(parsed_args)

	dbName = parsed_args["dbName"];
	if !occursin(".json", dbName)
		dbName = dbName * ".json"
	end

	println("-----------------------------------------------------------------")
	nimbus_dir = dirname(Base.source_dir())
	curr_dir = pwd()
	
	output_folder = curr_dir * "/" * parsed_args["output"]
	
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
		files = sort(readdir(parsed_args["input"], join=true))
	    files = [file for file in files if occursin(".nc", file)]
		site_num = parsed_args["input"][findfirst("site",parsed_args["input"])[end]+1:end]

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

		println("Converting data. This may take some time...")

		site_folder = output_folder * "/site" * site_num
		if !isdir(site_folder)
			mkdir(site_folder)
		end
		sim_folder = site_folder * "/" * parsed_args["name"]
		mkdir(sim_folder)
		diag_target_file = sim_folder * "/_diagnostic.bson"
	    meta_target_file = sim_folder * "/_meta.json"
		if vol
			vol_target_folder = sim_folder * "/volumetric"
			mkdir(vol_target_folder)
			vfs = [vol_target_folder * "/1x", vol_target_folder * "/2x", vol_target_folder * "/4x", vol_target_folder * "/8x"]
			for folder in vfs
				mkdir(folder)
			end
		end

		#--------------------------------------
		#DATA CONVERSION
		#--------------------------------------
		if vol
			volumetric_data = [
				get_volumetric_data(dump_aux_file, dump_state_file,1),
				get_volumetric_data(dump_aux_file, dump_state_file,2),
				get_volumetric_data(dump_aux_file, dump_state_file,4),
				get_volumetric_data(dump_aux_file, dump_state_file,8)
				]
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
		bson(diag_target_file, diagnostic_data)
		println("\twriting diagnostic data...")

		#VOLUMETRIC DATA
		if vol
			println("\twriting volumetric data...")
			counter = 1
			for v in volumetric_data
				t_counter = 1
				for time_stamp in v
					folder_name = vfs[counter] * "/t_" * lpad(t_counter,4,"0")
					mkdir(folder_name)
					a_counter = 1
					for altitude in time_stamp
						bson(folder_name * "/set_" * lpad(a_counter,3,"0") * ".bson", altitude)
						a_counter+=1
					end
					t_counter+=1
				end
				counter+=1
			end
		end

		#FINAL PRINT
		println("\twriting meta data...")
		println("-----------------------------------------------------------------")
		println("Simulation Site: " * site_num)
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
		println("Writing " * dbName * "...")
		database = compile_database(output_folder, nimbus_dir, dbName)
		nm = JSON.json(database)
		open(nimbus_dir * "/" * dbName, "w") do x
			write(x, nm)
		end
	end
	println("FINISHED")
	println("-----------------------------------------------------------------")
end

main()
