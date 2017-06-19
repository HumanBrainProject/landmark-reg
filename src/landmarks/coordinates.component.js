(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarks")
    .component("coordinates", {
      templateUrl: 'landmarks/coordinates.template.html',
      bindings: {
        coords: "<"
      }
    });
})(); /* IIFE */
