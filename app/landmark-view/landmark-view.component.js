(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarkView")
    .component("landmarkView", {
      templateUrl: "landmark-view/landmark-view.template.html",
      controller: LandmarkViewController
    });

  LandmarkViewController.$inject = ["$log"];
  function LandmarkViewController($log) {
    var vm = this;

    vm.incoming_cursor = [0, 0, 0];
    vm.template_cursor = [0, 0, 0];
    vm.template_description = "dummy template";
    vm.landmark_pairs = [];

    vm.goToLandmarkPair = goToLandmarkPair;
    vm.updateIncomingCursor = updateIncomingCursor;
    vm.updateTemplateCursor = updateTemplateCursor;

    ////////////

    function goToLandmarkPair(pair) {
      $log.warn("goToLandmarkPair: not implemented yet");
    }

    function updateIncomingCursor(coords) {
      vm.incoming_cursor = coords;
    }

    function updateTemplateCursor(coords) {
      vm.template_cursor = coords;
    }
  }
})(); /* IIFE */
