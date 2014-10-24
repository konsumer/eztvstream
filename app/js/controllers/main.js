module.exports = function($scope, $route, tvShow){
  $scope.subAdd = function(){
    tvShow.subscribe()
      .then(function (selectedItem) {
        $route.reload();
      });
  }

  $scope.subIds = tvShow.subscriptions;

  // when subscriptions change, update media info
  $scope.$watch('subIds', function(){
    tvShow.getSubscribedShows().then(function(subs){
      $scope.subscriptions = subs;
    });
  });
}