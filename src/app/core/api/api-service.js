'use strict';

angular.module('koastAdminApp.core.api.api-service', ['koastAdminApp.core.constants'])
  .factory('api', function($http, constants) {
    var service = {};

    var endpointsPromise = $http.get(constants.adminPath + '/discovery')
      .then(R.prop('data'));

    function hasParams(path) {
      return !!path.match(':');
    }

    function setParams(path, params) {
      return path.replace(/:([^\/]+)/g, function(_, param) {
        if(!params[param]) {
          throw new Error('resource descriptor "' + param +
              '" is needed to access resource ' + path);
        }
        return params[param];
      });
    }

    function resolveEndpoint(candidates, arg1, arg2) {
        var path, body, method;

        if(Object.keys(candidates).length === 1) {
          if(candidates.GET) {
            method = 'GET';
            path = setParams(candidates.GET, arg1);
          } else {
            if(hasParams(candidates.POST)) {
              method = 'POST';
              path = setParams(candidates.POST, arg1);
              body = arg2;
            } else {
              method = 'POST';
              path = candidates.POST;
              body = arg1;
            }
          }
        } else {  //Guess which http method to use based on arg list
            if(arg1 && arg2) {
              if(!hasParams(candidates.POST)) {
                throw new Error('parameter list given but not supported for the given method');
              }
              method = 'POST';
              path = setParams(candidates.POST, arg1);
              body = arg2;
            } else if(arg1) {
              try {
                if(!hasParams(candidates.GET)) {
                  throw new Error('GET endpoint does not require any resource descriptors');
                }
                method = 'GET';
                path = setParams(candidates.GET, arg1);
              } catch(e) {
                if(hasParams(candidates.POST)) {
                  throw new Error('POST endpoint requires a resource descriptor!');
                }
                method = 'POST';
                path = candidates.POST;
                body = arg1;
              }
            } else {
              method = 'GET';
              path = candidates.GET;
            }
        }
        return {
          method: method,
          path: path,
          body: body
        };
    }

    service.callMethod = function(module, method) {
      var arg1 = arguments[2];
      var arg2 = arguments[3];
      var path, body;

      return endpointsPromise.then(function(endpointDescription) {
        if(!endpointDescription[module]) {
          throw new Error('module ' + module + ' does not exist!');
        }

        var candidates = endpointDescription[module][method];

        if(!candidates) {
          throw new Error('method ' + method + ' does not exist within ' + module);
        }

        var endpoint = resolveEndpoint(candidates, arg1, arg2);

        return $http({
          data: endpoint.body,
          url: constants.adminPath + endpoint.path.replace(/^\/admin/, ''), //FIXME
          method: endpoint.method
        }).then(R.prop('data'));
      });
    };
    return service;

  });
