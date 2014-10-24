module.exports = function(storage, $http, $q, $modal){
  var tvShow = {};
  tvShow.subscriptions = storage.get('subscriptions') || [];
  tvShow.watched = storage.get('watched') || [];

  // mark an episode watched
  tvShow.watch = function(ep_id){
    if (tvShow.watched.indexOf(ep_id) === -1){
      tvShow.watched.push(ep_id);
      storage.set('watched', tvShow.watched);
    }
  }

  // mark an episode unwatched
  tvShow.unwatch = function(ep_id){
    var i = tvShow.watched.indexOf(ep_id);
    
    if (i !== -1){
      tvShow.watched.splice(i, 1);
      storage.set('watched', tvShow.watched);
    }
  }

  // subscribe to a show
  // TODO: inject current subscriptions, so they can be filtered out of auto-complete
  tvShow.subscribe = function(){
    var deferred = $q.defer();
    $modal.open({
      templateUrl: 'modal_add.html',
      controller: 'ModalAddCtrl',
      resolve: {
        subscriptions: function(){ return tvShow.subscriptions; }
      }
    }).result.then(function (selectedItem) {
      tvShow.subscriptions.push(selectedItem.originalObject.id);
      storage.set('subscriptions', tvShow.subscriptions);
      deferred.resolve(selectedItem);
    }, deferred.reject);
    return deferred.promise;
  };

  // unsubscribe from a show
  tvShow.unsubscribe = function(id){
    var i = tvShow.subscriptions.indexOf(id);
    
    if (i !== -1){
      tvShow.subscriptions.splice(i, 1);
      storage.set('subscriptions', tvShow.subscriptions);
    }
  };

  // get all shows
  tvShow.getShows = function(){
    return $http.get('/api/shows');
  };

  //  get one show
  tvShow.getShow = function(slug){
    return $http.get('/api/show/' + slug);
  };

  // get shows current user is subscribed to complete with unwatched shows
  tvShow.getSubscribedShows = function(){
    var deferred = $q.defer();
    
    $http.get('/api/shows')
      .then(function(s){
        var episodes = {};
        
        var shows = s.data.filter(function(show){
          return tvShow.subscriptions.indexOf(show.id) !== -1;
        }).map(function(show){          
          tvShow.getUnwatchedEpisodes(show.id)
            .then(function(episodes){
              show.unwatched = episodes;
            });
          return show;
        });
        deferred.resolve(shows);
      }, deferred.reject);

    return deferred.promise;
  };

  // get all episodes
  tvShow.getEpisodes = function(show){
    return $http.get('/api/episodes/' + show);
  };

  // get all unwatched episodes for a show
  tvShow.getUnwatchedEpisodes = function(show){
    var deferred = $q.defer();
    
    $http.get('/api/episodes/' + show)
      .then(function(episodes){
        deferred.resolve(episodes.data.filter(function(episode){
          return tvShow.watched.indexOf(episode.id) === -1;
        }));        
      }, deferred.reject);
    
    return deferred.promise;
  }

  return tvShow;
}