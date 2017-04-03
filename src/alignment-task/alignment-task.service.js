(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.alignmentTask")
    .factory("AlignmentTask", AlignmentTask);

  function AlignmentTask($resource) {
    var service = $resource("/api/alignment-task", {}, {
      create: {method: "POST"}
    });
    return service;
  }
})(); /* IIFE */
