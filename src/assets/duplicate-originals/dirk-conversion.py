from __future__ import division
import json
import requests
import pprint


source_file = "/Users/johnhancock/Desktop/interactives/working/dirk/dirk-career-revamp/src/assets/dirk_shots.txt"

dirk_shots = open(source_file).read()

data = json.loads(dirk_shots)
dirk_geo = {"type": "FeatureCollection",
    "features": []
}

for d in data:

    xfeet = d["shot_xlocation"]
    yfeet = d["shot_ylocation"]

    x_km = xfeet / 3280.4
    y_km = yfeet / 3280.4

    x_geo = x_km / (10000/90)
    y_geo = y_km / (10000/90)

    # x_geo = x_geo * -1
    y_geo = y_geo * -1

    shot_result = "";
    if d["result"] == "Made Shot":
        shot_result = 1
    else:
        shot_result = 0

    shot = {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [x_geo, y_geo]},
        "properties": {
            "gda": d["game_date"], # game date
            "gid": int(d["game_id"]), # game id
            # "p": d["period"], # period
            "r": shot_result, # shot result
            "se_type": d["season_type"],
            "sd": d["shot_distance"], # shot distance
            "sr": d["shot_range"], # shot range
            "st": d["shot_type"], # shot type
            # "shot_value": d["shot_value"],
            # "shot_xlocation": d["shot_xlocation"],
            # "shot_ylocation": d["shot_ylocation"],
            # "shot_zone": d["shot_zone"],
            "y": d["year"], # season
            "opp": d["opponent"], # opponent
            "id": d["id"] # shot id
        }
    }

    # shot = {
    #     "type": "Feature",
    #     "geometry": {"type": "Point", "coordinates": [x_geo, y_geo]},
    #     "properties": {
    #         "game_date": d["game_date"],
    #         "game_id": int(d["game_id"]),
    #         "period": d["period"],
    #         "result": d["result"],
    #         "season_type": d["season_type"],
    #         "shot_distance": d["shot_distance"],
    #         "shot_range": d["shot_range"],
    #         "shot_type": d["shot_type"],
    #         # "shot_value": d["shot_value"],
    #         # "shot_xlocation": d["shot_xlocation"],
    #         # "shot_ylocation": d["shot_ylocation"],
    #         # "shot_zone": d["shot_zone"],
    #         "year": d["year"],
    #         "opponent": d["opponent"],
    #         "id": d["id"]
    #     }
    # }

    dirk_geo["features"].append(shot)

dirk_json = open("/Users/johnhancock/Desktop/interactives/working/dirk/dirk-career-revamp/src/data/dirk_geo_current.json", "w")

json.dump(dirk_geo, dirk_json)

dirk_json.close()







