from __future__ import division
import csv
import json
import requests

# Start off geojson structure
dirk_geo = {"type": "FeatureCollection",
            "features": []
            }

# Convert existing .csv file
def convertShots():
    print('Converting shots to geojoson...')
    with open('data/dirk-shots.csv') as csvfile:
        reader = csv.DictReader(csvfile)
        for shot in reader:
            # If there's a shot...
            if shot:

                # start conversions
                xfeet = int(shot['shot_xlocation'])
                yfeet = int(shot['shot_ylocation'])

                x_km = xfeet / 3280.4
                y_km = yfeet / 3280.4

                x_geo = x_km / (10000/90)
                y_geo = y_km / (10000/90)

                # x_geo = x_geo * -1
                y_geo = y_geo * -1

                shot_result = ""

                if shot['result'] == "Made Shot":
                    shot_result = 1
                else:
                    shot_result = 0

                shot = {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [x_geo, y_geo]},
                    "properties": {
                        "gda": shot['game_date'],  # game date
                        "gid": int(shot['game_id']),  # game id
                        # "p": shot["period"],  # period
                        "r": shot_result,  # shot result
                        "se_type": shot['season_type'],
                        "sd": shot['shot_distance'],  # shot distance
                        "sr": shot['shot_range'],  # shot range
                        "st": shot['shot_type'],  # shot type
                        # "shot_value": shot[9],
                        # "shot_xlocation": shot[13],
                        # "shot_ylocation": shot["shot_ylocation"],
                        # "shot_zone": shot[10],
                        "y": shot['year'],  # season/year
                        "opp": shot['opponent'],  # opponent
                        "id": shot['id']  # shot id
                    }
                }

                dirk_geo["features"].append(shot)

    # return dirk_geo
    with open('data/dirk-shots.geojson', 'w+') as outfile:
        print('writing geojson...')
        json.dump(dirk_geo, outfile)

if __name__ == '__main__':
    convertShots()
