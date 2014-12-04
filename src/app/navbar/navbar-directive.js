angular.module('koastAdminApp.directives')
  .directive('navbar', [function () {
    return {
      restrict: 'E',
      templateUrl: 'app/navbar/navbar.html',
      link: function (scope, iElement, iAttrs) {

        scope.links = scope.$eval(iAttrs.links);
        scope.navIsVisible = false;

        scope.toggleNav = function() {
          scope.navIsVisible = !scope.navIsVisible;
        };

        scope.hideNav = function() {
          scope.navIsVisible = false
        };

      }
    };
  }])