(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.datasets")
    .factory("DatasetList", DatasetList);

  function DatasetList(CONFIG, $http, $q, $log) {
    var service = {
      list: list
    };
    return service;

    ////////////

    function list() {
      var deferred = $q.defer();
      var concatenated_list = [];
      var responses_received = 0;
      var fetch_file_list = CONFIG.dataset_list_sources;
      if(CONFIG.image_upload_service) {
        fetch_file_list.push(CONFIG.image_upload_service + "uploads");
      }

      function handle_any_response(response) {
        responses_received++;
        if(responses_received == fetch_file_list.length) {
          deferred.resolve(concatenated_list);
        }
      }

      function receive_handler(success_response) {
        concatenated_list = concatenated_list.concat(success_response.data);
        deferred.notify(concatenated_list);
        handle_any_response(success_response);
      }

      function error_handler(error_response) {
        handle_any_response(error_response);
      }

      fetch_file_list.forEach(function(url) {
        $http.get(url).then(receive_handler, error_handler);
      });

      return deferred.promise;
    }
  }
})(); /* IIFE */
