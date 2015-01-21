'use strict';
angular.module('koastAdminApp.components.formFocus.formFocus-directive', []).directive('formFocus', [function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('click', function () {
        var formField = document.getElementsByName(attrs.formFocus)[0];
        // Shenanigans. Weird timing issue was preventing focus() from being called, so wait.
        setTimeout(function () {formField.focus()}, 100);
      });
    }
  };
}]);