var express = require('express'),
  path =require('path'),
  app = express(),
  bodyParser = require('body-parser'),
  models = require('./models');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../public'));

// get all shows or search for show by title with ?s=
app.get('/api/shows',  function(req, res){
  var s = req.param("s");
  models.Show.getAll(function(err, allShows){
    if (err) return res.status(500).send(err);
    if (!s) return res.send(allShows);
    res.send(allShows.filter(function(show){
      return show.title.search(new RegExp(s,'i')) !== -1;
    }));
  });
});

// get a show by id or slug
app.get('/api/show/:slug',  function(req, res){
  var slug = req.param("slug");
  // is numberish?
  var query = Number(slug) == slug ? {id: slug} : {slug: slug};

  models.Show.findOne(query, function(err, show){
    if (err) return res.status(500).send(err);
    res.send(show);
  });
});

// get episodes for a show id
app.get('/api/episodes/:slug', function(req, res){
  var slug = req.param("slug");

  if (Number(slug) == slug){
    models.Episode.getAll(slug, function(err, episodes){
      if (err) return res.status(500).send(err);
      res.send(episodes);
    });
  }else{
    models.Show.findOne({slug: slug}, function(err, show){
      if (err) return res.status(500).send(err);
      if (!show) return res.status(500).send("show not found.");
      models.Episode.getAll(show.id, function(err, episodes){
        if (err) return res.status(500).send(err);
        res.send(episodes);
      });
    });
  }  
});

// TODO: should I just use epidoe id here? It would reduce requests
app.get('/video/:show/:season/:episode', function(req, res){
  models.Show.findOne({slug: req.param("show")}, function(err, show){
    if (err) return res.status(500).send(err);
    if (!show) return res.status(500).send('show not found.');
    models.Episode.getAll(show.id, function(err, episodes){
      if (err) return res.status(500).send(err);
      var episode;
      for (i in episodes){
        var ep = episodes[i];
        if (ep.episode == req.param("episode") && ep.season == req.param("season")){
          episode = ep;
          break;
        }
      }
      if (!episode) return res.status(500).send('episode not found.');
      episode.streamVideo(req, res);
    });
  });
});

// dummy for HTML5-mode of angular URL routing
// TODO: use smarter regex for all this
function home(req, res){
  res.sendFile(path.resolve(__dirname + '/../public/index.html'));
}
app.get('/episodes', home);
app.get('/episodes/:show', home);
app.get('/episodes/:show/:season/:episode', home);

if(require.main === module){
  var port = port = process.env.PORT || 8000;
  console.log('Listening on http://0.0.0.0:' + port);
  app.listen(port);
}

module.exports = app;