(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .component("viewer3dMockup", {
      templateUrl: "viewer/viewer-3d-mockup.template.html",
      controller: Viewer3dMockupController,
      bindings: {
        cursor: "<",
        onCursorUpdate: "&"
      }
    });

  function Viewer3dMockupController($log) {
    var vm = this;

    vm.cursorUpdate = cursorUpdate;

    ////////////

    function cursorUpdate() {
      vm.onCursorUpdate({cursor: vm.cursor});
    }

    function $onChanges(changes) {
      if(changes.cursor) {
        vm.cursor = changes.cursor.current_value.slice();
      }
    }

  }

})(); /* IIFE */
