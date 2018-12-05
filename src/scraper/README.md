First, install dependencies...
```pipenv install```

Second, launch shell...
```pipenv shell```

Third, run ```python dirk_update.py```

This will execute functions in two different scripts and if there are updates, it will update two files in the `data` folder.

Below is hidden from you but is an explainer of what's happening.

The first script will retrieve the latest existing shot in our local .csv file called `dirk-shots.csv`. Armed with the date of our last entry, it will go to NBA stats in search of any new shots. If found, it will pack those in an array and stick them to the end of our existing.csv file.

The second script will then open that csv and convert the data into a geojson file and overwrite the file called `dirk-shots.geojson`

#### IN CASE OF EMERGENCY ####
You can create a new, master csv of all historical shots by running `python dirk_build_all_shots_csv.py`. This will overwrite any existing csv file in the data directory. After that, you'd need to run `python dirk-update.py` again.
