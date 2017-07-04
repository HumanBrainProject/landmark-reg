(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .factory("ZoomerMetadata", ZoomerMetadata);

  function ZoomerMetadata() {
    return {
      get_metadata: function(image_url) {
        // TODO fetch the metadata dynamically from a hosted JSON
        return this._static_metadata[image_url];
      },

      _static_metadata : {
        "/data/BigBrain-160um": {
          "size": [822, 926, 714],
          "voxel_size": [0.16933333333333334, 0.160, 0.16933333333333334],
          "max_level": 2,
          "tile_size": 256
        },
        "/data/B20_stn_l": {
          "size": [1002, 820, 489],
          "voxel_size": [0.016, 0.016, 0.020],
          "max_level": 3,
          "tile_size": 256
        },
        "http://www.nesys.uio.no/CDPTest/data": {
          "size": [1643, 1428, 1851],
          "voxel_size": [0.084666666666666666, 0.08, 0.084666666666666666],
          "level_offset": 2,
          "max_level": 3,
          "tile_size": 256
        }
      }
    };
  }
})(); /* IIFE */