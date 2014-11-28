'use strict';

describe('koast backup service:', function() {
  beforeEach(module('koastAdminApp.service'));

  beforeEach(module(function ($provide) {
    $provide.service("$q", function() {return Q;});
  }));

  var koastBackup;
  beforeEach(function(){
    inject(function($injector){
      koastBackup = $injector.get('koastBackup');
    });
  });

  it('should exist', function() {
    expect(koastBackup).to.be.an('object');
    expect(koastBackup.createBackup).to.be.a('function');
    expect(koastBackup.getBackupStatus).to.be.a('function');
    expect(koastBackup.getBackups).to.be.a('function');
    expect(koastBackup.restoreBackup).to.be.a('function');
  });

  describe('createBackup: ', function(){
    it('should create a backup and return the reciept',function(){
      return koastBackup.createBackup('name','type')
      .then(function(rep){
        expect(rep).to.be.an('object');
        expect(rep.id).to.be.ok;
      });
    });
  });

  describe('restoreBackup: ', function(){
    it('should restore a backup and return the reciept',function(){
      return koastBackup.restoreBackup('ID')
      .then(function(rep){
        expect(rep).to.be.an('object');
        expect(rep.id).to.be.ok;
      });
    });
  });

  describe('getBackups: ',function(){
    it('should get a list of backups',function(){
      return koastBackup.getBackups()
      .then(function(rep){
        expect(rep).to.be.an('Array');
        expect(rep).to.have.length.above(0);
          angular.forEach(rep,function(i){
            expect(i).to.be.an('object');
            expect(i.id).to.be.ok;
            expect(i.name).to.be.an('string');
          });
      });
    });
  });

  describe('getBackupStatus: ',function(){
    it('should get the status of the admin task based off the given reciept',function(){
      return koastBackup.getBackupStatus('ID')
      .then(function(rep){
        expect(rep).to.be.an('object');
        expect(rep.completed).to.be.a('number');
      });
    });
  });

});
