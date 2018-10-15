# interactive_every-shot-dirk-ever-took

## Regarding this project

Shot data for this project is scraped from NBA's stats api (see src/assets/dirk.py), then converted to latitude and longitude for use in mapbox (see src/assets/dirk-conversion.py). Shot data is extremely large (over 7MB) so to speed up the loading of the map, the geojson is converted from geojson to mbtiles and then to a pbf image format, and lastly, uploaded to AWS.

To do so, follow these steps:

1. Use [tippecanoe](https://github.com/mapbox/tippecanoe) to convert to mbtiles using the following command: `tippecanoe -o {{output-name}}.mbtiles -l {{layer-name}} {{path-to-geojson-file}}`

  For this project that command is:
`tippecanoe -o dirk-shots.mbtiles -l dirkshots src/data/dirk_geo_current.json`

2. Use [mb-util](https://github.com/mapbox/mbutil) to convert the mbtiles to pbf image format using the following command: `mb-util --image_format=pbf {{mbtiles-file}} {{output-name}}`

  For this project, that command is:
`mb-util --image_format=pbf dirk-shots.mbtiles dirk-shots`

  This should result in a folder called `dirk-shots` with a nested file structure that contains several other numbered folders

3. That folder should then be uploaded to aws, using the following command line command:
```
s3cmd put dirk-shots s3://interactives.dallasnews.com/data-store/2018/dirk/dirk-shots-proper/ \
--acl-public --recursive --mime-type="application/x-protobuf" \
--add-header="Content-Encoding:gzip" \
--access_key={{access_key}} --secret_key={{secret_key}}
```


This is an interactive presentation graphic built using the [`dmninteractives` Yeoman generator](https://github.com/DallasMorningNews/generator-dmninteractives).

## Requirements

- Node - `brew install node`
- Gulp - `npm install -g gulp-cli`

## Local development

#### Installation

1. `npm install` to install development tooling
2. `gulp` to open a local development server

#### What's inside

- `src/index.html` - HTML markup, which gets processed by Nunjucks
- `src/js/*.js` - Graphic scripts, written in ES2015 (it'll be transpiled with Babel)
- `src/scss/*.scss` - Graphic styles in SCSS
- `src/data/*` - files that should be both published and committed to the repository (probably CSVs, JSON, etc.); copied to `dist/data/*` by Gulp
- `src/assets/*` - assets (probably media assets, such as Illustrator files) that don’t get copied by Gulp but are tracked by `git`
- `dist/*` - All of the above, transpiled

_Important caveat:_ Video, audio and ZIP files are ignored by `git` regardless of where they're saved. You'll need to manually alter the [`.gitignore`](.gitignore) file to have them committed to Github.

#### Publishing

`gulp publish` will upload your [`dist/`](dist/) folder to the `2018/every-shot-dirk-ever-took/` folder on our interactives S3 bucket.

## Copyright

&copy;2018 The Dallas Morning News

using tippecanoe to get the mb tiles (note: change src data file to where aws data lives):
tippecanoe -o dirk-shots.mbtiles -l dirkshots src/data/dirk_geo_current.json

mb-util command to create pbf files:
mb-util --image_format=pbf dirk-shots.mbtiles dirk-shots

pushing pbf files to aws:
s3cmd put dirk-shots s3://interactives.dallasnews.com/data-store/2018/dirk/dirk-shots-proper/ \
--acl-public --recursive --mime-type="application/x-protobuf" \
--add-header="Content-Encoding:gzip" \
--access_key={{access_key}} --secret_key={{secret_key}}
