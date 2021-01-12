# Netcdf2Nimbus
This script formats NetCDF data into a binary .json format which can be read by the Nimbus software.

## Requirements
This is a Julia script which relies on the following packages:

NCDatasets.jl
NetCDF.jl
BSON.jl
ArgParse.jl

To install from Julia repl:
`using Pkg`
`Pkg.add([desired package])`

## Usage
`julia netcdf2nimbus.jl -i [input file directory] -o [output file directory] -n [simulation ID]`

The input file should be a folder which contains 4 .nc files:

- 1 core diagnostic file
- 1 default diagnostic file
- 1 state volumetric file
- 1 aux volumetric file

The output will create a folder called [simulation ID] in the [output file directory] that contains:

- _meta.bson
- _diagnostic.bson
- volumetric/
