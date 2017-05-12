(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .component("viewer3dMockup", {
      templateUrl: "viewer/viewer-3d-mockup.template.html",
      controller: Viewer3dMockupController,
      bindings: {
        cursor: "="
      }
    });

  function Viewer3dMockupController($log) {
    var vm = this;

    vm.cursor = [0, 0, 0];

    ////////////

  }

})(); /* IIFE */
