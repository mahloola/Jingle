# Definitions dumped by RuneLite have been written in a few ways

# See the old style and definitions here:
# https://gist.github.com/TWCCarlson/894da8faed7a9f22ec0c11a5c10bf2ba
# https://github.com/runelite/runelite/commit/2890125e45f1c7a2d1bc740758fd653cd0e188d6#diff-39e9d252b7e16ca4b59f54e0c9d518b97cd112d5d17684b292bb73ad59e7cd20

# The current strategy employs the use of Square (64x64 tiles) and 
# Zone (8x8 tiles) definitions, split into separate files per MapID:
# Square: https://gist.github.com/TWCCarlson/99936eee7f6728680bde4cb164e0609e
# Zone: https://gist.github.com/TWCCarlson/23c32818ffaa4a77b8eae41754708524

# This file provides utility functions that convert from one to the other
# Results may not be indentical .json files but should yield identical results
# when rendered, with limitations on groupID and fileID.

# At time of writing groupID is used for placement priority. FileID is unused.

import json
import pprint

# CASE 0 
{
    "chunk_xHigh": 7,
    "xLow": 46,
    "chunk_xLow": 7,
    "yLow": 153,
    "xHigh": 46,
    "numberOfPlanes": 1,
    "plane": 0,
    "chunk_yLow": 0,
    "yHigh": 153,
    "chunk_yHigh": 0
}
# Renders in-place
# Chunk indictes zone granularity
# Low indicates lesser X/Y
# High indicates greater X/Y

# CASE 1
{
    "numberOfPlanes": 1,
    "xLowerLeft": 45,
    "yLowerLeft": 99,
    "xLowerRight": 46,
    "yLowerRight": 99, ### MISNAMED?
    "xUpperLeft": 45,      # SWAP THESE?
    "yUpperLeft": 100, ### MISNAMED?
    "xUpperRight": 46,
    "plane": 2,
    "yUpperRight": 100
}
# Lower indicates source
# Upper indicates display
# Left indicates the lesser X/Y value
# Right indicates the greater X/Y value
# Origin is (0,0) bottom left

# CASE 2
{
    "xLow": 58,
    "numberOfPlanes": 1,
    "yLow": 146,
    "xHigh": 58,
    "yHigh": 146,
    "plane": 0
}
# Lower indicates source
# Upper indicates display
# Origin is (0,0 bottom left)

# CASE 3
{
    "chunk_oldXHigh": 7,
    "numberOfPlanes": 1,
    "oldX": 46,
    "chunk_oldYHigh": 7,
    "newX": 46,
    "newY": 153,
    "chunk_oldXLow": 2,
    "oldY": 153,
    "chunk_newYLow": 1,
    "chunk_oldYLow": 1,
    "chunk_newXLow": 2,
    "oldPlane": 0,
    "chunk_newXHigh": 7,
    "chunk_newYHigh": 7
}
# Old indicates source
# New indicates display
# Chunk indicates zone granularity
# Low indicates the lesser X/Y
# High indicates the greater X/Y

import sys

def unpackWorldMapType0(wmd: dict):
    defDict = dict()
    defDict["chunk_xHigh"] = wmd["chunk_xHigh"]
    defDict["xLow"] = wmd["xLow"]
    defDict["chunk_xLow"] = wmd["chunk_xLow"]
    defDict["zLow"] = wmd["yLow"]
    defDict["xHigh"] = wmd["xHigh"]
    defDict["numberOfPlanes"] = wmd["numberOfPlanes"]
    defDict["plane"] = wmd["plane"]
    defDict["chunk_zLow"] = wmd["chunk_yLow"]
    defDict["zHigh"] = wmd["yHigh"]
    defDict["chunk_zHigh"] = wmd["chunk_yHigh"]
    return defDict

