#i didn't test this after making changes coz my internet sucks, but it should work. sorry.

import requests
import re
import json
from bs4 import BeautifulSoup
import os

def extract_kartographer_data(page_name):
    page_name = page_name.lstrip()
    page_name = page_name.rstrip()
    url = f"https://oldschool.runescape.wiki/w/{page_name.replace(' ', '_')}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Failed to fetch page: {response.status_code}")
        return None

    # Find the start of the JSON object
    start = response.text.find('"wgKartographerLiveData":')
    if start == -1:
        print("wgKartographerLiveData not found in: ", page_name, "\n")
        return None

    # Extract text from the start of the object
    substring = response.text[start + len('"wgKartographerLiveData":'):]

    #match brackets
    brace_count = 0
    json_str = ''
    for c in substring.strip():
        json_str += c
        if c == '{':
            brace_count += 1
        elif c == '}':
            brace_count -= 1
            if brace_count == 0:
                break

    try:
        data = json.loads(json_str)
        return data
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return None
    
def get_non_holiday_tracks():
    url = "https://oldschool.runescape.wiki/w/Music"
    headers = {
        "User-Agent": "///"
    }

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    tracks = []

    # Loop over all rows with a data-music-track-name attribute
    for row in soup.find_all("tr", attrs={"data-music-track-name": True}):
        # Check if first <td> contains <i> tag (which indicates a holiday track)
        first_td = row.find("td")
        if first_td.find("i"):  # Holiday track
            continue

        track_name = first_td.find("a")["title"]
        tracks.append(track_name)

    return tracks


def scrape_geojson(data):

    geojsondata = []

    if True:
        for i, page in enumerate(data):
            page_title = page

            result = extract_kartographer_data(page_title)
            if result:
                geojsondata.append({'title': page_title, 'data': result})


        with open(f'GeoJSONCombined.json', 'w') as f:
            json.dump(geojsondata, f, indent=2)
            print("Saved combined geojson")


data = get_non_holiday_tracks()
scrape_geojson(data)