'use strict';

angular.module('koastAdminApp.directives', []);
angular.module('koastAdminApp.service', []);

angular.module('koastAdminApp', [
    'ui.router',
    'ngAnimate',
    'koast',
    'koastAdminApp.service',
    'koastAdminApp.sections',
    'koastAdminApp.core',
    'koastAdminApp.components'
  ])
  .controller('mainCtrl', function () {})
  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('testing', {
          url: '/testing',
          templateUrl: 'app/test.html'
        })
        .state('home', {
          url: '/',
          templateUrl: 'app/sections/home/home.html'
        })
        .state('login', {
          url: '/login',
          templateUrl: 'app/sections/login/login.html',
          controller: 'loginCtrl'
        })
        .state('backup', {
          url: '/backup',
          templateUrl: 'app/sections/backup/backup.html',
          controller: 'backupCtrl as backupCtrl'
        });

      $urlRouterProvider.otherwise('/');
    }
  ])
  .run(function ($state, $rootScope, user, koastAdmin) {
    koastAdmin.load();
    user.refreshToken(); //see if the admin koast token we may still have is still valid
  });
