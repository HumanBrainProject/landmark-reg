(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.datasets")
    .component("datasetSelectorModal", {
      templateUrl: "datasets/dataset-selector-modal.template.html",
      controller: DatasetSelectorModalController,
      bindings: {
        resolve: "<",
        close: "&",
        dismiss: "&"
      }
    });

  function DatasetSelectorModalController(DatasetList, DatasetValidator,
                                          $uibModal, $log) {
    var vm = this;

    vm.$onInit = $onInit;
    vm.open_upload_modal = open_upload_modal;
    vm.same_dataset = same_dataset;
    vm.select = select;
    vm.validate = validate;
    vm.validation_status = validation_status;
    vm.validation_message = validation_message;
    vm.ok = ok;
    vm.cancel = cancel;

    ////////////

    function $onInit() {
      vm.datasets = [];
      vm.selected = {dataset: vm.resolve.initial_selection};
      vm.validation_results = {};

      select(vm.resolve.initial_selection);

      DatasetList.list().then(function(datasets) {
        vm.datasets = datasets;
      }, function(error) {
        $log.error("cannot populate items from DatasetList: " + error);
      }, function(partial_dataset_list) {
        vm.datasets = partial_dataset_list;
      });
    }

    function ok() {
      vm.close({$value: vm.selected.dataset});
    }

    function cancel() {
      vm.dismiss({$value: "cancel"});
    }

    function same_dataset(dataset1, dataset2) {
      return dataset1.zoomer_url == dataset2.zoomer_url;
    }

    function select(dataset) {
      vm.selected.dataset = dataset;
      validate(dataset);
    }

    function validation_status(dataset) {
      if(!dataset)
        return "invalid";
      var result = vm.validation_results[dataset.zoomer_url];
      if(result !== undefined)
        return result.status;
    }

    function validation_message(dataset) {
      if(!dataset)
        return;
      var result = vm.validation_results[dataset.zoomer_url];
      if(result !== undefined)
        return result.message;
    }

    function validate(dataset) {
      vm.validation_results[dataset.zoomer_url] = {status: "pending"};
      return DatasetValidator.validate(dataset).then(
        function() {
          vm.validation_results[dataset.zoomer_url] = {status: "valid"};
        },
        function(reason) {
          vm.validation_results[dataset.zoomer_url] = {status: "invalid", message: reason};
        });
    }

    function open_upload_modal() {
      var modalInstance = $uibModal.open({
        component: "datasetUploadModal",
        size: "md"
      });
      modalInstance.result.then(function(result) {
        if(result) {
          vm.select(result);
          // TODO refresh list?
        }
      }, function() {});
    }

  }
})(); /* IIFE */
