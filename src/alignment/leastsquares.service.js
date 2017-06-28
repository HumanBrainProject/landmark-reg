(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.alignment")
    .factory("LeastSquares", LeastSquares);

  function LeastSquares($resource) {
    var service = $resource("/api/least-squares", {}, {
      compute: {method: "POST"}
    });
    return service;
  }
})(); /* IIFE */
