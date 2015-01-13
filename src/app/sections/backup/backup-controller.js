'use strict';
angular.module('koastAdminApp.sections.backup.backup-controller', [
  'koastAdminApp.sections.backup.backup-controller'
])
  .controller('backupCtrl', function ($interval, backup, tagList) {
    var vm = this;

    vm.isModalVisible = false;

    vm.hide = function(){
      vm.isModalVisible = false;
    };

    vm.show = function(){
      init();
      vm.isModalVisible = true;
    };

    function init() {
      vm.backupName = '';
      vm.backupType = null;
      tagList.requestReset();
    }

    vm.collections = function () {
      return tagList.val('collections');
    };

    backup.list()
      .then(function (backups) {
        vm.backups = backups;
      });

    var backingupInterval;
    vm.createBackup = function (name, collections, type) {
      if (!(name && collections.length && type)) {
        return;
      }

      vm.percent = 0;
      vm.creatingBackup = true;

      backup.createBackup(name, collections, type)
        .then(function (receipt) {
          var id = receipt.id;
          backingupInterval = $interval(function () {
            backup.status({
              id: id
            })
              .then(function (status) {
                vm.percent = (status.status === 'saved') ? 50 : 100;
                if (vm.percent >= 100) {
                  $interval.cancel(backingupInterval);
                  vm.toggleModal();
                  vm.creatingBackup = false;
                }
              });
          }, 100);
        })
        .then(null, function (e) {
          //TODO indicate failure
          console.error(e.stack);
          vm.toggleModal();
          vm.creatingBackup = false;
        });
    };

    var restoringInterval;
    vm.restoreBackup = function (id) {
      vm.restoringBackup = true;
      vm.restoringPercent = 0;
      vm.restoringName = id;
      backup.restoreBackup(id)
        .then(function (receipt) {
          restoringInterval = $interval(function () {
            backup.status({
              id: id
            })
              .then(function (status) {
                vm.restoringPercent = status.completed;
                if (vm.restoringPercent >= 100) {
                  $interval.cancel(restoringInterval);
                  vm.restoringBackup = false;
                }
              });
          }, 100);
        })
        .then(null, function (e) {
          //TODO indicate failure
          console.error(e.stack);
          vm.restoringBackup = false;
        });
    };
  });
