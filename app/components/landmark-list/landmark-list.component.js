angular.
  module("landmarkList").
  component("landmarkList", {
    templateUrl: "components/landmark-list/landmark-list.template.html",
    controller: function LandmarkListController() {
      this.landmark_pairs = [
        // Demo data
        {
          atlas_point: [10, 11, 12],
          incoming_point: [20, 21, 22]
        }, {
          atlas_point: [15, 16, 17],
          incoming_point: [25, 26, 27]
        }
      ];
    }
  });
