"use strict";

describe("landmarkList module", function() {
  beforeEach(module("landmarkList"));

  describe("LandmarkListController controller", function() {
    it("should create a landamark list with 2 landmarks",
       inject(function($componentController) {
      var ctrl = $componentController("landmarkList");

      expect(ctrl.landmark_pairs.length).toBe(2);
    }));
  });
});
