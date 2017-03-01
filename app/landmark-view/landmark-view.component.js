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

    vm.addLandmarkPair = addLandmarkPair;
    vm.deleteLandmarkPair = deleteLandmarkPair;
    vm.resetLandmarkPair = resetLandmarkPair;
    vm.showLandmarkPair = showLandmarkPair;
    vm.updateIncomingCursor = updateIncomingCursor;
    vm.updateTemplateCursor = updateTemplateCursor;

    ////////////

    function addLandmarkPair() {
      vm.landmark_pairs.push(
        {target_point: vm.incoming_cursor,
         source_point: vm.template_cursor});
    }

    function deleteLandmarkPair(pair) {
      var index = vm.landmark_pairs.indexOf(pair);
      if(index >= 0) {
        vm.landmark_pairs.splice(index, 1);
      }
    }

    function resetLandmarkPair(pair) {
      var index = vm.landmark_pairs.indexOf(pair);
      if(index >= 0) {
        vm.landmark_pairs[index] =
          {target_point: vm.incoming_cursor,
           source_point: vm.template_cursor};
      }
    }

    function showLandmarkPair(pair) {
      $log.warn("showLandmarkPair: not implemented yet");
    }

    function updateIncomingCursor(coords) {
      vm.incoming_cursor = coords;
    }

    function updateTemplateCursor(coords) {
      vm.template_cursor = coords;
    }
}
})(); /* IIFE */
