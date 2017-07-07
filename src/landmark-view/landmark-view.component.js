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
    vm.incoming_image_url = "/data/B20_stn_l";

    vm.template_cursor = [0, 0, 0];
    //vm.template_image_url = "/data/BigBrain-160um";
    vm.template_image_url = "/data/BigBrainRelease.2015";
    //vm.template_image_url = "http://www.nesys.uio.no/CDPTest/data";

    vm.landmark_pairs = [];
    vm.transformation_type = "rigid";
    vm.registration_result = {};
    vm.synchronize_cursors = false;
    vm.synchronize_zoom = false;

    vm.goToLandmarkPair = goToLandmarkPair;
    vm.matrix_det = matrix_det;
    vm.performRegistration = performRegistration;
    vm.readyToTransform = readyToTransform;
    vm.resultUpToDate = resultUpToDate;
    vm.transformationAvailable = transformationAvailable;
    vm.updateIncomingCursor = updateIncomingCursor;
    vm.updateTemplateCursor = updateTemplateCursor;
    vm.incomingPixelSizeUpdated = incomingPixelSizeUpdated;
    vm.templatePixelSizeUpdated = templatePixelSizeUpdated;
    vm.zoomSynchronizationToggled = zoomSynchronizationToggled;

    ////////////

    function goToLandmarkPair(pair) {
      vm.template_cursor = pair.target_point.slice();
      vm.incoming_cursor = pair.source_point.slice();
    }

    function active_landmark_pairs() {
      return vm.landmark_pairs.filter(function(pair){return pair.active;});
    }

    function alignmentTask() {
      return {
        source_image: vm.incoming_image_url,
        target_image: vm.template_image_url,
        transformation_type: vm.transformation_type,
        landmark_pairs: active_landmark_pairs()
      };
    }

    function performRegistration() {
      var request_description = alignmentTask();
      // Deep-copy the request object
      vm.registration_request = $.extend(true, {}, request_description);
      vm.registration_result = LeastSquares.compute(vm.registration_request);
    }

    function resultUpToDate() {
      return angular.equals(vm.registration_request, alignmentTask());
    }

    function readyToTransform() {
      var active_pairs = active_landmark_pairs();
      switch(vm.transformation_type) {
      case "translation":
        return active_pairs.length >= 1;
      case "rigid":
        return active_pairs.length >= 2;
      case "similarity":
      case "affine":
        return active_pairs.length >= 3;
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
      if(!mat)
        return null;
      if(mat.length == 2) {
        return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];
      } else {
        var res = 0;
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

    function incomingPixelSizeUpdated(pixel_size) {
      vm.incoming_pixel_size = pixel_size;
      if(vm.synchronize_zoom)
        vm.template_pixel_size = pixel_size;
    }

    function templatePixelSizeUpdated(pixel_size) {
      vm.template_pixel_size = pixel_size;
      if(vm.synchronize_zoom)
        vm.incoming_pixel_size = pixel_size;
    }

    function zoomSynchronizationToggled() {
      vm.incoming_pixel_size = vm.template_pixel_size = Math.max(
        vm.incoming_pixel_size, vm.template_pixel_size);
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
