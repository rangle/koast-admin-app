var testUtils = {};

testUtils.getHttp = function(testData) {
  var nextExpect;

  var $http = function(config) {
    if (nextExpect) {
      for(var key in nextExpect) {
        expect(config[key]).to.deep.equal(nextExpect[key]);
      }
      nextExpect = null;
    }

    var wrap = function(data) {
      return Q({
        data: data
      });
    };

    if(testData[config.url]) {
      return wrap(testData[config.url]);
    }

    return Q.when('').thenReject({ data: null, status: 500 });
  };

  $http.get = function(url) {
    var config = {};
    config.method = 'GET';
    config.url = url;
    return $http(config);
  };

  $http.expect = function(obj) {
    nextExpect = obj;
  };

  return $http;
};

testUtils.expectResolution = function(promise, done) {
  promise.then( function() { done(); }, done);
};

testUtils.expectRejection = function(promise, done) {
  promise.then(
      function(val) { done(new Error('promise resolved with ' + JSON.stringify(val) + '!')); },
      function() { done(); }
  );
};
