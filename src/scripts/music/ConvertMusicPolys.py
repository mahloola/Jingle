#needs "OurGeoJSON.json", processed version of wiki music map format, with different features for same songs combined.
#also needs "CombinedGeoJSON.json", scraped geojson data song page by song page.

import json
import re
import html
from typing import List, Tuple

def shift_polygon(polygon: List[Tuple[int, int]], old_coords: Tuple[int, int], new_coords: Tuple[int, int]) -> List[Tuple[int,int]]:

	# Calculate the shift (dx, dy)
	dx = new_coords[0] - old_coords[0]
	dy = new_coords[1] - old_coords[1]

	# Apply the same shift to all points
	new_polygon = [(x + dx, y + dy) for x, y in polygon]

	return new_polygon

def GetTranslatedCoordsFromSquare (name, x, y, z, displaySquareX, displaySquareZ, displayZoneX, displayZoneZ):
	xSquareOffset = x % 64
	ySquareOffset = y % 64
	xZoneOffset = x % 8
	yZoneOffset = y % 8

	#if whole square translated
	if(displayZoneX == -1 and displayZoneZ == -1):
		translatedX = (displaySquareX * 64) + xSquareOffset
		translatedY = (displaySquareZ * 64) + ySquareOffset
		return translatedX, translatedY, name

	#if both square and zone translated
	translatedX = (displaySquareX * 64) + (displayZoneX * 8) + xZoneOffset
	translatedY = (displaySquareZ * 64) + (displayZoneZ * 8) + yZoneOffset
	return translatedX, translatedY, name,

def GetSquareFromCoords (x, y, z, areas):
	xSquare = x // 64
	ySquare = y // 64
	xZone = (x - (xSquare * 64)) // 8
	yZone = (y - (ySquare * 64)) // 8

	translatedXSquare = -1
	translatedYSquare = -1
	translatedXZone = -1
	translatedYZone = -1
	selectedArea = "undefined"
	selectedId = -666

	for area in areas:
		combined_definitions = area.get("mapSquareDefinitions", []) + area.get("zoneDefinitions", [])
		for mapSquare in combined_definitions:	
			
			if(z < mapSquare["level"] or z >= mapSquare["level"] + mapSquare["totalLevels"]):
				continue
			
			# if same level, then compare squares
			#WHO TF WILL ACTUALLY CHECK THE LEVEL YOU MORONNNN SO MUCH TIME WASTED MY GOD. adding this now, everything better work well.
			
			if(mapSquare["sourceSquareX"] == xSquare and mapSquare["sourceSquareZ"] == ySquare):
				translatedXSquare = mapSquare["displaySquareX"]
				translatedYSquare = mapSquare["displaySquareZ"]
				selectedArea = area["name"]
				selectedId = area["fileId"]

				#if same square, 
				if "sourceZoneX" not in mapSquare and "sourceZoneZ" not in mapSquare:
					continue

				if(mapSquare["sourceZoneX"] == xZone and mapSquare["sourceZoneZ"] == yZone):
					translatedXZone = mapSquare["displayZoneX"]
					translatedYZone = mapSquare["displayZoneZ"]
					return selectedArea, selectedId, translatedXSquare, translatedYSquare, translatedXZone, translatedYZone

	return selectedArea, selectedId, translatedXSquare, translatedYSquare, translatedXZone, translatedYZone

def ConvertCoord(x, y, z, areas):
    selectedArea, selectedId, translatedXSquare, translatedYSquare, translatedXZone, translatedYZone = GetSquareFromCoords(x, y, z, areas)
    translatedX, translatedY, name = GetTranslatedCoordsFromSquare(selectedArea, x, y, z, translatedXSquare, translatedYSquare, translatedXZone, translatedYZone)
    return translatedX, translatedY, name, selectedId

def find_plane_by_polygon(wikiGeoJsonList, songTitle, polygon):
    def polygons_match(poly1, poly2):
        return poly1 == poly2

    # Find the entry with the matching songTitle
    for song_entry in wikiGeoJsonList:
        if song_entry.get("title") == songTitle:
            data_dict = song_entry.get("data", {})
            for song_poly_list in data_dict.values():  # list
                for song_poly_data in song_poly_list:  # dict
                    for feature in song_poly_data.get("features", []):
                        for candidate_polygon in feature.get("geometry", {}).get("coordinates", []):
                            if polygons_match(candidate_polygon, polygon):
                                return int(feature.get("properties", {}).get("plane", 0)) 
            print("No poly matched for: ", polygon, "\n\n\n")
            return 0  # Song found but polygon not matched
    
    print("Song title not found: ", songTitle)
    return 0  # Song title not found

