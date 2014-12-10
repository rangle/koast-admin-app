'use strict';

angular.module('koastAdminApp.sections.login.login-controller', [
    'koastAdminApp.core.user'
  ])
  .controller('loginCtrl', function (user, $location) {
    var scope = this;

    scope.login = function (username, password) {
      user.login(username, password).then(function () {
        $location.path('/');
      }).then(null, function (e) {
        scope.error = 'Failed to login: ' + e;
      }).
      finally(function () {
        scope.loggingIn = false;
      });
    };
  });
