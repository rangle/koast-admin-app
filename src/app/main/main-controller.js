'use strict';
angular.module('koastAdminApp')
.controller('MainCtrl',['$scope','$interval','koastBackup',function($scope,$interval,koastBackup){
  koastBackup.getBackups()
    .then(function(backups){
      $scope.backups = backups;
    });

  var backingupInterval;

  $scope.createBackup = function(name,type){
    $scope.creatingBackup = true;
    $scope.percent = 0;
    koastBackup.createBackup(name,type)
    .then(function(reciept){
      var id = reciept.id;
       backingupInterval = $interval(function(){
        koastBackup.getBackupStatus(id)
        .then(function(status){
          $scope.percent = status.completed;
        })
      },100);
    });
  };
  $scope.$watch('percent',function(newVal){
    if(newVal >= 100){
      $interval.cancel(backingupInterval);
      $scope.creatingBackup = false;
    }
  });

  var restoringInterval;
  $scope.restoreBackup = function(id){
    $scope.restoringBackup = true;
    $scope.restoringPercent = 0;
    $scope.restoringName = id;
    koastBackup.restoreBackup(id)
    .then(function(reciept){
      var id = reciept.id;
       restoringInterval = $interval(function(){
        koastBackup.getBackupStatus(id)
        .then(function(status){
          $scope.restoringPercent = status.completed;
        })
      },100);
    });
  };
   $scope.$watch('restoringPercent',function(newVal){
    if(newVal >= 100){
      $interval.cancel(restoringInterval);
      $scope.restoringBackup = false;
    }
  });


}]);