def add_plane_to_polys(ourGeoJsonList, wikiGeoJsonList):
    for song in ourGeoJsonList["features"]:

        fullTitle = song["properties"]["title"]
        title = extract_title(fullTitle)
        updated_coords = []
        
        for poly in song["geometry"]["coordinates"]:
            plane = find_plane_by_polygon(wikiGeoJsonList, title, poly)
            updated_coords.append({
                "polygon": poly,
                "plane": plane
            })
        #overwrite
        song["geometry"]["coordinates"] = updated_coords
    
    with open("planeAddedGeoJson.json", "w") as f:
        json.dump(ourGeoJsonList, f, indent=2)

def extract_title(input_str):
    match = re.search(r'<a [^>]*title="([^"]*)"[^>]*>', input_str)
    if match:
        title = html.unescape(match.group(1))  # Convert HTML 
        return title.replace('_', ' ')  # Replace underscores with spaces
    return None

#for debugging
def translate_one_poly(areas):
    poly = [[3328,11456],[3328,11520],[3392,11520],[3392,11456],[3328,11456]]   

    centerX, centerY = polygon_centroid(poly)
    print(centerX, centerY)
    newX, newY, name, mapId = ConvertCoord(centerX, centerY, 0, areas)            
    print(newX, newY, name, mapId   )

def add_planes_to_our_geojson():
    with open("OurGeoJSON.json", "r") as f:
        ourGeoJsonList = json.load(f)

    with open("GeoJSONCombined.json", "r") as f:
        wikiGeoJsonList = json.load(f)

    add_plane_to_polys(ourGeoJsonList, wikiGeoJsonList)

def polygon_centroid(points):
	"""
	points: list of (x, y) tuples
	returns: (centroid_x, centroid_y)
	"""
	if not points:
		return None

	x_list, y_list = zip(*points)
	n = len(points)
	area = 0
	cx = 0
	cy = 0

	for i in range(n):
		x0, y0 = points[i]
		x1, y1 = points[(i + 1) % n]
		cross = x0 * y1 - x1 * y0
		area += cross
		cx += (x0 + x1) * cross
		cy += (y0 + y1) * cross

	area *= 0.5
	if area == 0:
		return sum(x_list) / n, sum(y_list) / n # fallback to average

	cx /= (6 * area)
	cy /= (6 * area)
	return (cx, cy)


def main():
	
	add_planes_to_our_geojson()

	with open("planeAddedGeoJson.json", "r") as f:
		music = json.load(f)

	with open("ConvertedWorldDefs.json", "r") as f:
		areas = json.load(f)

	features = music["features"]

	for song in features:
		converted_polygons = {}
		original_polygons = []

		for polygonData in song["geometry"]["coordinates"]:
			region_polygons = [] 
			polygon = polygonData["polygon"]
			original_polygons.append(polygon)
			#try shifting polygon at each point
			for i in range (len(polygon) + 1): 
				
				if(i == len(polygon)): #lazy center handling
					centroid = polygon_centroid(polygon)
					x = centroid[0]
					y = centroid[1]
				else:
					x = polygon[i][0]
					y = polygon[i][1]
				z = polygonData["plane"]
				
				newX, newY, name, mapId = ConvertCoord(x, y, z, areas)
				shiftedPolygon = shift_polygon(polygon, [x, y], [newX, newY])

				duplicate = False
				for (regionPolyMapId, regionPolyName, regionPoly) in region_polygons:
					if regionPolyMapId == mapId and regionPoly == shiftedPolygon:
						duplicate = True
						break  # No need to check further

				if not duplicate:
					region_polygons.append((mapId, name, shiftedPolygon))

			#add all duplicated polys for this poly
			for(mapId, name, shiftedPolygon) in region_polygons:
				if(mapId == -666): #filter out undefined mapIds
					continue
				if (name, mapId) not in converted_polygons:
					converted_polygons[(name, mapId)] = []
				converted_polygons[(name, mapId)].append(shiftedPolygon)

		#add all generated polys for this song into "ConvertedGeometry"
		song["convertedGeometry"] = [
			{"mapName": mapName, "mapId": mapId, "coordinates": polygon}
			for (mapName, mapId), polygons in converted_polygons.items()
			for polygon in polygons # Flattening list of polygons per region
		]
		song["geometry"]["coordinates"] = original_polygons

	#remove entries with nothing in them
	features = [feature for feature in features if len(feature["convertedGeometry"]) != 0]
	music["features"] = features
	# Save the new songs data
	with open("ConvertedGeoJSON.json", "w") as file:
		json.dump(music, file, indent=2)


if __name__ == "__main__":
    main()

