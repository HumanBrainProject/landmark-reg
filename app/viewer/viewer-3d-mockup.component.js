(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkReg.viewer")
    .component("viewer3dMockup", {
      templateUrl: "viewer/viewer-3d-mockup.template.html",
      controller: Viewer3dMockupController,
      bindings: {
        onCursorUpdate: "&"
      }
    });

  function Viewer3dMockupController() {
    var vm = this;

    vm.cursor_X = 0;
    vm.cursor_Y = 0;
    vm.cursor_Z = 0;
    vm.sendCursorUpdate = sendCursorUpdate;

    ////////////

    function sendCursorUpdate() {
      vm.onCursorUpdate({coords: [vm.cursor_X, vm.cursor_Y, vm.cursor_Z]});
    }
  }

})(); /* IIFE */
