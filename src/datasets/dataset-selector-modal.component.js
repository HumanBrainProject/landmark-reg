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

  function DatasetSelectorModalController(DatasetList, $log) {
    var vm = this;

    vm.$onInit = $onInit;
    vm.ok = ok;
    vm.cancel = cancel;

    ////////////

    function $onInit() {
      vm.items = [];
      vm.selected = vm.resolve.initial_selection;

      DatasetList.list().then(function(items) {
        vm.items = items;
      }, function(error) {
        $log.error("cannot populate items from DatasetList: " + error);
      }, function(items) {
        vm.items = items;
      });
    }

    function ok() {
      vm.close({$value: vm.selected.item});
    }

    function cancel() {
      vm.dismiss({$value: "cancel"});
    }
  }
})(); /* IIFE */
