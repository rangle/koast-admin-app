angular.module('koastAdminApp.components.navbar.rgEscKeyup-directive', [])
.directive('rgEscKeyup', [function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var ESC_KEY = 27;
      element.on('keyup', function (event) {
        if(event.which === ESC_KEY) {
          scope.$apply(function (){
            scope.$eval(attrs.rgEscKeyup);
          });
          event.preventDefault();
        }
      });
    }
  };
}])
