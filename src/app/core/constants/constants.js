'use strict';

angular.module('koastAdminApp.core.constants', [])
  .factory('constants', function() {
    return {
      adminPath: 'http://localhost:3000/admin',
      // TODO make this a server side configuration option and add endpoints to
      // facilitate selection
      awsBucket: 'rvaiya-development'
    };
  });
