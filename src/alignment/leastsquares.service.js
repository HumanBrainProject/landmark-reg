(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.alignment")
    .factory("LeastSquares", LeastSquares);

  function LeastSquares(CONFIG, $resource) {
    var service = $resource(CONFIG.backend_url + "/least-squares", {}, {
      compute: {method: "POST"}
    });
    return service;
  }
})(); /* IIFE */
