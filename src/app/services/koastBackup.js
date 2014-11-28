'use strict';

angular.module('koastAdminApp.service')
.service('koastBackup',['koastAdmin_$http_MOCK','koastAdmin','$q','_koastLogger',function(_koastHttp,koastAdmin,$q,_koastLogger){
  var log = _koastLogger.makeLogger('koastAdminApp.backup');
  var routes; //collection of supported admin backup functionality and the route to find them in koast
  var ready = $q.defer();
  var whenReady = function(){
    return ready.promise;
  };

  koastAdmin.load()
  .then(function(funcationalities){
    var routeConfig = _.chain(funcationalities)
            .filter(function(i){
              return i.type === 'backup';
            })
            .first()
            .value();
    routes = routeConfig.routes || [];
    ready.resolve();
  })
  .then(null, function (err) {
    log.warn(err.data || err);
    throw err;
  });
  var getRouteInfo = function(functionality) {
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
  var getHttpFunction = function(method) {
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
    createBackup : function(name, type){
      return whenReady().then(function(){
        var routeInfo = getRouteInfo('createBackup');
        return getHttpFunction(routeInfo.method)(routeInfo.url,{name:name,type:type});
      });
    },
    getBackupStatus : function(id){
      return whenReady().then(function(){
        var routeInfo = getRouteInfo('getBackupStatus');
        return getHttpFunction(routeInfo.method)(routeInfo.url,{params:{id:id}});
      });
    },
    getBackups : function(){
      return whenReady().then(function(){
        var routeInfo = getRouteInfo('getBackups');
        return getHttpFunction(routeInfo.method)(routeInfo.url);
      });
    },
    restoreBackup : function(id){
      return whenReady().then(function(){
        var routeInfo = getRouteInfo('restoreBackup');
        return getHttpFunction(routeInfo.method)(routeInfo.url,{params:{id:id}});
      });
    }
  };

 return service;
}])
//SR: this a tmp mock while awating the server implementation
//once koast has this functionality, this mock should be moved to the unit test file to be used there
.service('koastAdmin_$http_MOCK',['$q',function($q){
  var backUpStatuses = {};
  var service = {
    post : function(url,body){
      var deferred = $q.defer();
      switch(url){
        case 'RESTORE_BACKUP':
        case 'CREATE_BACKUP':
          var id = body.id ? body.id : Math.floor(Math.random() * 10000);
          backUpStatuses[id] = 0;
          deferred.resolve({id:id});
        break;
        default:
          deferred.reject(new Error('unexpected url: '+url));
        break;
      }
      return deferred.promise;
    },
    get : function(url,config){
      var deferred = $q.defer();
      switch(url){
        case 'GET_BACKUPS':
          deferred.resolve([
            {name: 'bk 1', id : 1},
            {name : 'bk 2', id :2}
          ]);
        break;
        case 'GET_BACKUP_STATUS':
          if(backUpStatuses[config.params.id] < 100){
            backUpStatuses[config.params.id] += 5;
          }
          deferred.resolve({completed : backUpStatuses[config.params.id] || 0 });
        break;
        default:
          deferred.reject(new Error('unexpected url: '+url));
        break;
      }
      return deferred.promise;
    }
  };
  return service;
}]);