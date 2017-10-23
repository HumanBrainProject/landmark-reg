(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.datasets")
    .factory("DatasetList", DatasetList);

  function DatasetList($http, $log) {
    var service = {
      list: list
    };
    return service;

    ////////////

    function list() {
      $log.debug("fetching /datasets.json");
      return $http.get("/datasets.json")
        .then(function(success_response) {
          $log.debug("fetching /datasets.json: success");
          return success_response.data;
        }, function(error_response) {
          $log.debug("fetching /datasets.json: failure");
          return response;
        });
    }
  }
})(); /* IIFE */
