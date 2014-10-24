module.exports = function ($scope, $modalInstance, subscriptions) {
  $scope.ok = function () {
    $modalInstance.close($scope.selectedShow);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}