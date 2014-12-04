'use strict';

angular.module('koastAdminApp.service')
.service('koastAdmin', [
  'koastAdmin_HTTP_MOCK',
  'KOAST_ROOT',
  'ADMIN_DISCOVERY_PATH',
function(_koastHttp,KOAST_ROOT,ADMIN_DISCOVERY_PATH){
  var supportedFunctionality;
  var service = {
    load : function(){
      return _koastHttp.get(KOAST_ROOT + ADMIN_DISCOVERY_PATH,{cache:true})
      .then(function(res){
        supportedFunctionality = res;
        return res;
      });
    }

  };
  return service;
}])
//SR: this a tmp mock while awating the server implementation
//once koast has this functionality, this mock should be moved to the unit test file to be used there
.service('koastAdmin_HTTP_MOCK',['$q',function($q){
  var service = {
    get : function(url){
      var deferred = $q.defer();

      deferred.resolve([
          {
            type:'backup',
            routes:[
              {url:'CREATE_BACKUP',method:'POST',functionality:'createBackup'},
              {url:'GET_BACKUPS',method:'GET',functionality:'getBackups'},
              {url:'RESTORE_BACKUP',method:'POST',functionality:'restoreBackup'},
              {url:'GET_BACKUP_STATUS',method:'GET',functionality:'getBackupStatus'}
            ]
          }
        ]);

      return deferred.promise;
    }
  };
  return service;
}]);
