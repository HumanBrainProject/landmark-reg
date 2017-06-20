(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarkView")
    .component("landmarkView", {
      templateUrl: "landmark-view/landmark-view.template.html",
      controller: LandmarkViewController
    });

  function LandmarkViewController(AlignmentTask, $log) {
    var vm = this;

    vm.incoming_cursor = [0, 0, 0];
    vm.incoming_display_referential = "native";
    vm.synchronize_cursors = false;
    vm.template_cursor = [0, 0, 0];
    vm.template_description = "dummy template";
    vm.transformation = null;
    vm.transformation_type = "rigid";
    vm.landmark_pairs = [];
    vm.current_alignment_task = null;

    vm.goToLandmarkPair = goToLandmarkPair;
    vm.performRegistration = performRegistration;
    vm.readyToTransform = readyToTransform;
    vm.transformationAvailable = transformationAvailable;
    vm.updateIncomingCursor = updateIncomingCursor;
    vm.updateTemplateCursor = updateTemplateCursor;

    ////////////

    function goToLandmarkPair(pair) {
      vm.template_cursor = pair.target_point.slice();
      vm.incoming_cursor = pair.source_point.slice();
    }

    function performRegistration() {
      var alignment_task_description = {
        source_image: "URI of source image",
        target_image: "URI of target image",
        landmark_pairs: vm.landmark_pairs
      };
      vm.current_alignment_task =
        AlignmentTask.create(alignment_task_description);
    }

    function readyToTransform() {
      switch(vm.transformation_type) {
      case "rigid":
      case "rigid+scaling":
      case "affine":
        return vm.landmark_pairs.length >= 3;
      default:
        $log.error("unknown transformation type");
        return false;
      }
    }

    function transformationAvailable() {
      return vm.transformation !== null;
    }

    function updateIncomingCursor(coords) {
      vm.incoming_cursor = coords;
    }

    function updateTemplateCursor(coords) {
      vm.template_cursor = coords;
    }
  }
})(); /* IIFE */
