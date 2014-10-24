module.exports = function($scope, $location, $route, $routeParams, tvShow){
  $scope.seasons = [];

  tvShow.getUnwatchedEpisodes($routeParams.show)
    .then(function(subs){
      $scope.episodes = subs;
      $scope.episodes.forEach(function(ep){
        if ($scope.seasons.indexOf(ep.season) === -1){
          $scope.seasons.push(ep.season);
        }
        ep.watched = tvShow.watched.indexOf(ep.id) !== -1;
      });
    });

  tvShow.getShow($routeParams.show)
    .then(function(show){
      $scope.show = show.data;
    });

  $scope.subRemove = function(id){
    tvShow.unsubscribe(id);
    $location.path('/');
  }

  $scope.selectAll = function(){
    $scope.episodes.forEach(function(ep){
      ep.watched = true;
    });
  };

  $scope.markWatched = function(){
    $scope.episodes.forEach(function(ep){
      if (ep.watched){
        tvShow.watch(ep.id);
      }else{
        tvShow.unwatch(ep.id);
      }
    });
    $route.reload();
  };
};