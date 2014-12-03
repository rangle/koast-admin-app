'use strict';

angular.module('koastAdminApp.service')
.factory('koastAuth', function() {
  var isAuthenticated = true;
  return {
    isAuthenticated: isAuthenticated
  };
});
