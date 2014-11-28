'use strict';


angular.module('koastAdminApp', [
  'koast',
  'ngRoute',
  'koastAdminApp.service'
])
.config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'app/main/main.html',
          controller: 'MainCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
    }
  ]);

angular.module('koastAdminApp.service',[])
.value('ADMIN_DISCOVERY_PATH','TODO')
.value('KOAST_ROOT','http://TODO/api/')
.run(['koastAdmin',function(koastAdmin){
  koastAdmin.load();
}]);