// Define the `landmarkRegApp` module
var landmarkRegApp = angular.module('landmarkRegApp', ['ui.bootstrap']);

// Define the `LandmarkListController` controller on the `landmarkRegApp` module
landmarkRegApp.controller('LandmarkListController', function LandmarkListController($scope) {
  $scope.landmark_pairs = [
    // Test data
    {
        atlas_point: [10, 11, 12],
        incoming_point: [20, 21, 22]
    }, {
        atlas_point: [15, 16, 17],
        incoming_point: [25, 26, 27]
    }
  ];
});
