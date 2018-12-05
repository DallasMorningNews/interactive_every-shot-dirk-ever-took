import json
import requests
import pprint
import time
# import matplotlib.pyplot as plt
# import pandas as pd
# import seaborn as sns

# years list for each season in Dirk's career
years = ["1998-99", "1999-00", "2000-01", "2001-02", "2002-03", "2003-04", "2004-05", "2005-06", "2006-07", "2007-08", "2008-09", "2009-10", "2010-11", "2011-12", "2012-13", "2013-14", "2014-15", "2015-16", "2016-17", "2017-18"]

# headers info for requesting from the nba api
HEADERS = {
        'user-agent': ('Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'), # noqa: E501
        'Dnt': ('1'),
        'Accept-Encoding': ('gzip, deflate, sdch'),
        'Accept-Language': ('en'),
        'origin': ('http://stats.nba.com')
        }

# placeholder list that will hold all the shot data for Dirk's career
dirk = []

shot_id = 0
print(shot_id)
# function that will iterate over the seasons of Dirk's career and get the shots for that
# season, whether it's regular season or post season

def get_shots(year, season_type, shot_id):
    # shots payload, i.e. the parameters to get what we want from the nba api
    payload = {
        "Period": "0",
        "VsConference": "",
        "LeagueID": "00",
        "LastNGames": "0",
        "TeamID": "0",
        "PlayerPosition": "",
        "Location": "",
        "Outcome": "",
        "ContextMeasure": "FGA",
        "DateFrom": "",
        "StartPeriod": "",
        "DateTo": "",
        "OpponentTeamID": "0",
        "ContextFilter": "",
        "RangeType": "",
        "Season": year,
        "AheadBehind": "",
        "PlayerID": "1717",
        "EndRange": "",
        "VsDivision": "",
        "PointDiff": "",
        "RookieYear": "",
        "GameSegment": "",
        "Month": "0",
        "ClutchTime": "",
        "StartRange": "",
        "EndPeriod": "",
        "SeasonType": season_type,
        "SeasonSegment": "",
        "GameID": ""
    }

    # games payload, to get back the info on the games. This is used later to
    # match up the game ids in the shots info to pull game date and opponent
    games_payload = {
        "LeagueID": "00",
        "PlayerID": "1717",
        "Season": year,
        "SeasonType": season_type
    }

    # defining the requests for the shots and games api
    r = requests.get("http://stats.nba.com/stats/shotchartdetail", params=payload, headers=HEADERS, timeout=15)
    r.raise_for_status()
    s = requests.get("http://stats.nba.com/stats/playergamelog", params=games_payload, headers=HEADERS, timeout=15)
    s.raise_for_status()

    # converting the response to the above calls to json
    shot_data = r.json()
    game_logs = s.json()


    # shot_results = shot_data["resultSets"]
    # shot_sets = shot_results[0]['rowSet']


    # targeting the actual shots in the shot data
    shot_sets = shot_data["resultSets"][0]["rowSet"]
    # game_results = game_logs["resultSets"]
    # games = game_results[0]['rowSet']

    # targeting the actual games in the games data
    games = game_logs["resultSets"][0]["rowSet"]

    # for each shot in the shots data
    for shot in shot_sets:

        print(shot_id)
        # placeholder for the date of the game
        shotDate = ""
        teams = ""
        opponent = ""

        if shot[22] == "NOK":
            opponent = "NOH"
        elif shot[23] == "NOK":
            opponent = "NOH"
        elif shot[22] == "DAL":
            opponent = shot[23]
        else:
            opponent = shot[22]

        # go through the games data, match up the game id across the games data and
        # the shot data, then set shotDate to the gameDate
        for game in games:
            if game[2] == shot[1]:
                shotDate = game[3]
                teams = game[4]


        # build out the dictionary for the shot
        current_shot = {
            "id": shot_id,
            "year": year,
            "season_type": season_type,
            "game_id": shot[1],
            "game_date": shotDate,
            "game_teams": teams,
            "period": shot[7],
            "result": shot[10],
            "shot_type": shot[11],
            "shot_value": shot[12],
            "shot_zone": shot[13],
            "shot_range": shot[15],
            "shot_distance": shot[16],
            "shot_xlocation": shot[17],
            "shot_ylocation": shot[18],
            "opponent": opponent
        }

        shot_id += 1
        # append the shot to the dirk list
        dirk.append(current_shot)

    print('pause')
    time.sleep(10)
    print('resume')
    return shot_id

for year in years:
    print(year)
    shot_id = get_shots(year, "Regular Season", shot_id)
    shot_id = get_shots(year, "Playoffs", shot_id)

################################################################################

# UN-COMMENT THIS TO DUMP DIRK DATA INTO TXT FILE AGAIN
dirk_shots = open("/Users/johnhancock/Desktop/interactives/working/dirk/dirk-career-revamp/src/assets/dirk_shots.txt", "w")

json.dump(dirk, dirk_shots)

dirk_shots.close()

################################################################################


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
