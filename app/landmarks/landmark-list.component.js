(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkReg.landmarks")
    .component("landmarkList", {
      templateUrl: "landmarks/landmark-list.template.html",
      controller: LandmarkListController
    });

  function LandmarkListController() {
    var vm = this;
    vm.landmark_pairs = [];
  }

})(); /* IIFE */
