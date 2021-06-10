using NCDatasets
using JSON

function write_to_json(data, target_file)
	d = JSON.json(data)
	open(target_file, "w") do x
		write(x,d)
	end
end

function main()
    ds = Dataset("geolocation.nc")
    # geoJSON takes points in a [lon,lat] format
    sites = Dict(site => (ds["lon"][site],ds["lat"][site]) for site in ds["site"][:])
    write_to_json(sites,"../src/assets/geolocations.json")
end

main()