'use strict';


angular.module('koastAdminApp', [
    'ui.router',
    'koastAdminApp.service'
  ])
  .controller('mainCtrl', function() {
  })
  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('welcome', {
          url: '/',
          templateUrl: 'app/welcome.html'
        })
        .state('login', {
          url: '/login',
          templateUrl: 'app/login/login.html',
          controller: 'loginCtrl'
         })
        .state('backup', {
          url: '/backup',
          templateUrl: 'app/backup/backup.html',
          controller: 'backupCtrl'
        });

      $urlRouterProvider.otherwise('/');
    }
  ])
  .run(function($state, $rootScope, koastAuth) {
    $rootScope.$on('$stateChangeSuccess', function() {
      if(!koastAuth.isAuthenticated && $state.current.name !== 'login') {
        $state.go('login', { redirect: $state.current });
      }
    });
  });

angular.module('koastAdminApp.service', ['koast'])
  .value('ADMIN_DISCOVERY_PATH', 'TODO')
  .value('KOAST_ROOT', 'http://TODO/api/')
  .run(function (koastAdmin) {
    koastAdmin.load();
  });
