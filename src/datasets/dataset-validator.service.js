(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.datasets")
    .factory("DatasetValidator", DatasetValidator);

  function DatasetValidator(ZoomerMetadata, $http, $q, $log) {
    var service = {
      validate: validate
    };
    return service;

    ////////////

    function validate(dataset) {
      if(!dataset.zoomer_url || !dataset.neuroglancer_url) {
        var deferred = $q.defer();
        deferred.reject(
          "malformed dataset object: missing an essential property");
        return deferred.promise;
      }

      // TODO validate Neuroglancer metadata as well? Tricky, because any
      // datasource could be used (not necessarily "precomputed").
      return ZoomerMetadata.fetch_metadata(dataset.zoomer_url)
        .then(function() { return true; });
    }
  }
})(); /* IIFE */
