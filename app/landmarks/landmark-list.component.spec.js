"use strict";

describe("landmarkRegApp.landmarks module", function() {
  beforeEach(module("landmarkRegApp.landmarks"));

  describe("LandmarkListController controller", function() {
    it("should initialize an empty landamark list",
       inject(function($componentController) {
         var ctrl = $componentController("landmarkList");

         expect(ctrl.landmark_pairs.length).toBe(0);
       }));
  });
});
