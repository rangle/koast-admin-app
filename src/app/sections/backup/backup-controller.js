'use strict';
angular.module('koastAdminApp.sections.backup.backup-controller', [
    'koastAdminApp.sections.backup.backup-controller'
  ])
  .controller('backupCtrl', function ($interval, koastBackup) {
    var vm = this;

    vm.isModalVisible = false;
    vm.toggleModal = function () {
      vm.isModalVisible = !vm.isModalVisible;
    };

    koastBackup.getBackups()
      .then(function (backups) {
        vm.backups = backups;
      });

    var backingupInterval;
    vm.createBackup = function (name, type) {
      vm.percent = 0;
      vm.creatingBackup = true;

      koastBackup.createBackup(name, type)
        .then(function (reciept) {
          var id = reciept.id;
          backingupInterval = $interval(function () {
            koastBackup.getBackupStatus(id)
              .then(function (status) {
                vm.percent = status.completed;
                if (vm.percent >= 100) {
                  $interval.cancel(backingupInterval);
                  vm.toggleModal();
                  vm.creatingBackup = false;
                }
              });
          }, 100);
        });
    };

    var restoringInterval;
    vm.restoreBackup = function (id) {
      vm.restoringBackup = true;
      vm.restoringPercent = 0;
      vm.restoringName = id;
      koastBackup.restoreBackup(id)
        .then(function (reciept) {
          var id = reciept.id;
          restoringInterval = $interval(function () {
            koastBackup.getBackupStatus(id)
              .then(function (status) {
                vm.restoringPercent = status.completed;
                if (vm.restoringPercent >= 100) {
                  $interval.cancel(restoringInterval);
                  vm.restoringBackup = false;
                }
              });
          }, 100);
        });
    };
  });
