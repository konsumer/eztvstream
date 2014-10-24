var mongoose = require('mongoose'),
  eztv = require('eztv'),
  torrentStream = require('torrent-stream'),
  rangeParser = require('range-parser'),
  mime = require('mime');

var Episode = new mongoose.Schema({
  show: Number,
  id: Number,
  episode: Number,
  season: Number,
  title: String,
  magnet: String
});

// update all episodes for this show from remote if cache is invalid
Episode.statics.getAll = function(show, cb, force){
  var out = [];

  Model.find({show:show}, function(err, results) {
    if (err) return cb(err);
    if (results && results.length && !force) return cb(null, results);
    eztv.getShowEpisodes(show, function(err, results) {
      if (err) return cb(err);

      results.episodes.forEach(function(e, i){
        Model.findOne({id: e.id}, function(err, episode){
          if (err) return cb(err);
          if (!episode) episode = new Model();
          episode.show = show;
          episode.id = e.id;
          episode.episode = e.episodeNumber;
          episode.season = e.seasonNumber;
          episode.title = e.title;
          episode.magnet = e.magnet;
          episode.save(function(err, episode){
            if (err) return cb(err);
            out.push(episode);
            if(i === (results.episodes.length - 1)) cb(null, out);
          });
        });
      });
    });
  });
};

// handle grabbing video via magnet for episode and sending it
Episode.methods.streamVideo = function(req, res){
  var episode = this;
  var engine = torrentStream(episode.magnet);
  engine.on('ready', function() {
    var chosenFile;

    if (engine.files.length === 1){
      chosenFile = engine.files.pop();
    }else{
      // get largest video
      chosenFile = engine.files
        .filter(function(file){
          return mime.lookup(file.name).split('/').shift() == 'video';
        })
        .sort(function(a,b){
          return a.length > b.length;
        })
        .pop();
    }

    if (!chosenFile) return res.status(500).send('no suitable video file found.');

    var range = req.headers.range;
    range = range && rangeParser(chosenFile.length, range)[0];

    var stream;
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-type', mime.lookup(chosenFile.name));

    if (!range){
      res.setHeader('Content-Length', chosenFile.length);
      stream = chosenFile.createReadStream();
    }else{
      res.statusCode = 206;
      res.setHeader('Content-Length', range.end - range.start + 1);
      res.setHeader('Content-Range', 'bytes '+range.start+'-'+range.end+'/'+chosenFile.length);
      stream = chosenFile.createReadStream(range);
    }

    stream.pipe(res);
  });
};

var Model = mongoose.model('Episode', Episode);
module.exports = Model;