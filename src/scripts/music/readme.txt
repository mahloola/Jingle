GetGeoJSONData scrapes the wiki song by song and saves it

compositemapconverter is Fawlty's (wiki guy) script to convert the world defs dumped from cache

ConvertMusicPolys. converts all song polys into the format we're using now  with convertedGeometry. It needs our geojsons, and convertedWorldDefs, which Fawlty's script outputs.

Still gonna need to extract the worldDefs from cache for new updates though, to run compositemapconverter. For this use runelite cache tools or the wiki's map exporter wrapper of it