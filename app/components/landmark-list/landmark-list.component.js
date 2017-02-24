angular.
  module("landmarkList").
  component("landmarkList", {
    templateUrl: "components/landmark-list/landmark-list.template.html",
    controller: function LandmarkListController() {
      this.landmark_pairs = [];
    }
  });
