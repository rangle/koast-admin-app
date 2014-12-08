'use strict';
angular.module('koastAdminApp.sections.login.login-controller')
  .controller('loginCtrl', ['$scope', 'user', '$location', function ($scope,
    user, $location) {
    $scope.login = function (username, password) {
      $scope.loggingIn = true;
      user.login(username, password)
        .then(function () {
          $location.path('/');
        })
        .then(null, function (e) {
          $scope.error = 'Failed to login: ' + e;
        })
        .finally(function () {
          $scope.loggingIn = false;
        });
    };
  }]);