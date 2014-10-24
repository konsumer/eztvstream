var mongoose = require('mongoose'),
  eztv = require('eztv');

var Show = new mongoose.Schema({
  id: Number,
  slug: String,
  title: String,
  status: String,
  image: String
});

var cacheTime = 600000; // 10 minutes
var lastLoad = 0, currentLoad = 0; // start with invalid cache

// update all shows from remote if cache is invalid
Show.statics.getAll = function(cb){
  lastLoad = currentLoad;
  currentLoad = (new Date()).getTime();

  if (currentLoad-lastLoad < cacheTime){
    return Model.find({}, cb);
  }

  eztv.getShows({}, function(err, results) {
    if (err) return cb(err);
    Model.remove({'id':{'$nin':results.map(function(show){ return show.id; })}}, function(err, affected){
      if (err) return cb(err);
      results.forEach(function(s, i){
        Model.findOne({id: s.id}, function(err, show){
          if (err) return cb(err);
          if (!show) show = new Model();
          show.id = s.id;
          show.slug = s.slug;
          show.title = s.title;
          show.status = s.status;
          show.image = ['https://ezimg.it/t', s.slug.replace(/-/g, '_'), 'main.png'].join('/');
          show.save(function(err, show){
            if (err) return cb(err);
            if(i === (results.length - 1)) Model.find({}, cb);
          });
        })
      });
    });
  });
};

var Model = mongoose.model('Show', Show);
module.exports = Model;