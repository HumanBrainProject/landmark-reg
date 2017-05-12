(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarks")
    .component("landmarkList", {
      templateUrl: "landmarks/landmark-list.template.html",
      bindings: {
        onUpdate: "&",
        goToLandmarkPair: "&",
        incoming_cursor: "<incomingCursor",
        template_cursor: "<templateCursor"
      },
      controller: LandmarkListController
    });

  function LandmarkListController($log) {
    var vm = this;

    vm.landmark_pairs = [];

    vm.addLandmarkPair = addLandmarkPair;
    vm.deleteLandmarkPair = deleteLandmarkPair;
    vm.resetLandmarkPair = resetLandmarkPair;

    ////////////

    function addLandmarkPair() {
      vm.landmark_pairs.push(
        {target_point: vm.template_cursor.slice(),
         source_point: vm.incoming_cursor.slice()});
      if(vm.onUpdate)
        vm.onUpdate({landmark_pairs: vm.landmark_pairs});
    }

    function deleteLandmarkPair(pair) {
      var index = vm.landmark_pairs.indexOf(pair);
      if(index >= 0) {
        vm.landmark_pairs.splice(index, 1);
      } else {
        $log.error("deleteLandmarkPair cannot find the requested pair")
      }
      if(vm.onUpdate)
        vm.onUpdate({landmark_pairs: vm.landmark_pairs});
    }

    function resetLandmarkPair(pair) {
      var index = vm.landmark_pairs.indexOf(pair);
      if(index >= 0) {
        vm.landmark_pairs[index] =
          {target_point: vm.template_cursor.slice(),
           source_point: vm.incoming_cursor.slice()};
      } else {
        $log.error("deleteLandmarkPair cannot find the requested pair")
      }
      if(vm.onUpdate)
        vm.onUpdate({landmark_pairs: vm.landmark_pairs});
    }
  }
})(); /* IIFE */
