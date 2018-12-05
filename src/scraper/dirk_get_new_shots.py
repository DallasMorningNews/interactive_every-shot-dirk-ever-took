"""Get Dirk's newest shots and add them to the .csv."""
import requests
import csv
from datetime import datetime

# Set season name
season = "2018-19"
seasonString = "Regular Season"  # Options include "Regular Season", "Playoffs" and "Pre Season"

# This is what will hold the last game date.
# last_game_date = ''
# last_game_shot_id = 0

# We're going to use this header to spoof NBA stats site
headers = {
    'user-agent': ('Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'), # noqa: E501
    'Dnt': ('1'),
    'Accept-Encoding': ('gzip, deflate, sdch'),
    'Accept-Language': ('en'),
    'origin': ('http://stats.nba.com')
    }


def get_shots(year, season_type):
    """Get Dirk's latest shots."""
    global last_game_shot_id, last_game_date

    # New shots are going to be added here to be returned
    new_shots = []

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
        "VsDivision": "",
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
    r = requests.get("http://stats.nba.com/stats/shotchartdetail", params=shots_payload, headers=headers, timeout=15)
    r.raise_for_status()
    print('Using the following url...')
    print(r.url)

    s = requests.get("http://stats.nba.com/stats/playergamelog", params=games_payload, headers=headers, timeout=15)
    s.raise_for_status()

    # converting the response to the above calls to json
    shot_data = r.json()
    game_logs = s.json()

    # targeting the actual shots in the shot data
    shot_sets = shot_data["resultSets"][0]["rowSet"]
    # print(shot_sets)

    # targeting the actual games in the games data
    games = game_logs["resultSets"][0]["rowSet"]
    # print('GAMES ->')
    # print(games)

    # for each shot in the shots data
    for shot in shot_sets:
        # print('SHOT ->')
        # print(shot)

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

        # If this shot is newer than the last shot
        if last_game_date < datetime.strptime(shotDate, '%b %d, %Y'):

            print('New shot found...')

            # Increment the shot ID
            last_game_shot_id += 1

            # Assign values
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

            print([last_game_shot_id, year, season_type, game_id, shotDate, teams, period, result, shot_type, shot_value, shot_zone, shot_range, shot_distance, shot_xlocation, shot_ylocation, opponent])

            # Append new shot to new_shots payload
            new_shots.append([last_game_shot_id, year, season_type, game_id, shotDate, teams, period, result, shot_type, shot_value, shot_zone, shot_range, shot_distance, shot_xlocation, shot_ylocation, opponent])

    # Return the new shots
    return new_shots


def update_dirk_shots():
    """Update Dirk's shots."""
    print('Looking for new shots...')

    # Open dirk-shots.csv and find last game entered.
    with open('data/dirk-shots.csv', 'r') as readFile:
        # Get all shots into list so we can grab last one
        shots = list(csv.reader(readFile))
        lastGame = shots[-1]  # The last shot in the list
        print('There are ' + str(len(shots)) + ' total shots in our current csv.')
        print('The last game we have is...')
        print(lastGame)

        # Global saves... don't judge.
        global last_game_date
        last_game_date = datetime.strptime(lastGame[4], '%b %d, %Y')
        global last_game_shot_id
        last_game_shot_id = int(lastGame[0])

        new_shots = get_shots(season, seasonString)
        print('There are ' + str(len(new_shots)) + ' new shots.')
        shots.extend(new_shots)
        print('There are ' + str(len(shots)) + ' total shots after updates.')

        # Hacky but it works and I'm tired of F'ing with it.
        # Overwrite data to .csv
        with open('data/dirk-shots.csv', 'w') as writeFile:
            writer = csv.writer(writeFile)
            writer.writerows(shots)
            print('Updating csv complete')

        readFile.close()
        writeFile.close()

if __name__ == '__main__':
    update_dirk_data()
