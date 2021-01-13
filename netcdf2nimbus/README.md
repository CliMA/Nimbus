# Netcdf2Nimbus
This script formats NetCDF data into a binary .json format which can be read by the Nimbus software.

## Requirements
This is a Julia script which relies on the following packages:

NCDatasets.jl
NetCDF.jl
BSON.jl
JSON.jl
ArgParse.jl

To install from Julia repl:
`using Pkg`
`Pkg.add([desired package])`

## Usage
`julia netcdf2nimbus.jl -i [input file directory] -s [site number] -n [simulation ID]`

For example - to run data from a folder `site23` that is in the directory `_input` with ID of `01`, run this command:

`julia netcdf2nimbus.jl -i _input -s 23 -n 01`

The input file should be a folder which contains 4 .nc files:

- 1 core diagnostic file
- 1 default diagnostic file
- 1 state volumetric file
- 1 aux volumetric file

The script will create a site folder in the directory `_output`, and a simulation folder called [simulation ID] in the site directory that contains:

- _meta.bson
- _diagnostic.bson
- volumetric/

In addition, a file called `nimbus_meta.json` will be created in the `_output` directory that will keep a current roster of all sites and simulations currently in `_output`. This roster will be re-created each time `netcdf2nimbus.jl` runs in order to keep it accurate, but it will not update if folders are manually deleted. If you delete a site or simulation folder manually, you will need to re-run `netcdf2nimbus.jl` in order to remove that site or simulation from `nimbus_meta.json`.
