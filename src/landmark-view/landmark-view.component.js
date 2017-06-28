(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarkView")
    .component("landmarkView", {
      templateUrl: "landmark-view/landmark-view.template.html",
      controller: LandmarkViewController
    });

  function LandmarkViewController(LeastSquares, $log) {
    var vm = this;

    vm.incoming_cursor = [0, 0, 0];
    vm.incoming_display_referential = "native";
    vm.synchronize_cursors = false;
    vm.template_cursor = [0, 0, 0];
    vm.template_description = "dummy template";
    vm.transformation_type = "rigid";
    vm.landmark_pairs = [];
    vm.registration_result = {};

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
        transformation_type: vm.transformation_type,
        landmark_pairs: vm.landmark_pairs
      };
      vm.registration_result = LeastSquares.compute(alignment_task_description);
    }

    function readyToTransform() {
      switch(vm.transformation_type) {
      case "translation":
        return vm.landmark_pairs.length >= 1;
      case "rigid":
        return vm.landmark_pairs.length >= 2;
      case "similarity":
      case "affine":
        return vm.landmark_pairs.length >= 3;
      default:
        $log.error("unknown transformation type");
        return false;
      }
    }

    function transformationAvailable() {
      return "transformation_matrix" in vm.registration_result;
    }

    function updateIncomingCursor(coords) {
      vm.incoming_cursor = coords;
    }

    function updateTemplateCursor(coords) {
      vm.template_cursor = coords;
    }
  }
})(); /* IIFE */
