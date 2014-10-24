angular.module('app', ['templates', 'ngRoute', 'ui.bootstrap', 'angucomplete', 'angularLocalStorage'])
  .controller('MainCtrl', require('controllers/main.js'))
  .controller('EpisodesCtrl', require('controllers/episodes.js'))
  .controller('WatchCtrl', require('controllers/watch.js'))
  .controller('ModalAddCtrl', require('controllers/modal_add.js'))
  .service('tvShow', require('services/tv_show.js'))
  
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/episodes/:show', {
        templateUrl: 'episodes.html',
        controller: 'EpisodesCtrl',
      })
      .when('/episodes/:show/:season/:episode', {
        templateUrl: 'watch.html',
        controller: 'WatchCtrl'
      })
      .when('/', {
        templateUrl: 'main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  })

  .config(function($sceProvider) { $sceProvider.enabled(false); })