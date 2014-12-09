'use strict';

describe('koast admin service:', function () {
  beforeEach(module('koastAdminApp.core.koastAdmin.koastAdmin-service'));
  beforeEach(module(function ($provide) {
    $provide.service('$q', function () {
      return Q;
    });

  }));

  var koastAdmin;
  beforeEach(function () {
    inject(function ($injector) {
      koastAdmin = $injector.get('koastAdmin');
      koastAdmin.load();
    });
  });

  it('should exist', function () {
    expect(koastAdmin).to.be.an('object');
    expect(koastAdmin.load).to.be.a('function');
  });

  describe('load : ', function () {
    it('should load ', function () {
      return koastAdmin.load()
        .then(function (supportedFuncs) {
          expect(supportedFuncs).to.be.an('Array');
          expect(supportedFuncs).to.have.length.above(0);
          angular.forEach(supportedFuncs, function (i) {
            expect(i).to.be.an('object');
            expect(i.type).to.be.a('string');
            expect(i.routes).to.be.an('Array');
          });
        });
    });
  });

  describe('makeApiCall', function () {
    it('should make the GET request', function () {
      return koastAdmin.makeApiCall('TEST', 'test1', {})
        .then(function (backups) {
          expect(backups).to.be.ok;
        });
    });

    it('should make the POST request', function () {
      return koastAdmin.makeApiCall('TEST', 'test2', {
          name: 'test',
          type: 'aws'
        }, {})
        .then(function (receipt) {
          expect(receipt).to.be.ok;
        });
    });

    it('should make the PUT request', function () {
      return koastAdmin.makeApiCall('TEST', 'test3', {
          name: 'test',
          type: 'aws'
        }, {})
        .then(function (receipt) {
          expect(receipt).to.be.ok;
        });
    });
  });
});