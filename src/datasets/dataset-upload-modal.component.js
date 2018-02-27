(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.datasets")
    .component("datasetUploadModal", {
      templateUrl: "datasets/dataset-upload-modal.template.html",
      controller: DatasetUploadModalController,
      bindings: {
        resolve: "<", // TODO is that still needed?
        close: "&",
        dismiss: "&"
      }
    });

  function DatasetUploadModalController(CONFIG, $http, $timeout) {
    var vm = this;

    vm.$onInit = $onInit;
    vm.conversion_status_neuroglancer = conversion_status_neuroglancer;
    vm.conversion_status_zoomer = conversion_status_zoomer;
    vm.dataset_ready = dataset_ready;
    vm.uploadFile = uploadFile;
    vm.ok = ok;
    vm.cancel = cancel;

    ////////////

    function $onInit() {
      reset();
    }

    function reset() {
      vm.conversion_status = null;
      vm.conversion_status_url = null;
      vm.dataset = null;
      vm.error_message = null;
      vm.upload_progress_percent = null;
    }

    function ok() {
      vm.close({$value: vm.dataset});
    }

    function cancel() {
      vm.dismiss({$value: "cancel"});
    }

    function conversion_status_neuroglancer() {
      if(vm.conversion_status)
        return vm.conversion_status.neuroglancer_status;
    }

    function conversion_status_zoomer() {
      if(vm.conversion_status)
        return vm.conversion_status.zoomer_status;
    }

    function dataset_ready() {
      return vm.dataset && vm.dataset.neuroglancer_url && vm.dataset.zoomer_url;
    }

    function uploadFile() {
      reset();
      var form_data = new FormData();
      form_data.append("file", vm.file);
      $http({
        method: "POST",
        url: CONFIG.image_upload_service + "upload",
        data: form_data,
        // By default AngularJS sets Content-Type to application/json,
        // resetting it to undefined allows the browser to set it to
        // multipart/form-data.
        headers: {
          "Content-Type": undefined
        },
        uploadEventHandlers: {
          progress: on_upload_progress
        }
      }).then(function(response) {
        vm.error_message = null;
        if(response.data.upload_url) {
          vm.conversion_status_url = response.data.upload_url;
          $timeout(poll_conversion_status);
        }
      }, function(response) {
        vm.error_message = "Upload error " + format_http_error(response);
      });
    }

    function poll_conversion_status() {
      $http({
        method: "GET",
        url: vm.conversion_status_url,
        timeout: 1000
      }).then(function(response) {
        vm.conversion_status = response.data;
        if(vm.conversion_status.conversion_finished == false) {
          $timeout(poll_conversion_status, 1000);
        }
        if(vm.conversion_status.neuroglancer_url
           && vm.conversion_status.zoomer_url) {
          vm.dataset = {
            neuroglancer_url: vm.conversion_status.neuroglancer_url,
            zoomer_url: vm.conversion_status.zoomer_url
          };
        }
      }, function(response) {
        if(response.xhrStatus == "timeout") {
          // Try again in case of time out
          $timeout(poll_conversion_status);
        } else if(response.xhrStatus == "error") {
          vm.error_message = ("Cannot poll conversion status: "
                              + format_http_error(response));
        }
      });
    }

    function on_upload_progress(event) {
      if (event.lengthComputable) {
        vm.upload_progress_percent = 100 * event.loaded / event.total;
      }
    }

    function format_http_error(response) {
      var message = response.status + "(" + response.statusText + ")";
      if(response.data && response.data.message) {
        message += ": " + response.data.message;
      }
      return message;
    }
  }
})(); /* IIFE */
