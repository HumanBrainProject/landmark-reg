(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .factory("ZoomerMetadata", ZoomerMetadata);

  function ZoomerMetadata($http, $q) {
    var static_metadata = {
      "http://www.nesys.uio.no/CDPTest/data": {
        "size": [1643, 1428, 1851],
        "voxel_size": [0.084666666666666666, 0.08, 0.084666666666666666],
        "level_offset": 2,
        "max_level": 3,
        "tile_size": 256,
        "axis_orientations": "RIA+"
      }
    };

    return {
      fetch_metadata: function(image_url) {
        // Use $q to expose a promise just like $http
        if(image_url in static_metadata) {
          return $q(function(resolve) {
            resolve(static_metadata[image_url]);
          });
          // For testing
          // return $q(function(resolve) {
          //   $timeout(function() {
          //     resolve(static_metadata[image_url]);
          //   }, 10000);
          // });
        } else {
          return $http.get(image_url + "/zoomer-info.json")
            .then(function(response) { return response.data; });
        }
      }
    };

    ////////////

  }
})(); /* IIFE */