# # years list for each season in Dirk's career
# years = ["1998-99", "1999-00", "2000-01", "2001-02", "2002-03", "2003-04", "2004-05", "2005-06", "2006-07", "2007-08", "2008-09", "2009-10", "2010-11", "2011-12", "2012-13", "2013-14", "2014-15", "2015-16"]
#
# #headers info for requesting from the nba api
# HEADERS = {'user-agent': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) '
#                       'AppleWebKit/537.36 (KHTML, like Gecko) '
#                       'Chrome/45.0.2454.101 Safari/537.36'),
#        'referer': 'http://stats.nba.com/scores/'
#       }
#
# # placeholder list that will hold all the shot data for Dirk's career
# dirk = []
#
#
# # function that will iterate over the seasons of Dirk's career and get the shots for that
# # season, whether it's regular season or post season
#
# def get_shots(year, season_type):
#
#     # shots payload, i.e. the parameters to get what we want from the nba api
#     payload = {
#         "Period": "0",
#         "VsConference": "",
#         "LeagueID": "00",
#         "LastNGames": "0",
#         "TeamID": "0",
#         "PlayerPosition": "",
#         "Location": "",
#         "Outcome": "",
#         "ContextMeasure": "FGA",
#         "DateFrom": "",
#         "StartPeriod": "",
#         "DateTo": "",
#         "OpponentTeamID": "0",
#         "ContextFilter": "",
#         "RangeType": "",
#         "Season": year,
#         "AheadBehind": "",
#         "PlayerID": "1717",
#         "EndRange": "",
#         "VsDivision": "",
#         "PointDiff": "",
#         "RookieYear": "",
#         "GameSegment": "",
#         "Month": "0",
#         "ClutchTime": "",
#         "StartRange": "",
#         "EndPeriod": "",
#         "SeasonType": season_type,
#         "SeasonSegment": "",
#         "GameID": ""
#     }
#
#     # games payload, to get back the info on the games. This is used later to
#     # match up the game ids in the shots info to pull game date and opponent
#     games_payload = {
#         "LeagueID": "00",
#         "PlayerID": "1717",
#         "Season": year,
#         "SeasonType": season_type
#     }
#
#     # defining the requests for the shots and games api
#     r = requests.get("http://stats.nba.com/stats/shotchartdetail", params=payload, headers=HEADERS)
#     s = requests.get("http://stats.nba.com/stats/playergamelog", params=games_payload, headers=HEADERS)
#
#     # converting the response to the above calls to json
#     shot_data = r.json()
#     game_logs = s.json()
#
#
#     # shot_results = shot_data["resultSets"]
#     # shot_sets = shot_results[0]['rowSet']
#
#
#     # targeting the actual shots in the shot data
#     shot_sets = shot_data["resultSets"][0]["rowSet"]
#     # game_results = game_logs["resultSets"]
#     # games = game_results[0]['rowSet']
#
#     # targeting the actual games in the games data
#     games = game_logs["resultSets"][0]["rowSet"]
#
#
#     # for each shot in the shots data
#     for shot in shot_sets:
#
#         # placeholder for the date of the game
#         shotDate = ""
#         teams = ""
#
#         # go through the games data, match up the game id across the games data and
#         # the shot data, then set shotDate to the gameDate
#         for game in games:
#             if game[2] == shot[1]:
#                 shotDate = game[3]
#                 teams = game[4]
#
#
#         # build out the dictionary for the shot
#         current_shot = {
#             "year": year,
#             "season_type": season_type,
#             "game_id": shot[1],
#             "game_date": shotDate,
#             "game_teams": teams,
#             "period": shot[7],
#             "result": shot[10],
#             "shot_type": shot[11],
#             "shot_value": shot[12],
#             "shot_zone": shot[13],
#             "shot_range": shot[15],
#             "shot_distance": shot[16],
#             "shot_xlocation": shot[17],
#             "shot_ylocation": shot[18]
#         }
#
#         # append the shot to the dirk list
#         dirk.append(current_shot)
#
# for year in years:
#
#     get_shots(year, "Regular Season"),
#     get_shots(year, "Playoffs")
#
# ################################################################################
#
# # UN-COMMENT THIS TO DUMP DIRK DATA INTO TXT FILE AGAIN
# dirk_shots = open("/Users/johnhancock/Desktop/interactives/training/pythonTraining/dirk/dirk_shots.txt", "w")
#
# json.dump(dirk, dirk_shots)
#
# dirk_shots.close()
#
# ################################################################################
#
#
# # headers for our shots in the dirk list
# headers = ['year','season type','game id','date','teams','period','result','type','value','zone','range','distance','x_location','y_location']
# data_list = []
#
# for shot in dirk:
#     this_shot = [shot["year"], shot["season_type"], shot["game_id"], shot["game_date"], shot["game_teams"], shot["period"], shot["result"], shot["shot_type"], shot["shot_value"], shot["shot_zone"], shot["shot_range"], shot["shot_distance"], shot["shot_xlocation"], shot["shot_ylocation"]]
#
#     data_list.append(this_shot)
#
# shot_df = pd.DataFrame(data_list, columns=headers)
# # from iPython.display import display
# # with pd.option_context('display.max_columns', None):
# #     display(shot_df.head())
#
#
# sns.set_style("white")
# sns.set_color_codes()
# plt.figure(figsize=(12,11))
# plt.scatter(shot_df.x_location, shot_df.y_location)
# plt.show()


# pprint.pprint(dirk)
# dirk_data = r.json()
#
# # print type(dirk_data)
# #
# # for i in dirk_data:
# #     print i
#
# # dirk_results = dirk_data[]
#
# # print dirk_data["resultSets"]
#
# dirk_results = dirk_data["resultSets"]
#
# dirk_shots = dirk_results[0]['rowSet']
#
# print dirk_shots
#
#
# var dirk = {
#
# }
