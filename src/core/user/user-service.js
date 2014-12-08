'use strict';

// Authenticates user with koast admin api
//

/**
 * @module koastAdminApp.service/user
 */

angular.module('koastAdminApp.core.user.user-service', [
    'koastAdminApp.core.koastAdmin'
  ])
  .service('user', ['koastAdmin', '_koastHttp', '$timeout', '_koastLogger',
    function (koastAdmin, _koastHttp, $timeout, _koastLogger) {
      //common makeApiCall function call wrapper
      var makeBackupApiCall = function (method, bodyOrConfig, config) {
        return koastAdmin.makeApiCall('authentication', method,
          bodyOrConfig, config);
      };
      //handle a successful authentication request
      var handleSuccessAuth = function (result) {
        log.debug('Successfully Authenticated.');
        _koastHttp.saveToken(result.token);
        _isAuthenticated = true;
        _rerefreshTokenTimeout = $timeout(service.refreshToken, result.expires *
          60000);
      };
      //handle a successful logout request
      var handleDestroyAuth = function () {
        _isAuthenticated = false;
        _koastHttp.deleteToken();
      };
      //cancel the timeout for refreshing the token, if it exists
      var cancelRefresh = function () {
        if (_rerefreshTokenTimeout) {
          $timeout.cancel(_rerefreshTokenTimeout);
        }
      };

      //try to refresh the token before it expires
      var _rerefreshTokenTimeout;
      var _isAuthenticated = false;
      var log = _koastLogger.makeLogger('koastAdminApp.service.user');

      var service = {
        //is the user currently authenticated against the koast admin API?
        isAuthenticated: function () {
          return _isAuthenticated;
        },
        login: function (userName, password) {
          //clear any pre-existing refresh token timeouts
          cancelRefresh();
          return makeBackupApiCall('login', {
              userName: userName,
              password: password
            })
            .then(handleSuccessAuth);
        },
        logout: function () {
          cancelRefresh();
          return makeBackupApiCall('logout')
            .then(handleDestroyAuth);
        },
        refreshToken: function () {
          log.debug('Refreshing koast admin auth token');
          return makeBackupApiCall('refreshToken')
            .then(handleSuccessAuth,
              function () {
                log.debug(
                  'Koast admin auth token is no longer valid. Logging out.'
                );
                handleDestroyAuth();
              });
        }
      };
      return service;
    }
  ]);