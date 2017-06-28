(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.alignment")
    .factory("AlignmentTask", AlignmentTask);

  function AlignmentTask($resource) {
    var service = $resource("/api/alignment-task", {}, {
      create: {method: "POST"}
    });
    return service;
  }
})(); /* IIFE */