def unpackWorldMapType1(wmd: dict):
    defDict = dict()
    defDict["plane"] = wmd["plane"]
    defDict["numberOfPlanes"] = wmd["numberOfPlanes"]
    defDict["xLowerLeft"] = wmd["xLowerLeft"]
    defDict["zLowerLeft"] = wmd["yLowerLeft"]
    defDict["xLowerRight"] = wmd["xLowerRight"]
    defDict["zUpperLeft"] = wmd["yUpperLeft"]
    defDict["xUpperLeft"] = wmd["xUpperLeft"]
    defDict["zLowerRight"] = wmd["yLowerRight"]
    defDict["xUpperRight"] = wmd["xUpperRight"]
    defDict["zUpperRight"] = wmd["yUpperRight"]
    return defDict

def unpackWorldMapType2(wmd: dict):
    defDict = dict()
    defDict["plane"] = wmd["plane"]
    defDict["numberOfPlanes"] = wmd["numberOfPlanes"]
    defDict["xLow"] = wmd["xLow"]
    defDict["zLow"] = wmd["yLow"]
    defDict["xHigh"] = wmd["xHigh"]
    defDict["zHigh"] = wmd["yHigh"]
    return defDict

def unpackWorldMapType3(wmd: dict):
    defDict = dict()
    defDict["oldPlane"] = wmd["oldPlane"]
    defDict["numberOfPlanes"] = wmd["numberOfPlanes"]
    defDict["oldX"] = wmd["oldX"]
    defDict["oldZ"] = wmd["oldY"]
    defDict["chunk_oldXLow"] = wmd["chunk_oldXLow"]
    defDict["chunk_oldZLow"] = wmd["chunk_oldYLow"]
    defDict["chunk_oldXHigh"] = wmd["chunk_oldXHigh"]
    defDict["chunk_oldZHigh"] = wmd["chunk_oldYHigh"]
    defDict["newX"] = wmd["newX"]
    defDict["newZ"] = wmd["newY"]
    defDict["chunk_newXLow"] = wmd["chunk_newXLow"]
    defDict["chunk_newZLow"] = wmd["chunk_newYLow"]
    defDict["chunk_newXHigh"] = wmd["chunk_newXHigh"]
    defDict["chunk_newZHigh"] = wmd["chunk_newYHigh"]
    return defDict

def unpackWorldMapDef(wmd):
    possibleTypes = {"0": unpackWorldMapType0, 
                     "1": unpackWorldMapType1, 
                     "2": unpackWorldMapType2, 
                     "3": unpackWorldMapType3}
    for type, unpacker in possibleTypes.items():
        try:
            unpackedDef = unpacker(wmd)
            break
        except:
            pass
    else:
        raise AttributeError(f"Def not of valid types: \n{wmd}")
    return unpackedDef, type


def createCompositeDefs_FromWMD0(wmd, id):
    # Selects a set of squares (in a rectangle) and zones to render in place
    minLevel = wmd["plane"]
    levels = wmd["numberOfPlanes"]
    lowerSquareX = wmd["xLow"]
    lowerSquareZ = wmd["zLow"]
    upperSquareX = wmd["xHigh"]
    upperSquareZ = wmd["zHigh"]
    lowerZoneX = wmd["chunk_xLow"]
    lowerZoneZ = wmd["chunk_zLow"]
    upperZoneX = wmd["chunk_xHigh"]
    upperZoneZ = wmd["chunk_zHigh"]
    defsList = list()
    for sqX in range(lowerSquareX, upperSquareX+1):
        for sqZ in range(lowerSquareZ, upperSquareZ+1):
            for znX in range(lowerZoneX, upperZoneX+1):
                for znZ in range(lowerZoneZ, upperZoneZ+1):
                    zoneDef = {
                        "minLevel": minLevel,
                        "levels": levels,
                        "sourceSquareX": sqX,
                        "sourceSquareZ": sqZ,
                        "displaySquareX": sqX,
                        "displaySquareZ": sqZ,
                        "sourceZoneX": znX,
                        "sourceZoneZ": znZ,
                        "displayZoneX": znX,
                        "displayZoneZ": znZ,
                        "groupId": id,
                        "fileId": 0,
                        "WMD_type": 0
                    }
                    defsList.append(zoneDef)
    return defsList


