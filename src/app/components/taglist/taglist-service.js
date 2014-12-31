'use strict';

angular.module('koastAdminApp.components.taglist.taglist-service', [])
  .factory('tagList', function() {
    var cids = {};
    return {
      _register: function(cid, getTags) {
        cids[cid] = getTags;
      },
      _get: function(cid) {
        return cids[cid];
      },
      val: function(cid) { //Retruns an array of tags associated with the tagList
        var getTag = cids[cid];
        return getTag ? getTag() : [];
      }
    };
  });
