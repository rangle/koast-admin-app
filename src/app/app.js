'use strict';

angular.module('koastAdminApp', ['koast'])
.run(function($log) {
  $log.debug('Bootstrapped koast admin app.');
});