def createCompositeDefs_FromWMD1(wmd, id):
    # Selects a set of squares (in a rectangle) to render in place
    lowerLeftX = wmd["xLowerLeft"]
    lowerLeftZ = wmd["zLowerLeft"]
    lowerRightX = wmd["xLowerRight"]
    lowerRightZ = wmd["zLowerRight"]
    upperLeftX = wmd["xUpperLeft"]
    upperLeftZ = wmd["zUpperLeft"]
    upperRightX = wmd["xUpperRight"]
    upperRightZ = wmd["zUpperRight"]
    minLevel = wmd["plane"]
    levels = wmd["numberOfPlanes"]
    defsList = list()
    for x in range(lowerLeftX, lowerRightX+1):
        for z in range(lowerLeftZ, upperLeftZ+1):
            squareDef = {
                "minLevel": minLevel,
                "levels": levels,
                "sourceSquareX": x,
                "sourceSquareZ": z,
                "displaySquareX": x,
                "displaySquareZ": z,
                "groupId": id,
                "fileId": 0,
                "WMD_type": 1
            }
            defsList.append(squareDef)
    return defsList
    

def createCompositeDefs_FromWMD2(wmd, id):
    # # Selects a set of squares (in a rectangle) to render in place
    # minLevel = wmd["plane"]
    # levels = wmd["numberOfPlanes"]
    # sourceLowerX = wmd["xLow"]
    # sourceLowerZ = wmd["zLow"]
    # sourceUpperX = wmd["xHigh"]
    # sourceUpperZ = wmd["zHigh"]
    # defsList = list()
    # for x in range(sourceLowerX, sourceUpperX+1):
    #     for z in range(sourceLowerZ, sourceUpperZ+1):
    #         squareDef = {
    #             "minLevel": minLevel,
    #             "levels": levels,
    #             "sourceSquareX": x,
    #             "sourceSquareZ": z,
    #             "displaySquareX": x,
    #             "displaySquareZ": z,
    #             "groupId": id,
    #             "fileId": 0,
    #             "WMD_type": 2
    #         }
    #         defsList.append(squareDef)
    defsList = list()
    squareDef = {
        "minLevel": wmd["plane"],
        "levels": wmd["numberOfPlanes"],
        "sourceSquareX": wmd["xLow"],
        "sourceSquareZ": wmd["zLow"],
        "displaySquareX": wmd["xHigh"],
        "displaySquareZ": wmd["zHigh"],
        "groupId": id,
        "fileId": 0,
        "WMD_type": 2
    }
    defsList.append(squareDef)
    return defsList


def createCompositeDefs_FromWMD3(wmd, id):
    minLevel = wmd["oldPlane"]
    levels = wmd["numberOfPlanes"]
    sourceSquareX = wmd["oldX"]
    sourceSquareZ = wmd["oldZ"]
    displaySquareX = wmd["newX"]
    displaySquareZ = wmd["newZ"]
    sourceLowerZoneX = wmd["chunk_oldXLow"]
    sourceLowerZoneZ = wmd["chunk_oldZLow"]
    sourceUpperZoneX = wmd["chunk_oldXHigh"]
    sourceUpperZoneZ = wmd["chunk_oldZHigh"]
    displayLowerZoneX = wmd["chunk_newXLow"]
    displayLowerZoneZ = wmd["chunk_newZLow"]
    displayUpperZoneX = wmd["chunk_newXHigh"]
    displayUpperZoneZ = wmd["chunk_newZHigh"]
    defsList = list()
    for x in range(sourceLowerZoneX, sourceUpperZoneX+1):
        for z in range(sourceLowerZoneZ, sourceUpperZoneZ+1):
            zoneDef = {
                "minLevel": minLevel,
                "levels": levels,
                "sourceSquareX": sourceSquareX,
                "sourceSquareZ": sourceSquareZ,
                "displaySquareX": displaySquareX,
                "displaySquareZ": displaySquareZ,
                "sourceZoneX": x,
                "sourceZoneZ": z,
                "displayZoneX": x-sourceLowerZoneX + displayLowerZoneX,
                "displayZoneZ": z-sourceLowerZoneZ + displayLowerZoneZ,
                "groupId": id,
                "fileId": 0,
                "WMD_type": 3
            }
            defsList.append(zoneDef)
    return defsList

