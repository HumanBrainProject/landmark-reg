(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.matrix")
    .component("transformationMatrix", {
      templateUrl: "matrix/matrix.template.html",
      bindings: {
        matrix: "<"
      }
    });
})(); /* IIFE */
