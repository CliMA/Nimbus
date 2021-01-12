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
            required = true
        "-o", "--output"
            help = "directory for output file"
            required = true
		"-s", "--site_num"
			help = "ID number of site"
			required = true
		"-n", "--name"
			help = "simulation identifier"
			required = true
    end
    return parse_args(s)
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
		# temp = reshape(temp, size(temp))
		push!(diag_data[var], temp)
    end

	for var in def_vars
		temp = ncread(file_default, var)
		# temp = reshape(temp, size(temp))
		push!(diag_data[var], temp)
    end

	diag_data = Dict(var => diag_data[var][1] for var in all_diag_vars)

    return diag_data
end

function get_meta_data(core, default, aux, state)

    core_vars = keys(Dataset(core))
    core_vars = [var for var in core_vars if var != "z"]
    def_vars = keys(Dataset(default))
    def_vars = [var for var in def_vars if var != "time" && var != "z"]

    all_diag_vars = vcat(core_vars, def_vars)
	diag_num_time_stamps = size(Dataset(default)["time"])[1]
	diag_time_stamps = Dataset(default)["time"]

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
    default = Dataset(default)

    meta_data = Dict(

		"volumetric_variables" => all_diag_vars,
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

    return meta_data
end

function get_site_data(site_num)
	geo = Dataset("geolocation.nc")
	site_data = Dict(
		"site" => geo["site"][site_num],
		"lat" =>  geo["lat"][site_num],
		"lon" => geo["lon"][site_num]
	)
	return site_data
end

function main()

	#--------------------------------------
	#FILE SETUP
	#--------------------------------------

	parsed_args = get_args()

    files = sort(readdir(parsed_args["input"], join=true))
    files = [file for file in files if occursin(".nc", file)]

    diagnostic_file_01 = files[1]
    diagnostic_file_02 = files[2]
	dump_aux_file = files[3]
	dump_state_file = files[4]

	println("-------------------------------------")
	println("Converting data for Nimbus...")

	site_folder = parsed_args["output"] * "/" * "site" * parsed_args["site_num"]
	if !isdir(site_folder)
		mkdir(site_folder)
	end
	site_target_file = site_folder * "/_geo.json"
	sim_folder = site_folder * "/" * parsed_args["name"]
	mkdir(sim_folder)
    diag_target_file = sim_folder * "/_diagnostic.bson"
    meta_target_file = sim_folder * "/_meta.json"
	mkdir(sim_folder * "/volumetric")
	vol_target_folder = sim_folder * "/volumetric"

	#--------------------------------------
	#DATA CONVERSION
	#--------------------------------------

	site_data = get_site_data(parse(Int64, parsed_args["site_num"]))
    volumetric_data = get_volumetric_data(dump_aux_file, dump_state_file)
    diagnostic_data = get_diagnostic_data(diagnostic_file_01, diagnostic_file_02)
    meta_data = get_meta_data(diagnostic_file_01, diagnostic_file_02, dump_aux_file, dump_state_file)

	#--------------------------------------
	#PRINT STATEMENTS AND FILE OUTPUT
	#--------------------------------------

	#SITE DATA
	if !isfile(site_target_file)
		s = JSON.json(site_data)
		open(site_target_file, "w") do x
			write(x,s)
		end
	end

	#META DATA
	m = JSON.json(meta_data)
	open(meta_target_file, "w") do x
		write(x,m)
	end

	#DIAGNOSTIC DATA
	bson(diag_target_file, diagnostic_data)
	println("\tconverting diagnostic data...")

	#VOLUMETRIC DATA
	counter = 1
	println("\tconverting volumetric data...")
	for time_stamp in volumetric_data
		bson(vol_target_folder * "/volumetric_" * string(counter) * ".bson", time_stamp)
		println("\t\ttimestamp " * string(counter) * "...")
		counter+=1
	end

	#FINAL PRINT
	println("\tconsolidating meta data...")
	println("-------------------------------------")
	println("Simulation Site: " * parsed_args["site_num"])
	println("Simulation ID: " * parsed_args["name"])
	println("\tvolumetric duration: " * string(meta_data["volumetric_duration"]))
	println("\tvolumetric number of time stamps: " * string(meta_data["volumetric_num_time_stamps"]))
    println("\tvolumetric extents: \n" *
		"\t\tx: " * string(meta_data["x_extent"]) *
		"\n" *
		"\t\ty: " * string(meta_data["y_extent"]) *
		"\n" *
		"\t\tz: " * string(meta_data["z_extent"]))
	println("\tdiagnostic duration: " * string(meta_data["diagnostic_duration"]))
	println("\tdiagnostic number of time stamps: " * string(meta_data["diagnostic_num_time_stamps"]))
	println("\tdiagnostic altitude extent: \n" *
		"\t\tz: " * string(meta_data["diagnostic_altitude_extent"]))
	println("-------------------------------------")
end

main()