def createCompositeDefs_FromWorldMapDef(wmd, type, id):
    squareDefs = list()
    zoneDefs = list()
    if type == "0":
        zoneDefs.extend(createCompositeDefs_FromWMD0(wmd, id))
    elif type == "1":
        squareDefs.extend(createCompositeDefs_FromWMD1(wmd, id))
    elif type == "2":
        squareDefs.extend(createCompositeDefs_FromWMD2(wmd, id))
    elif type == "3":
        zoneDefs.extend(createCompositeDefs_FromWMD3(wmd, id))
    return squareDefs, zoneDefs


def WorldMapDef_to_CompositeMapDef(filePath):
    with open(filePath) as defsFile:
        defs = json.load(defsFile) # type: list[dict]

    count = {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0
    }

    defnList = list()
    for mapDefs in defs:
        mapID = mapDefs["fileId"]
        newDef = dict()
        newDef["fileId"] = mapID
        try:
            newDef["name"] = mapDefs["name"]
            # newDef["name"] = ID_NAME_CENTER_MAP[str(mapID)][0]
        except KeyError:
            newDef["name"] = f"Unknown - {mapID}"
        newDef["mapSquareDefinitions"] = list()
        newDef["zoneDefinitions"] = list()
        for i, defn in enumerate(mapDefs.get("regionList"), 0):
            # Unload (and correct) the data while determining type
            data, wmd_type = unpackWorldMapDef(defn)

            if wmd_type == "0":
                count[wmd_type] += 1
            elif wmd_type == "1":
                count[wmd_type] += 1
            elif wmd_type == "2":
                count[wmd_type] += 1
            elif wmd_type == "3":
                count[wmd_type] += 1

            defn["wmd_type"] = int(wmd_type)
            sqDefs, znDefs = createCompositeDefs_FromWorldMapDef(data, wmd_type, 
                                                                 i)
            newDef["mapSquareDefinitions"].extend(sqDefs)
            newDef["zoneDefinitions"].extend(znDefs)
        defnList.append(newDef)
    
    # Write the resulting defs to disk
    # with open(f"osrs-wiki-maps/out/mapgen/versions/2024-05-29_a/worldMapDefinitions-typed.json", 'w') as f:
    #     json.dump(defs, f)
    # with open(f"osrs-wiki-maps/out/mapgen/versions/2024-05-29_a/wikiWorldMapDefinitions-fromOld.json", 'w') as f:
    #     json.dump(defnList, f)
    # with open(f"scripts/user_world_defs-conv.json", 'w') as f:
    #     json.dump(defnList, f)
    with open("user_world_defs.json", 'w') as f:
        json.dump(defnList, f)


