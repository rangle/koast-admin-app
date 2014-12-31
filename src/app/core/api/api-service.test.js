'use strict';

//Generates $http service with hooks for expecting payloads

var testEndpoints = {
  '/discovery': {
    'module': {
      'method1': {
        'GET': '/admin/module/method1'
      },
      'method2': {
        'POST': '/admin/module/method2'
      },
      'method3': {
        'POST': '/admin/module/method3',
        'GET': '/admin/module/method3'
      },
      'method4': {
        'POST': '/admin/module/method4',
        'GET': '/admin/module/method4/:id'
      },
      'method5': {
        'POST': '/admin/module/method5/:id',
        'GET': '/admin/module/method5/:id'
      }
    }
  },
  '/module/method1': {},
  '/module/method2': {},
  '/module/method3': {},
  '/module/method4': {},
  '/module/method5': {},
  '/module/method4/fakeId': {},
  '/module/method5/fakeId': {}
};

describe('api-service', function () {
  var api, $http, constants;


  beforeEach(module('koastAdminApp.core.api'));
  beforeEach(module(function ($provide) {
    $provide.service('$q', function () {
      return Q;
    });
    $provide.service('$http', function (constants) {
      var ltestEndpoints = {};
      for (var endpoint in testEndpoints) {
        ltestEndpoints[constants.adminPath + endpoint] =
          testEndpoints[endpoint];
      }

      return testUtils.getHttp(ltestEndpoints);
    });
  }));

  beforeEach(inject(function ($injector) {
    constants = $injector.get('constants');
    api = $injector.get('api');
    $http = $injector.get('$http');
  }));

  it('should exist', function () {
    expect(api).to.be.an('object');
    expect(api.callMethod).to.be.a('function');
  });

  describe('callMethod', function () {
    it('should throw an error when a non-existent module is accessed',
      function (done) {
        testUtils.expectRejection(api.callMethod('mineTurtle',
          'method1'), done);
      });

    it('should throw an error when a non-existent method is accessed',
      function (done) {
        testUtils.expectRejection(api.callMethod('module', 'hello :)'),
          done);
      });

    it('should call the GET method when it is the only option',
      function (done) {
        $http.expect({
          url: constants.adminPath + '/module/method1',
          method: 'GET'
        });
        testUtils.expectResolution(api.callMethod('module', 'method1'),
          done);
      });

    it('should call the POST method when it is the only option',
      function (done) {
        var payload = {
          junk: 3
        };
        $http.expect({
          url: constants.adminPath + '/module/method2',
          method: 'POST',
          data: payload
        });
        testUtils.expectResolution(api.callMethod('module', 'method2',
          payload), done);
      });

    it('should pick GET when neither endpoint requires resource descriptors' +
      'and no body is provided',
      function (done) {
        $http.expect({
          url: constants.adminPath + '/module/method3',
          method: 'GET'
        });
        testUtils.expectResolution(api.callMethod('module', 'method3'),
          done);
      });

    it('should pick POST when neither endpoint requires resource descriptors' +
      'and a body is provided',
      function (done) {
        var payload = {
          junk: 3
        };
        $http.expect({
          url: constants.adminPath + '/module/method3',
          method: 'POST',
          data: payload
        });
        testUtils.expectResolution(api.callMethod('module', 'method3',
          payload), done);
      });

    it('should call the GET method when one arg is given and it is consistent ' +
      'with the GET endpoint\'s resource description',
      function (done) {
        $http.expect({
          url: constants.adminPath + '/module/method4/fakeId',
          method: 'GET'
        });
        testUtils.expectResolution(api.callMethod('module', 'method4', {
          id: 'fakeId'
        }), done);
      });

    it('should call the POST method when one arg is given and it is inconsistent ' +
      'with the GET endpoint\'s resource description',
      function (done) {
        var payload = {
          junk: 3
        };
        $http.expect({
          url: constants.adminPath + '/module/method4',
          method: 'POST',
          data: payload
        });
        testUtils.expectResolution(api.callMethod('module', 'method4',
            payload),
          done);
      });

    it('should call the POST method when two args are given, using one ' +
      'as the resource description',
      function (done) {
        $http.expect({
          url: constants.adminPath + '/module/method5/fakeId',
          method: 'POST'
        });
        testUtils.expectResolution(
          api.callMethod('module',
            'method5', {
              id: 'fakeId'
            }, {
              random: 'fakeId'
            }),
          done);
      });
  });
});
