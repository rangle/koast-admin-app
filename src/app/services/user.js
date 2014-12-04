'use strict';

// Authenticates user with koast admin api
//

/**
 * @module koastAdminApp.service/user
 */

angular.module('koastAdminApp.service')
.service('user', ['koastAdmin',function(koastAdmin){

  var makeBackupApiCall = function(method,bodyOrConfig,config){
    return koastAdmin.makeApiCall('authentication',method,bodyOrConfig,config);
  };
  var isAuthenticated = false;

  var service = {
    isAuthenticated : function(){
      return isAuthenticated;
    },
    login : function(userName,password){
      return makeBackupApiCall('login',{userName:userName,password:password})
      .then(function(result){
        //TODO: need to keep auth token and expiry
        isAuthenticated = true;
      });
    },
    logout:function(){
      return makeBackupApiCall('logout')
      .then(function(){
        isAuthenticated = false;
      });
    },
    refreshToken:function(){
      return makeBackupApiCall('refreshToken');
    }
    //TODO: will need to auto refresh token
    //TODO: will need to check if user's token is still valid after page load
  };
  return service;
}]);
