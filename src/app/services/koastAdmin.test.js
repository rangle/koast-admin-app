'use strict';

describe('koast admin service:', function() {
  beforeEach(module('koastAdminApp.service'));
  beforeEach(module(function ($provide) {
    $provide.service("$q", function() {return Q;});
  }));

  var koastAdmin;
  beforeEach(function(){
    inject(function($injector){
      koastAdmin = $injector.get('koastAdmin');
    });
  });

  it('should exist', function() {
    expect(koastAdmin).to.be.an('object');
    expect(koastAdmin.load).to.be.a('function');
  });

  describe('load : ',function(){
    it('should load ',function(){
      return koastAdmin.load()
      .then(function(supportedFuncs){
        expect(supportedFuncs).to.be.an('Array');
        expect(supportedFuncs).to.have.length.above(0);
        angular.forEach(supportedFuncs,function(i){
          expect(i).to.be.an('object');
          expect(i.type).to.be.a('string');
          expect(i.routes).to.be.an('Array');
        });
      });
    })
  });

});
