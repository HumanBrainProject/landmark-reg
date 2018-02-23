(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .factory("ZoomerMetadata", ZoomerMetadata);

  function ZoomerMetadata($http, $q) {
    var service = {
      fetch_metadata: fetch_metadata,
      validate_metadata: validate_metadata
    };

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

    return service;

    ////////////

    function fetch_metadata(image_url) {
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
          .then(function(success_response) {
            try {
              validate_metadata(success_response.data);
            } catch(error) {
              if(error instanceof ValidationError) {
                return $q.reject("invalid metadata in zoomer-info.json: "
                                 + error);
              } else {
                throw error;
              }
            }
            return success_response.data;
          });
      }
    }

    function validate_metadata(metadata_object) {
      if(!metadata_object.size
         || !metadata_object.voxel_size
         || !metadata_object.max_level
         || !metadata_object.tile_size) {
        throw new ValidationError("a required property is missing");
      }

      if(metadata_object.size.length != 3) {
        throw new ValidationError(
          "size must be an array of 3 non-negative integers");
      }
      /* jshint -W018 */
      metadata_object.size.forEach(function(element) {
        if(!Number.isInteger(element)
           || !(element > 0)) {
          throw new ValidationError(
            "size must be an array of 3 non-negative integers");
        }
      });

      if(metadata_object.voxel_size.length != 3) {
        throw new ValidationError(
          "voxel_size must be an array of 3 positive numbers");
      }
      metadata_object.voxel_size.forEach(function(element) {
        if(!Number.isFinite(element)
           || !(element > 0)) {
          throw new ValidationError(
            "voxel_size must be an array of 3 positive numbers");
        }
      });

      if(!Number.isInteger(metadata_object.max_level)
         || !(metadata_object.max_level > 0)) {
        throw new ValidationError("max_level must be a positive integer");
      }

      if(!Number.isInteger(metadata_object.tile_size)
         || !(metadata_object.tile_size > 0)) {
        throw new ValidationError("tile_size must be a positive integer");
      }

      if("level_offset" in metadata_object
         && (!Number.isInteger(metadata_object.level_offset)
             || !(metadata_object.level_offset > 0))) {
        throw new ValidationError("level_offset must be a positive integer");
      }

      if("axis_orientations" in metadata_object) {
        if(typeof metadata_object.axis_orientations !== "string"
           || metadata_object.axis_orientations.length != 4) {
          throw new ValidationError(
            "axis_orientations must be a string of length 4");
        }

        // TODO validate the axis_orientations string
      }
    }
  }

  ValidationError.prototype = {
    toString: function() {
      return this.message;
    }
  };
  function ValidationError(message) {
    this.message = message;
  }
})(); /* IIFE */
