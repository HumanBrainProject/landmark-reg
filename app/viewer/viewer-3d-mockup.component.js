(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkReg.viewer")
    .component("viewer3dMockup", {
      templateUrl: "viewer/viewer-3d-mockup.template.html",
      controller: Viewer3dMockupController
    });

  function Viewer3dMockupController() {
    var vm = this;
    vm.cursor_X = 0;
    vm.cursor_Y = 0;
    vm.cursor_Z = 0;
  }

})(); /* IIFE */
