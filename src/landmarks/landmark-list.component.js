(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarks")
    .component("landmarkList", {
      templateUrl: "landmarks/landmark-list.template.html",
      bindings: {
        onUpdate: "&?",
        goToLandmarkPair: "&?",
        incoming_cursor: "<incomingCursor",
        template_cursor: "<templateCursor"
      },
      controller: LandmarkListController
    });

  function LandmarkListController($log, $window, LandmarkFileIo) {
    var vm = this;

    vm.landmark_pairs = [];

    vm.addLandmarkPair = addLandmarkPair;
    vm.deleteLandmarkPair = deleteLandmarkPair;
    vm.pairIsActive = pairIsActive;
    vm.resetLandmarkPair = resetLandmarkPair;
    vm.loadLandmarks = loadLandmarks;
    vm.saveLandmarks = saveLandmarks;
    vm.getLandmarkStyle = getLandmarkStyle;

    ////////////

    function generate_name() {
      var i = 1;
      function predicate(pair) {return pair.name == i;}
      while(vm.landmark_pairs.find(predicate))
        i++;
      return String(i);
    }

    // Colormap from ColorBrewer:
    // http://colorbrewer2.org/?type=qualitative&scheme=Set3&n=12
    var colours = [
      "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462",
      "#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];

    function generate_colour() {
      var colour_use_count = colours.map(function(colour) {
        return vm.landmark_pairs.reduce(function(count, pair) {
          if(pair.colour == colour) {
            return count + 1;
          } else {
            return count;
          }
        }, 0);
      });

      var least_used_colours = colours.map(function(colour, index) {
        var count = colour_use_count[index];
        return {colour: colour, count: count};
      });
      least_used_colours.sort(function(a, b) { return a.count - b.count; });
      return least_used_colours[0].colour;
    }

    function getLandmarkStyle(landmark){
      return {
        color : landmark.colour
      };
    }

    function addLandmarkPair() {
      vm.landmark_pairs.push({
        target_point: vm.template_cursor.slice(),
        source_point: vm.incoming_cursor.slice(),
        active: true,
        name: generate_name(),
        colour: generate_colour()
      });
      if(vm.onUpdate)
        vm.onUpdate({landmark_pairs: vm.landmark_pairs});
    }

    function deleteLandmarkPair(pair) {
      var index = vm.landmark_pairs.indexOf(pair);
      if(index >= 0) {
        vm.landmark_pairs.splice(index, 1);
      } else {
        $log.error("deleteLandmarkPair cannot find the requested pair");
      }
      if(vm.onUpdate)
        vm.onUpdate({landmark_pairs: vm.landmark_pairs});
    }

    function saveLandmarks() {
      LandmarkFileIo.save_to_file(vm.landmark_pairs, "landmarks.json");
    }

    function loadLandmarks() {
      LandmarkFileIo.open_with_file_dialog().then(function(result) {
        vm.landmark_pairs = result;
        if(vm.onUpdate)
          vm.onUpdate({landmark_pairs: vm.landmark_pairs});
      }, function(reason) {
        // TODO nicer error feedback
        $window.alert("Could not load landmarks from file: " + reason);
      });
    }

    function pairIsActive(pair) {
      return angular.equals(pair.target_point, vm.template_cursor)
        && angular.equals(pair.source_point, vm.incoming_cursor);
    }

    function resetLandmarkPair(pair) {
      var index = vm.landmark_pairs.indexOf(pair);
      if(index >= 0) {
        vm.landmark_pairs[index].target_point = vm.template_cursor.slice();
        vm.landmark_pairs[index].source_point = vm.incoming_cursor.slice();
      } else {
        $log.error("deleteLandmarkPair cannot find the requested pair");
      }
      if(vm.onUpdate)
        vm.onUpdate({landmark_pairs: vm.landmark_pairs});
    }
  }
})(); /* IIFE */