ID_NAME_CENTER_MAP = {
    "-1": ('debug', (2656, 6912)),
    "0": ('Gielinor Surface', (3232, 3232)),
    "1": ('Ancient Cavern', (1760, 5344)),
    "2": ('Ardougne Underground', (2575, 9694)),
    "3": ('Asgarnia Ice Cave', (2989, 9566)),
    "4": ('Braindeath Island', (2144, 5101)),
    "5": ('Dorgesh-Kaan', (2720, 5344)),
    "6": ('Dwarven Mines', (3040, 9824)),
    "7": ('God Wars Dungeon', (2880, 5312)),
    "8": ('Ghorrock Prison', (2935, 6391)),
    "10": ('Keldagrim', (2879, 10176)),
    "12": ('Misthalin Underground', (3168, 9632)),
    "13": ('Mole Hole', (1760, 5183)),
    "14": ('Morytania Underground', (3479, 9837)),
    "15": ("Mos Le'Harmless Cave", (3775, 9407)),
    "16": ('Ourania Altar', (3040, 5600)),
    "17": ('Fremennik Slayer Cave', (2784, 10016)),
    "18": ('Stronghold of Security', (1888, 5216)),
    "19": ('Stronghold Underground', (2432, 9812)),
    "20": ('Taverley Underground', (2912, 9824)),
    "21": ("Tolna's Rift", (3104, 5280)),
    "22": ('Troll Stronghold', (2822, 10087)),
    "23": ('Mor Ul Rek', (2489, 5118)),
    "24": ('Lair of Tarn Razorlor', (3168, 4564)),
    "25": ('Waterbirth Dungeon', (2495, 10144)),
    "26": ('Wilderness Dungeons', (3040, 10303)),
    "27": ('Yanille Underground', (2580, 9522)),
    "28": ('Zanaris', (2447, 4448)),
    "29": ('Prifddinas', (3263, 6079)),
    "30": ('Fossil Island Underground', (3744, 10272)),
    "31": ('Feldip Hills Underground', (1989, 9023)),
    "32": ('Kourend Underground', (1664, 10048)),
    "33": ('Kebos Underground', (1266, 10206)),
    "34": ('Prifddinas Underground', (3263, 12479)),
    "35": ('Prifddinas Grand Library', (2623, 6143)),
    "36": ('LMS Desert Island', (3456, 5824)),
    "37": ('Tutorial Island', (1695, 6111)),
    "38": ('LMS Wild Varrock', (3552, 6120)),
    "39": ('Ruins of Camdozaal', (2952, 5766)),
    "40": ('The Abyss', (3040, 4832)),
    "41": ('Lassar Undercity', (2656, 6368)),
    "42": ('Kharidian Desert Underground', (3488, 9504)),
    "43": ('Varlamore Underground', (1696, 9504)),
    "44": ('Cam Torum', (1440, 9568)),
    "45": ('Neypotzli', (1440, 9632)),
    "46": ('Church of Ayaster', ()),
    "47": ('Ayaster Crypt', ()),
    "48": ('Easter Workshop', ()),
    "10000": ('Abandoned Mine - Level 1', (3424, 9632)),
    "10001": ('Abandoned Mine - Level 2', (2784, 4576)),
    "10002": ('Abandoned Mine - Level 3', (2720, 4512)),
    "10003": ('Abandoned Mine - Level 4', (2784, 4512)),
    "10004": ('Abandoned Mine - Level 5', (2720, 4448)),
    "10005": ('Abandoned Mine - Level 6', (2784, 4448)),
    "10006": ('Abyss', (3040, 4800)),
    "10007": ('Abyssal Area', (3040, 4896)),
    "10008": ('Ah Za Rhoon', (2912, 9344)),
    "10009": ('Air altar', (2848, 4832)),
    "10010": ('Airship platform', (2080, 5408)),
    "10011": ('Ancient Cavern (unlit)', (1632, 5312)),
    "10012": ('Ancient Cavern lighting area', (1568, 4896)),
    "10013": ('Another Slice of H.A.M. Sigmund fight area', (2528, 5568)),
    "10014": ('Ape Atoll Dungeon', (2752, 9120)),
    "10015": ('Ardougne (Song of the Elves)', (3360, 5920)),
    "10016": ('Ardougne Sewer (Plague City)', (2528, 9760)),
    "10017": ("Baba Yaga's house", (2464, 4640)),
    "10018": ('Banana plantation (Ape Atoll)', (2720, 9184)),
    "10019": ('Barbarian Assault', (1888, 5440)),
    "10020": ('Barbarian Assault lobby', (2592, 5280)),
    "10021": ('Barrows crypts', (3552, 9696)),
    "10022": ('Blast Furnace', (1952, 4960)),
    "10023": ('Boots of lightness areas', (2656, 9760)),
    "10024": ("Bouncer's Cave", (1760, 4704)),
    "10025": ('Brimhaven Agility Arena', (2784, 9568)),
    "10026": ('Brine Rat Cavern', (2720, 10144)),
    "10027": ("Bryophyta's lair", (3232, 9952)),
    "10028": ('Burthorpe Games Room', (2208, 4960)),
    "10029": ('Cabin Fever boats', (1824, 4832)),
    "10030": ("Cerberus's Lair", (1312, 1280)),
    "10031": ("Corporeal Beast's lair", (2976, 4256)),
    "10032": ('Cosmic altar', (2144, 4832)),
    "10033": ("Cosmic entity's plane", (2080, 4832)),
    "10034": ('Courtroom', (1824, 4256)),
    "10035": ('Crandor Lab', (2848, 9696)),
    "10036": ('Crash Site Cavern', (2112, 5664)),
    "10037": ('Creature Creation', (3040, 4384)),
    "10038": ('Daeyalt Essence mine', (3680, 9760)),
    "10039": ('Death altar', (2208, 4832)),
    "10040": ('Desert Eagle Lair', (3424, 9568)),
    "10041": ('Desert Mining Camp dungeon', (3296, 9440)),
    "10042": ('Digsite Dungeon (rocks blown up)', (3360, 9760)),
    "10043": ('Digsite Dungeon (rocks intact)', (3360, 9824)),
    "10044": ("Dondakan's mine (during quest)", (2368, 4960)),
    "10045": ('Dorgesh-Kaan South Dungeon', (2720, 5216)),
    "10046": ('Dragon Slayer boats', (2080, 5536)),
    "10047": ('Dream World - challenges', (1760, 5088)),
    "10048": ('Dream World - Dream Mentor', (1824, 5152)),
    "10049": ('Dream World - Me', (1824, 5088)),
    "10050": ('Drill Demon', (3168, 4832)),
    "10051": ("Eadgar's cave", (2912, 10080)),
    "10052": ("Eagles' Peak Dungeon", (2016, 4960)),
    "10053": ('Elemental Workshop', (2720, 9888)),
    "10054": ("Enakhra's Temple", (3104, 9312)),
    "10055": ('Enchanted Valley', (3040, 4512)),
    "10056": ('Enlightened Journey crash areas', (1824, 4896)),
    "10057": ("Evil Bob's Island", (2528, 4768)),
    "10058": ("Evil Chicken's Lair", (2464, 4384)),
    "10059": ('Evil Twin', (1888, 5152)),
    "10060": ('Eyes of Glouphrie war cutscene', (2144, 4960)),
    "10061": ('Fairy Resistance Hideout', (2336, 4448)),
    "10062": ('Fisher Realm (diseased)', (2784, 4704)),
    "10063": ('Fisher Realm (healthy)', (2656, 4704)),
    "10064": ('Fishing Trawler', (1952, 4832)),
    "10065": ('Fishing Trawler', (1888, 4832)),
    "10066": ('Fishing Trawler', (2016, 4832)),
    "10067": ('Fossil Island boat', (1824, 4768)),
    "10068": ('Fragment of Seren fight', (3296, 5920)),
    "10069": ('Freaky Forester', (2592, 4768)),
    "10070": ('Genie cave', (3360, 9312)),
    "10071": ("Glarial's Tomb", (2528, 9824)),
    "10072": ('Goblin cook', (2976, 9888)),
    "10073": ('Gorak Plane', (3040, 5344)),
    "10074": ('H.A.M. Store room', (2592, 5216)),
    "10075": ('Hallowed Sepulchre - Level 1', (2272, 5984)),
    "10076": ('Hallowed Sepulchre starting area', (2400, 5984)),
    "10077": ('Harmony Island lower level', (3808, 9248)),
    "10078": ('Isafdar (Song of the Elves)', (2784, 6112)),
    "10079": ('Jaldraocht Pyramid - Level 1', (2912, 4960)),
    "10080": ('Jaldraocht Pyramid - Level 2', (2848, 4960)),
    "10081": ('Jaldraocht Pyramid - Level 3', (2784, 4960)),
    "10082": ('Jaldraocht Pyramid - Level 4', (3232, 9312)),
    "10083": ('Jatizso mine', (2400, 10208)),
    "10084": ('Jiggig Dungeon', (2464, 9408)),
    "10085": ('Jungle Eagle lair/Red chinchompa hunting ground', (2528, 9312)),
    "10086": ('Karamjan Temple', (2848, 9280)),
    "10087": ('Keep Le Faye (instance)', (1696, 4256)),
    "10088": ('Keldagrim Rat Pits', (1952, 4704)),
    "10089": ('Killerwatt Plane', (2656, 5216)),
    "10090": ("King's Ransom dungeon", (1888, 4256)),
    "10091": ('Kiss the frog', (2464, 4768)),
    "10092": ("Klenter's Pyramid", (3296, 9184)),
    "10093": ("Kruk's Dungeon", (2496, 9152)),
    "10094": ('Lady Trahaern hideout', (2336, 9568)),
    "10095": ('Library Historical Archive', (1568, 10208)),
    "10096": ('Lighthouse cutscene', (2464, 4576)),
    "10097": ('Lighthouse Dungeon', (2528, 10016)),
    "10098": ('Lighthouse Dungeon (cutscene)', (2528, 4640)),
    "10099": ('Lithkren Vault', (1568, 5088)),
    "10100": ('Lithkren Vault entrance (during quest)', (3552, 10400)),
    "10101": ('Lithkren Vault entrance (post-quest)', (3552, 10464)),
    "10102": ('Lizardman Temple', (1312, 10080)),
    "10103": ('Lumbridge Castle (Recipe for Disaster)', (1888, 5344)),
    "10104": ('Mage Training Arena rooms', (3360, 9664)),
    "10105": ('Maniacal monkey hunter area', (2912, 9120)),
    "10106": ('Meiyerditch Laboratories', (3584, 9760)),
    "10107": ('Meiyerditch Mine', (2400, 4640)),
    "10108": ('Mime', (2016, 4768)),
    "10109": ('Misthalin Mystery', (1664, 4832)),
    "10110": ('Mogre Camp', (2976, 9504)),
    "10111": ('Monkey Madness hangar (post-quest)', (2656, 4512)),
    "10112": ('Monkey Madness hangar and Bonzara', (2400, 9888)),
    "10113": ('Mourner Tunnels', (1952, 4640)),
    "10114": ('Mouse hole', (2272, 5536)),
    "10115": ("My Arm's Big Adventure boat cutscene", (1888, 4896)),
    "10116": ('Myreque Hideout (Burgh de Rott)', (3488, 9632)),
    "10117": ('Myreque Hideout (Canifis)', (3456, 9856)),
    "10118": ('Myreque Hideout (Meiyerditch)', (3616, 9632)),
    "10119": ('Nature altar', (2400, 4832)),
    "10120": ('Nightmare of Ashihama', (3872, 9952)),
    "10121": ('North-east Karamja cutscene', (2528, 4576)),
    "10122": ('Observatory Dungeon', (2336, 9376)),
    "10123": ('Ogre Enclave', (2592, 9440)),
    "10124": ('Old School Museum', (3040, 9952)),
    "10125": ('Paterdomus Temple underground', (3424, 9888)),
    "10126": ('Polar Eagle lair', (2720, 10208)),
    "10127": ('Prison Pete', (2080, 4448)),
    "10128": ('Puro-Puro', (2592, 4320)),
    "10129": ('Pyramid Plunder', (1952, 4448)),
    "10130": ('Quidamortem Cave', (1184, 9952)),
    "10131": ('Quiz Master', (1952, 4768)),
    "10132": ("Rantz's cave", (2656, 9376)),
    "10133": ("Rashiliyia's Tomb", (2912, 9504)),
    "10134": ('Ratcatchers Mansion', (2848, 5088)),
    "10135": ('Recipe for Disaster Ape Atoll Dungeon', (3040, 5472)),
    "10136": ('Recruitment Drive', (2464, 4960)),
    "10137": ("Rogues' Den", (3008, 5024)),
    "10138": ("Saba's cave", (2272, 4768)),
    "10139": ('Shadow Dungeon', (2688, 5088)),
    "10140": ('Skavid caves', (2528, 9440)),
    "10141": ('Smoke Dungeon', (3264, 9376)),
    "10142": ('Sophanem bank', (2784, 5152)),
    "10143": ('Sophanem Dungeon', (3264, 9248)),
    "10144": ("Sorceress's Garden", (2912, 5472)),
    "10145": ('Surprise Exam', (1888, 5024)),
    "10146": ('Tears of Guthix cave', (3232, 9504)),
    "10147": ('Temple of Ikov', (2688, 9856)),
    "10148": ('Temple of Marimbo Dungeon', (2784, 9184)),
    "10149": ('Temple Trekking', (2080, 5024)),
    "10150": ("Thammaron's throne room", (2720, 4896)),
    "10151": ('The Grand Tree - Monkey Madness II', (1984, 5568)),
    "10152": ("The Kendal's cave", (2784, 10080)),
    "10153": ('Train station', (2464, 5536)),
    "10154": ('Tree Gnome Village dungeon', (2528, 9568)),
    "10155": ('Tree Gnome Village dungeon (instance)', (2592, 4448)),
    "10156": ('Troll arena - Trollheim tunnel', (2912, 10016)),
    "10157": ('Trollweiss Dungeon', (2784, 10208)),
    "10158": ('Tunnel of Chaos', (3168, 5216)),
    "10159": ('Tutorial Island dungeon', (3104, 9504)),
    "10160": ('Tyras Camp cutscene', (2336, 4576)),
    "10161": ('Underground Pass - bottom level', (2336, 9856)),
    "10162": ('Underground Pass - bottom level (Song of the Elves instance)', (2464, 6144)),
    "10163": ('Underground Pass - first level', (2432, 9696)),
    "10164": ("Underground Pass - Iban's Temple (post-quest)", (2016, 4704)),
    "10165": ('Underground Pass - platforms', (2144, 4640)),
    "10166": ('Underground Pass - second level', (2400, 9600)),
    "10167": ('Underground Pass - swamp fail and final area', (2464, 9632)),
    "10168": ('Ungael Laboratory', (2272, 10464)),
    "10169": ('Uzer Dungeon', (2720, 4896)),
    "10170": ('Varrock Museum basement (higher)', (1760, 4960)),
    "10171": ('Varrock Museum basement (lower)', (1632, 4960)),
    "10172": ('Varrock Rat Pits', (2912, 5088)),
    "10173": ('Viyeldi caves (lower level)', (2400, 4704)),
    "10174": ('Viyeldi caves (upper level)', (2784, 9312)),
    "10175": ('Water Ravine Dungeon', (3360, 9568)),
    "10176": ('Waterfall Dungeon', (2592, 9888)),
    "10177": ('Waterfall Dungeon (water)', (2528, 9888)),
    "10178": ('Wilderness Wars', (3296, 4640)),
    "10179": ('Witchaven Dungeon', (2336, 5088)),
    "10180": ('Wrath altar', (2336, 4832)),
    "10181": ('Yanille cutscene', (2912, 4704)),
    "10182": ('Tutorial Island v2 dungeon', (1696, 12512)),
    "10183": ('Prifddinas Grand Library (post-quest)', (3232, 12512)),
    "10184": ('Temple Trekking', (2848, 4576)),
    "10185": ('Prifddinas rabbit cave', (3296, 12576)),
    "10186": ('Hallowed Sepulchre - Level 5', (2272, 5856)),
    "10187": ('Hallowed Sepulchre - Level 2', (2528, 5984)),
    "10188": ('Hallowed Sepulchre - Level 4', (2528, 5856)),
    "10189": ('Hallowed Sepulchre - Level 3', (2400, 5824)),
    "10190": ('Ardougne Prison', (2592, 9696)),
    "10191": ('Dragon Slayer II boat', (1632, 5600))
}


if __name__ == "__main__":
    args = sys.argv
    # args[0] = current file
	# args[1] = function name
	# args[2] = file to translate
    # globals()[args[1]](args[2])
    # WorldMapDef_to_CompositeMapDef(f"osrs-wiki-maps/out/mapgen/versions/2024-05-29_a/worldMapDefinitions.json")
    WorldMapDef_to_CompositeMapDef(f"./world_defs.json")