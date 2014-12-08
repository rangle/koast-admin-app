'use strict';
// Controls interactions with the koast admin APIs
//

/**
 * @module koastAdminApp.core.koastAdmin.koastAdmin-service/koastAdmin-service
 */
angular.module('koastAdminApp.core.koastAdmin.koastAdmin-service', [ 'koastAdminApp.core.constants' ])
.service('koastAdmin', ['koastAdmin_HTTP_MOCK','KOAST_ROOT','ADMIN_DISCOVERY_PATH','$q',
  function(_koastHttp,KOAST_ROOT,ADMIN_DISCOVERY_PATH,$q){
  var supportedFunctionalityByType;
  var ready = $q.defer();
  var whenReady = function(){
    return ready.promise;
  };

  var getRouteInfo = function(routes, functionality) {
    var routeInfo = _.chain(routes)
            .filter(function(i){
              return i.functionality === functionality;
            })
            .first()
            .value();
    if (routeInfo){
      return routeInfo;
    }else{
      throw new Error('Koast Admin is not configured to support ' + functionality + ' funcationality');
    }
  };
  var getHttpFunction  = function(method) {
    switch(method){
      case 'GET':
        return _koastHttp.get;
      case 'POST':
        return _koastHttp.post;
      case 'PUT':
        return _koastHttp.put;
      default :
        throw new Error('Unsupported _koastHTTP method received from koast admin configuration',method);
    }
  };

  var service = {
    //load the admin functionality supported by the koast instance
    load : function(){
      return _koastHttp.get(KOAST_ROOT + ADMIN_DISCOVERY_PATH,{cache:true})
      .then(function(res){
        supportedFunctionalityByType = _.chain(res)
                                        .indexBy('type')
                                        .value();
        ready.resolve();
        return res;
      });
    },
    //discover and make a request to the desired koast admin api endpoint
    makeApiCall : function(type,method){
      var args = arguments;
      return whenReady()
      .then(function(){
        //find the admin functionallity mapping based on the type and desired admin functionailty;
        var route = getRouteInfo(supportedFunctionalityByType[type].routes,method);
        return getHttpFunction(route.method)(route.url,args[2],args[3]);
      });
    }
  };
  return service;
}])
//SR: this a tmp mock while awating the server implementation
//once koast has this functionality, this mock should be moved to the unit test file to be used there
//NOTE this is mocking ALL api functionality
.service('koastAdmin_HTTP_MOCK',['$q','KOAST_ROOT', 'ADMIN_DISCOVERY_PATH',function($q,KOAST_ROOT,ADMIN_DISCOVERY_PATH){
  var backUpStatuses = {};

  var service = {
    get : function(url,config){
      var deferred = $q.defer();
      var result;
      switch(url){
        case (KOAST_ROOT + ADMIN_DISCOVERY_PATH):
          result = [
            {
              type:'backup',
              routes:[
                {url:'CREATE_BACKUP',method:'POST',functionality:'createBackup'},
                {url:'GET_BACKUPS',method:'GET',functionality:'getBackups'},
                {url:'RESTORE_BACKUP',method:'POST',functionality:'restoreBackup'},
                {url:'GET_BACKUP_STATUS',method:'GET',functionality:'getBackupStatus'}
              ]
            },
            {
              type:'authentication',
              routes:[
                {url:'LOGIN',method:'POST',functionality:'login'},
                {url:'LOGOUT',method:'POST',functionality:'logout'},
                {url:'REFRESH',method:'POST',functionality:'refreshToken'},
              ]
            },
            {
              type:'TEST',
              routes:[
                {url:'test1',method:'GET',functionality:'test1'},
                {url:'test2',method:'POST',functionality:'test2'},
                {url:'test3',method:'PUT',functionality:'test3'},
              ]
            }
          ];
        break;
        case 'GET_BACKUPS':
          result = [
            {name: 'bk 1', id : 1},
            {name : 'bk 2', id :2}
          ];
        break;
        case 'GET_BACKUP_STATUS':
          if(backUpStatuses[config.params.id] < 100){
            backUpStatuses[config.params.id] += 5;
          }
          result = {completed : backUpStatuses[config.params.id] || 0 };
        break;
        case 'test1':
          result = {};
        break;
        default:
          throw new Error('koastAdmin_HTTP_MOCK.get: Unexpect URL '+url);
      }

      deferred.resolve(result);
      return deferred.promise;
    },
    post : function(url,body,config){
      var deferred = $q.defer();

      switch(url){

        case 'RESTORE_BACKUP':
        case 'CREATE_BACKUP':
          var id = body.id ? body.id : Math.floor(Math.random() * 10000);
          backUpStatuses[id] = 0;
          deferred.resolve({id:id});
        break;
        case 'REFRESH':
          if(config && config.headers && config.headers.Authorization){
            deferred.resolve({
              token : 'TEST_TOKEN',
              expires : 1 //minutes
            });
          }else{
            deferred.reject('Not Authorized');
          }
        break;
        case 'test2':
        case 'LOGIN':
        case 'LOGOUT':
          deferred.resolve({
            token : 'TEST_TOKEN',
            expires : 2 //minutes
          });
        break;
        default:
          throw new Error('koastAdmin_HTTP_MOCK.post: Unexpect URL '+url);
        break;
      }
      return deferred.promise;
    },
    put : function(url,body,config){
      var deferred = $q.defer();

      switch(url){
        case 'test3':
          deferred.resolve({});
        break;
        default:
          throw new Error('koastAdmin_HTTP_MOCK.put: Unexpect URL '+url);
        break;
      }
      return deferred.promise;
    },

    setToken : function(val){
      _token = val;
    },
    clearToken : function(){
      _token = null;
    },
    getToken : function(){
      return _token;
    }
  };
  var _token = null;

  return service;
}]);
