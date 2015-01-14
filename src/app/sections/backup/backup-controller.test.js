'use strict';

describe('backupCtrl:', function () {
	var backupCtrl,
		tagList = {},
		backupRecord = {
			backupId: '34072750-9b3a-11e4-adf0-8b69b77a50cb',
			receipts: [
				{
					collection: 'tasks',
					data: {
						bucket: 'mock-bucket',
						key: 'mock'
					}
				},
				{
					collection: 'users',
					data: {
						bucket: 'mock-bucket',
						key: 'mock'
					}
				}
			]
		};

	beforeEach(module('koastAdminApp.sections.backup.backup-controller'));

  beforeEach(inject(function ($controller, $interval, $q) {
		var mockBackup = {
			list: function () {
				return $q.when([backupRecord]);
			},
			restoreBackup: function (id) {
				var deferred = $q.defer();
				deferred.resolve('done');  // this is what seems to happen currently.
				return deferred.promise;
			}
		};

    backupCtrl = $controller('backupCtrl', {
      $interal: $interval,
      backup: mockBackup,
      tagList: tagList
    });
  }));

	it('should show a dialog when restore is clicked', function () {
		expect(backupCtrl.confirmingRestore).to.be.false();
		expect(backupCtrl.restoringBackup).to.be.not.ok();

		backupCtrl.confirmRestore(backupRecord);

		expect(backupCtrl.confirmingRestore).to.be.true();
		expect(backupCtrl.restoringBackup).to.be.not.ok();
		expect(backupCtrl.toRestore).to.be.equal(backupRecord);
	});

	describe('verify correct effects happen from backup restore confirmation dialog', function () {
		beforeEach(function () {
			backupCtrl.toRestore = backupRecord;
			backupCtrl.confirmingRestore = true;			
		});

		it('should start restoring when OK is clicked in the confirmation dialog', function () {
			expect(backupCtrl.restoringBackup).to.be.not.ok();

			backupCtrl.restoreBackup(backupRecord.backupId);

			expect(backupCtrl.confirmingRestore).to.be.false();
			expect(backupCtrl.restoringBackup).to.be.true();
			expect(backupCtrl.toRestore).to.be.equal(backupRecord);
		});

		it('should not start restoring when Cancel is clicked in the confirmation dialog', function () {
			expect(backupCtrl.restoringBackup).to.be.not.ok();

			backupCtrl.cancelRestore();

			expect(backupCtrl.confirmingRestore).to.be.false();
			expect(backupCtrl.restoringBackup).to.be.not.ok();
			expect(backupCtrl.toRestore).to.be.empty();
		});
	});
});