'use strict';

angular.module('koastAdminApp.directives', []);

angular.module('koastAdminApp', ['ui.router', 'ngAnimate', 'koast', 'koastAdminApp.sections', 'koastAdminApp.core', 'koastAdminApp.components']).controller('mainCtrl', function () {}).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
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
}]).run(function ($state, $rootScope, user, koastAdmin) {
    koastAdmin.load();

    $rootScope.$on('$stateChangeSuccess', function () {
        if (!user.isAuthenticated() && $state.current.name !== 'login') {
            $state.go('login', {
                redirect: $state.current
            });
        }
    });
    user.refreshToken(); //see if the admin koast token we may still have is still valid
});
