# eztvstream

Watch EZTV with streaming torrents

You can see my running version, [here](http://eztvstream.herokuapp.com/).

## development

### quick

* You can install a heroku instance [here](https://heroku.com/deploy?template=https://github.com/konsumer/eztvstream).
*  Install local dependencies with `npm install`
*  Set `MONGOHQ_URL`, `MONGOLAB_URI`, `MONGOSOUP_URL`, or `MONGO_URI` environment variable for your database
*  `gulp server` - Download client-side dependencies & build all files, run a watching development server that will build when files are changed

## more on gulp

*  `gulp` - download client-side dependencies & build all files
*  `gulp watch` - Like `gulp server` without the local server running (just the watch for rebuild)
*  `gulp clean` - Delete all generated files
*  `gulp bower` - Download client-side dependencies & build vendor.js & vendor.css
*  `gulp js` - build app.js
*  `gulp less` - build app.css
*  `gulp templates` - build templates.js
*  Prefix gulp commands with `--type production` for the minified/optimized version