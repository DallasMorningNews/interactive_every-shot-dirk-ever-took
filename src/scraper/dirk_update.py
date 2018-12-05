import dirk_get_new_shots
import dirk_convert_csv_to_geojson

# #################################################################
# GET ALL OF DIRK'S SHOTS
# Will overwrite exisitng .csv file
# #################################################################
def handler():

    # Update csv file with new shots
    dirk_get_new_shots.update_dirk_shots()
    # Convert the csv file to geojoson
    dirk_convert_csv_to_geojson.convertShots()

if __name__ == '__main__':
    handler()
