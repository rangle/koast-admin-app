'use strict';

// Create, restore, list, and get status of koast DB backups
//
/**
 * @module koastAdminApp.service/koastBackup
 */
angular.module('koastAdminApp.sections.backup.koastBackup-service', ['koastAdminApp.core.koastAdmin']).service('koastBackup', ['koastAdmin', function (koastAdmin) {

    //common koastAdmin.makeApiCall function abstraction
    var makeBackupApiCall = function (method, bodyOrConfig, config) {
        return koastAdmin.makeApiCall('backup', method, bodyOrConfig, config);
    };

    var service = {
        //make create backup request
        //where name is the name of the backup and type is what kind of backup it will be
        createBackup: function (name, type) {
            return makeBackupApiCall('createBackup', {
                name: name,
                type: type
            }, {});
        },
        //ask for the status of a particular inprogress backup
        //where id is the id from the backup receipt
        getBackupStatus: function (id) {
            return makeBackupApiCall('getBackupStatus', {
                params: {
                    id: id
                }
            });
        },
        //get a list of backups
        getBackups: function () {
            return makeBackupApiCall('getBackups');
        },
        //restore the db using the selected backup
        //where id is the id of the backup
        restoreBackup: function (id) {
            return makeBackupApiCall('restoreBackup', {}, {
                params: {
                    id: id
                }
            });
        }
    };

    return service;
}]);