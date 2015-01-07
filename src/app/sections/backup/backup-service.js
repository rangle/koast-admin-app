'use strict';

// Create, restore, list, and get status of koast DB backups
//
/**
 * @module koastAdminApp.service/koastBackup
 */
angular.module('koastAdminApp.sections.backup.backup-service', [])
  .service('backup', function (api, constants) {
    var service = {
      //make create backup request
      //where name is the name of the backup and type is what kind of backup it will be
      createBackup: function (name, collections, type) {
        return api.callMethod('backup', 'start', {
          collections: collections,
          type: type,
          name: name,
          opts: {
            name: name,
            bucket: constants.awsBucket
          }
        });
      },

      //ask for the status of a particular inprogress backup
      //where id is the id from the backup receipt
      status: function (id) {
        return api.callMethod('backup', 'stat', id);
      },

      //get a list of backups
      list: function () {
        return api.callMethod('backup', 'list');
      },

      //restore the db using the selected backup
      //where id is the id of the backup
      restoreBackup: function (id) {
        return api.callMethod('backup', 'restore', {
          id: id
        });
      }
    };

    return service;
  });