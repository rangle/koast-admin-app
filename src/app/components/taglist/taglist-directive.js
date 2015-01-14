'use strict';

angular.module('koastAdminApp.components.taglist.taglist-directive', [
    'koastAdminApp.components.taglist.taglist-service'
])
  .directive('tagList', function(tagList) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/taglist/taglist.html',
      scope: {},
      link: function(scope, elem, attrs) {
        var id = attrs.cid;
        var tags = {};

        if(tagList._get(id))  {
          throw new Error('Attempted to initialize tagList with cid "' + id + '" twice!');
        }

        scope.tags = function() {
          if (tagList.resetFlag === true) {
            tags = {};
            tagList.reset();
            tagList._register(id, scope.tags);
          }
          return Object.keys(tags);
        };

        scope.removeTag = function(tag) {
          delete tags[tag];
        };

        tagList._register(id, scope.tags);

        function update() {
          if(scope.currentTag && scope.currentTag.indexOf(',') !== -1) {
            scope.addTag(scope.currentTag.replace(',', ''));
          }
        }

        scope.addTag = function(tag) {
          if (tag && tag.length > 0) {
            tags[tag] = true;
            scope.currentTag = '';
          }
        }

        scope.$watch('currentTag', update);
      }
    };
  });
