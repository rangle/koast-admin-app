'use strict';

angular.module('koastAdminApp.sections.login.login-controller', [
    'koastAdminApp.core.user'
  ])
  .controller('loginCtrl', function (user, $location) {
    var vm = this;

    vm.login = function (username, password) {
      user.login(username, password).then(function () {
        $location.path('/');
      }).then(null, function (e) {
        vm.error = 'Failed to login: ' + e;
      }).
      finally(function () {
        vm.loggingIn = false;
      });
    };
  });
