(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarks")
    .component("landmarkList", {
      templateUrl: "landmarks/landmark-list.template.html",
      bindings: {
        landmark_pairs: "<landmarkPairs",
        onDelete: "&",
        onReset: "&",
        onShow: "&"
      }
    });
})(); /* IIFE */
