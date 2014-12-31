'use strict';

angular.module('koastAdminApp', [
    'ui.router',
    'ngAnimate',
    'koastAdminApp.sections',
    'koastAdminApp.core',
    'koastAdminApp.components'
])
  .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider.state('home', {
          url: '/',
          templateUrl: 'app/sections/home/home.html'
      }).state('login', {
          url: '/login',
          templateUrl: 'app/sections/login/login.html',
          controller: 'loginCtrl as loginCtrl'
      }).state('backup', {
          url: '/backup',
          templateUrl: 'app/sections/backup/backup.html',
          controller: 'backupCtrl as backupCtrl'
      });

      $urlRouterProvider.otherwise('/');
  })
  .run(function($rootScope, $state, user) {
    $rootScope.$on('$stateChangeSuccess', function () {
        if (!user.isAuthenticated() && $state.current.name !== 'login') {
            $state.go('login', {
                redirect: $state.current
            });
        }
    });
  });
