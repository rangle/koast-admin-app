'use strict';


// Tests are pointless since it is just a thin wrapper around api-service. Below is
// my foolhardy attempt to test it before realizing it has already been covered
// by the api-service tests.

//describe('koast backup service:', function () {
//    var httpPayloads = {
//      '/discovery': {
//        'backup': {
//          'list': { 'GET': '/list' }
//        }
//      },
//      '/list': [
//        { id: '42', name: null, collections: [ 'col1', 'col2' ] },
//        { id: '43', name: null, collections: [ 'col1' ] }
//      ]
//    };
//
//    var backup, admin, $http;
//
//    beforeEach(module('koastAdminApp.sections'));
//    beforeEach(module('koastAdminApp.core'));
//    beforeEach(module(function ($provide) {
//        $provide.service('$q', function () { return Q; });
//        $provide.service('constants', function () {
//          return {
//            adminPath: ''
//          };
//        });
//        $provide.service('$http', function () {
//          $http = testUtils.getHttp(httpPayloads);
//          return $http;
//        });
//    }));
//
//    beforeEach(inject(function ($injector) {
//            backup = $injector.get('backup');
//    }));
//
//    it('should have the appropriate methods', function () {
//        expect(backup.createBackup).to.be.a('function');
//        expect(backup.getBackupStatus).to.be.a('function');
//        expect(backup.getBackups).to.be.a('function');
//        expect(backup.restoreBackup).to.be.a('function');
//    });
//
//    describe('createBackup: ', function () {
//        it('should create a backup and return the reciept', function () {
//            return backup.createBackup([ 'col1' ], 'name', 'type', 'bucket').then(function (rep) {
//                expect(rep).to.be.an('object');
//                expect(rep.id).to.be.ok();
//            });
//        });
//    });
//
//    describe('restoreBackup: ', function () {
//        it('should restore a backup and return the reciept', function () {
//            $http.expect({ url: '/restore/myId' });
//            return backup.restoreBackup('myId').then(function (rep) {
//                expect(rep).to.be.an('object');
//                expect(rep.id).to.be.ok();
//            });
//        });
//    });
//
//    describe.only('list: ', function () {
//        it('should get a list of backups', function (done) {
//            $http.expect({url: '/list'});
//            return backup.list()
//              .then(function (rep) {
//                expect(rep).to.equal(httpPayloads['/list']);
//                done();
//            })
//            .then(null, done);
//        });
//    });
//
//    describe('getBackupStatus: ', function () {
//        it('should get the status of the admin task based off the given reciept', function () {
//            return backup.getBackupStatus('ID').then(function (rep) {
//                expect(rep).to.be.an('object');
//                expect(rep.completed).to.be.a('number');
//            });
//        });
//    });
//});
