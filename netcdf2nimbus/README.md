# Netcdf2Nimbus
This script formats NetCDF data into a binary .json format which can be read by the Nimbus software.

## Requirements
This is a Julia script which relies on the following packages:

- NCDatasets.jl
- NetCDF.jl
- BSON.jl
- JSON.jl
- ArgParse.jl

To install from Julia repl:
`using Pkg`
`Pkg.add("BSON")`
`Pkg.add("JSON")`
`Pkg.add("ArgParse")`
`Pkg.add("NetCDF")`
`Pkg.add("NCDatasets")`

## Usage
netcdf2nimbus.jl has 3 different modes of operation that are selected by command line tags. The tags are:

- `--add` - convert data to nimbus format
  - `julia netcdf2nimbus.jl --add -i [input_site_directory] -o [output_directory] -n [simulation ID]`
- `--db_compile` - compile `database.json` with nimbus data from a given output directory
  - `julia netcdf2nimbus.jl --db_compile -o [output_directory]`
- `--db_add` - convert data to nimbus format and recompile `database.json`
  - `julia netcdf2nimbus.jl --db_add -i [input_site_directory] -o [output_directory] -n [simulation ID]`

For example - to add data from a folder `site23` that is in the directory `sample_input` with ID of `01`, and to recompile the database so that it contains that data, run this command:

`julia netcdf2nimbus.jl --db_add -i sample_input/site23 -o ../nimbus_data -n 01`

The input file should be a folder which contains .nc files. The files that `netcdf2nimbus.jl` can handle are as follows:

- `AtmosLESCore`
- `AtmosLESDefault`
- `DumpAux`
- `DumpState`

It currently operates under the assumption that `AtmosLESCore` and `AtmosLESDefault` will exist for every simulation. If `DumpAux` or `DumpState` are not present in the `[input_directory]`, only diagnostic data will be converted to nimbus format.

Additionally if the input folder contains volumetric data, but you do not wish to convert that data, the tag: `--no_vol` can be added anywhere in the command:

`julia netcdf2nimbus.jl --db_add -i sample_input/site23 -o ../nimbus_data -n 01 --no_vol`

The script will create a site folder in `[output_directory]`, and a simulation folder called `[simulation ID]` in the site directory that contains:

- _meta.bson
- _diagnostic.bson
- volumetric/ (if it exists)

In addition, a file called `database.json` will be created in the `netcdf2nimbus` directory that will keep a current roster of all sites and simulations currently in the given [output_directory]. This roster will be re-created each time `netcdf2nimbus.jl` runs in order to keep it accurate, but it will not update if folders are manually deleted. If you delete a site or simulation folder manually, you will need to re-run `netcdf2nimbus.jl --db_compile -o [output_directory]` in order to remove that site or simulation from `nimbusDB.json`.

## Notes

In the current implementation, the [output_directory] is defaulted to `nimbus_data/` located in the root directory. This is a command line argument in netcdf2nimbus, so the name and location can be changed, but for nimbus to find this data, right now you need to manually change the `userPath` variable in `server.js`. Soon this will be implemented as a user setting in the opening nimbus UI.

Though it is possible to create multiple output directories with different sets of data, `nimbusDB.json` will only store one of these at a time. In order to re-update `nimbusDB.json` to the desired directory, run `julia netcdf2nimbus.jl --dbcompile -o [desired_output_directory]`.
