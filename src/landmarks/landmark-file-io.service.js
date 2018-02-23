(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarks")
    .factory("LandmarkFileIo", LandmarkFileIo);

  function LandmarkFileIo($q, $window) {
    var service = {
      load_from_file: load_from_file,
      open_with_file_dialog: open_with_file_dialog,
      save_to_file: save_to_file
    };
    return service;

    ////////////

    function load_from_file(blob) {
      return $q(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(event) {
          var text_contents = event.target.result;
          var landmark_pairs;
          try {
            landmark_pairs = angular.fromJson(text_contents);
          } catch(e) {
            reject(e);
          }
          // TODO validate result
          resolve(landmark_pairs);
        };
        reader.onerror = function() {
          reject("error reading file: " + reader.error.name);
        };
        reader.readAsText(blob, "UTF-8");
      });
    }

    function open_with_file_dialog() {
      return $q(function(resolve, reject) {
        var file_selector = $window.document.createElement("input");
        file_selector.type = "file";
        file_selector.accept = "application/json";
        file_selector.style.display = "none";

        file_selector.onchange = function() {
          var file = file_selector.files[0];
          $window.document.body.removeChild(file_selector);

          var promise = load_from_file(file);
          resolve(promise);
        };

        $window.document.body.appendChild(file_selector);
        file_selector.click();
      });
    }

    function save_to_file(landmark_pairs, filename) {
      var blob = new Blob([angular.toJson(landmark_pairs, 2)],
                          {type: "application/json"});

      var link = $window.document.createElement("a");
      link.download = filename;
      link.href = $window.URL.createObjectURL(blob);
      link.onclick = function(event) {
        $window.document.body.removeChild(event.target);
      };
      link.style.display = "none";

      $window.document.body.appendChild(link);
      link.click();
    }
  }
})(); /* IIFE */
