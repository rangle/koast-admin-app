'use strict';
angular.module('koastAdminApp.sections.backup.backup-controller', [
    'koastAdminApp.sections.backup.backup-controller'
  ])
  .controller('backupCtrl', function ($interval, koastBackup) {
    var scope = this;

    scope.isModalVisible = false;
    scope.toggleModal = function () {
      scope.isModalVisible = !scope.isModalVisible;
    };

    koastBackup.getBackups()
      .then(function (backups) {
        scope.backups = backups;
      });

    var backingupInterval;
    scope.createBackup = function (name, type) {
      scope.percent = 0;
      scope.creatingBackup = true;

      koastBackup.createBackup(name, type)
        .then(function (reciept) {
          var id = reciept.id;
          backingupInterval = $interval(function () {
            koastBackup.getBackupStatus(id)
              .then(function (status) {
                scope.percent = status.completed;
                if (scope.percent >= 100) {
                  $interval.cancel(backingupInterval);
                  scope.toggleModal();
                  scope.creatingBackup = false;
                }
              });
          }, 100);
        });
    };

    var restoringInterval;
    scope.restoreBackup = function (id) {
      scope.restoringBackup = true;
      scope.restoringPercent = 0;
      scope.restoringName = id;
      koastBackup.restoreBackup(id)
        .then(function (reciept) {
          var id = reciept.id;
          restoringInterval = $interval(function () {
            koastBackup.getBackupStatus(id)
              .then(function (status) {
                scope.restoringPercent = status.completed;
                if (scope.restoringPercent >= 100) {
                  $interval.cancel(restoringInterval);
                  scope.restoringBackup = false;
                }
              });
          }, 100);
        });
    };
  });
