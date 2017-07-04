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
    vm.matrix_det = matrix_det;
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

    function matrix_4_4_dot_vec4(mat, vec) {
      return [mat[0][0] * vec[0]
              + mat[0][1] * vec[1]
              + mat[0][2] * vec[2]
              + mat[0][3] * vec[3],
              mat[1][0] * vec[0]
              + mat[1][1] * vec[1]
              + mat[1][2] * vec[2]
              + mat[1][3] * vec[3],
              mat[2][0] * vec[0]
              + mat[2][1] * vec[1]
              + mat[2][2] * vec[2]
              + mat[2][3] * vec[3],
              mat[3][0] * vec[0]
              + mat[3][1] * vec[1]
              + mat[3][2] * vec[2]
              + mat[3][3] * vec[3]];
    }

    function matrix_det(mat) {
      if(mat == undefined)
        return null;
      if(mat.length == 2) {
        return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];
      } else {
        var res = 0.;
        for(var i = 0; i < mat.length; i++) {
          var minor = [];
          for(var j = 0; j < mat.length - 1; j++) {
            minor[j] = mat[j + 1].slice(0, i).concat(mat[j + 1].slice(i + 1, mat.length));
          }
          var sign = 1 - 2 * (i % 2);
          res += sign * mat[0][i] * matrix_det(minor);
        }
        return res;
      }
    }

    function updateIncomingCursor(coords) {
      vm.incoming_cursor = coords;
      if(vm.synchronize_cursors) {
        var homogeneous_coords = [coords[0], coords[1], coords[2], 1];
        var homogeneous_result = matrix_4_4_dot_vec4(
          vm.registration_result.transformation_matrix,
          homogeneous_coords);
        vm.template_cursor = homogeneous_result.slice(0, 3);
      }
    }

    function updateTemplateCursor(coords) {
      vm.template_cursor = coords;
      if(vm.synchronize_cursors) {
        var homogeneous_coords = [coords[0], coords[1], coords[2], 1];
        var homogeneous_result = matrix_4_4_dot_vec4(
          vm.registration_result.inverse_matrix,
          homogeneous_coords);
        vm.incoming_cursor = homogeneous_result.slice(0, 3);
      }
    }
  }
})(); /* IIFE */
