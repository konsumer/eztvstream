module.exports = function($scope, $routeParams, $location, tvShow){
  var epNumbers, seasons;
  function numericSort(a,b){ return a - b; }

  // find episode by season & episode-num
  function findEpisode(episodes, season, episode, offset){
    if (offset === undefined) offset = 0;
    season = parseInt(season);
    episode = parseInt(episode);

    //  handle offset
    if (offset !== 0){
      if (epNumbers[season].indexOf(episode+offset) !== -1){
        episode = episode+offset;
      }else{
        if ((episode + offset) === 0){
          season = seasons[seasons.indexOf(season)-1];
          if (!season) return;
          episode = epNumbers[season][ epNumbers[season].length -1 ];
        }else{
          season = seasons[seasons.indexOf(season)+1];
          if (!season) return;
          episode = epNumbers[season][0];
        }
      }
    }

    for (i in episodes){
      var ep = episodes[i];
      if (ep.episode == episode && ep.season == season){
        return ep;
      }
    }
  }

  $scope.video_url = '/' + ['video', $routeParams.show, $routeParams.season, $routeParams.episode].join('/');

  tvShow.getShow($routeParams.show)
    .then(function(show){
      $scope.show = show.data;
    });

  tvShow.getEpisodes($routeParams.show)
    .then(function(episodes){      
      // cache episode relationships
      var epnums={};
      episodes.data.forEach(function(ep){
        if (!epnums[ep.season]){
          epnums[ep.season] = [];
        }
        if(epnums[ep.season].indexOf(ep.episode) === -1){
          epnums[ep.season].push(ep.episode);
        }
      });
      
      epNumbers={};
      Object.keys(epnums).sort(numericSort).forEach(function(s){
        epNumbers[s] = epnums[s].sort(numericSort);
      });
      seasons = Object.keys(epNumbers).sort(numericSort);

      $scope.episode = findEpisode(episodes.data, $routeParams.season, $routeParams.episode);
      $scope.next = findEpisode(episodes.data, $routeParams.season, $routeParams.episode, 1);
      $scope.previous = findEpisode(episodes.data, $routeParams.season, $routeParams.episode, -1);
    });

  $scope.episodeNext = function(){
    $location.path(['episodes', $routeParams.show, $scope.next.season, $scope.next.episode].join('/'));
  }

  $scope.episodePrevious = function(){
    $location.path(['episodes', $routeParams.show, $scope.previous.season, $scope.previous.episode].join('/'));
  }
}