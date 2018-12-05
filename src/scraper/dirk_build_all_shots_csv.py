# THIS SCRIPT WILL SCRAPE EVERY DIRK SHOT DEFINED IN THE 'years' ARRAY
# AND SAVE THEM LOCALLY INTO A FILE CALLED 'dirk-shots.csv' THIS FILE
# CAN THEN BE ADDED TO THE S3 BUCKET LOCATED AT 'data-store/2018/dirk/dirk-shots.csv'

import json
import requests
from time import sleep
import csv
import random
from random import randint

# years list for each season in Dirk's career
years = ["1998-99", "1999-00", "2000-01", "2001-02", "2002-03", "2003-04", "2004-05", "2005-06", "2006-07", "2007-08", "2008-09", "2009-10", "2010-11", "2011-12", "2012-13", "2013-14", "2014-15", "2015-16", "2016-17", "2017-18"]

# First line of csv payload declares the column heaaders
csv_payload = [["id", "year", "season_type", "game_id", "game_date", "game_teams", "period", "result", "shot_type", "shot_value", "shot_zone", "shot_range", "shot_distance", "shot_xlocation", "shot_ylocation", "opponent"]]

# Initialize the global shot_id variable
shot_id = 0

def get_shots(year, season_type):
    """  Get all of Dirk's shots """

    #  This is what will keep count of each shot.
    global shot_id

    #  Shots payload, i.e. the parameters to get what we want from the nba api
    shots_payload = {
        "AheadBehind": "",
        "ClutchTime": "",
        "ContextFilter": "",
        "ContextMeasure": "FGA",
        "DateFrom": "",
        "DateTo": "",
        "EndPeriod": "",
        "EndRange": "",
        "GameID": "",
        "GameSegment": "",
        "LastNGames": "0",
        "LeagueID": "00",
        "Location": "",
        "Month": "0",
        "OpponentTeamID": "0",
        "Outcome": "",
        "Period": "0",
        "PlayerID": "1717",
        "PlayerPosition": "",
        "PointDiff": "",
        "RangeType": "",
        "RookieYear": "",
        "Season": year,
        "SeasonSegment": "",
        "SeasonType": season_type,
        "StartPeriod": "",
        "StartRange": "",
        "TeamID": "0",
        "VsConference": "",
        "VsDivision": ""
    }

    # games payload, to get back the info on the games. This is used later to
    # match up the game ids in the shots info to pull game date and opponent
    games_payload = {
        "LeagueID": "00",
        "PlayerID": "1717",
        "Season": year,
        "SeasonType": season_type
    }

    # We're going to use this header to get it to work
    headers = {
        'user-agent': ('Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'), # noqa: E501
        'Dnt': ('1'),
        'Accept-Encoding': ('gzip, deflate, sdch'),
        'Accept-Language': ('en'),
        'origin': ('http://stats.nba.com')
        }

    # defining the requests for the shots and games api
    r = requests.get("http://stats.nba.com/stats/shotchartdetail", params=shots_payload, headers=headers, timeout=15)
    r.raise_for_status()

    s = requests.get("http://stats.nba.com/stats/playergamelog", params=games_payload, headers=headers, timeout=15)
    s.raise_for_status()

    # converting the response to the above calls to json
    shot_data = r.json()
    game_logs = s.json()

    # targeting the actual shots in the shot data
    shot_sets = shot_data["resultSets"][0]["rowSet"]

    # targeting the actual games in the games data
    games = game_logs["resultSets"][0]["rowSet"]

    # for each shot in the shots data
    for shot in shot_sets:

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

        # go through the games data, match up the game id across the games data
        # and the shot data, then set shotDate to the gameDate
        for game in games:
            if game[2] == shot[1]:
                shotDate = game[3]
                teams = game[4]

        game_id = shot[1]
        period = shot[7]
        result = shot[10]
        shot_type = shot[11]
        shot_value = shot[12]
        shot_zone = shot[13]
        shot_range = shot[15]
        shot_distance = shot[16]
        shot_xlocation = shot[17]
        shot_ylocation = shot[18]

        csv_payload.append([shot_id, year, season_type, game_id, shotDate, teams, period, result, shot_type, shot_value, shot_zone, shot_range, shot_distance, shot_xlocation, shot_ylocation, opponent])

        # Increment the shot_id
        shot_id += 1

    # Pause so we don't wear out our welcome
    print('pause')
    sleep(randint(5, 15))
    print('resume')

# For each season/year
for year in years:
    print(year)
    # Get regular season shots
    get_shots(year, "Regular Season")
    #  Get Playoffs shots
    get_shots(year, "Playoffs")

#  Once we've cycled through all the years/seasons, write the payload to a csv
with open('data/dirk-shots.csv', 'w') as f:
    writer = csv.writer(f)
    writer.writerows(csv_payload)
