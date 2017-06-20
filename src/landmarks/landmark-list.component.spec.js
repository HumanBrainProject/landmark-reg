"use strict";

describe("landmarkRegApp.landmarks module", function() {
  beforeEach(module("landmarkRegApp.landmarks"));

  describe("LandmarkListController controller", function() {
    it("should initialize an empty landmark list",
       inject(function($componentController) {
         var ctrl = $componentController("landmarkList");

         expect(ctrl.landmark_pairs.length).toBe(0);
       }));
    it("should insert, delete, reset landmark pairs with the required attributes",
       inject(function($componentController) {
         var ctrl = $componentController("landmarkList");

         ctrl.onUpdate = jasmine.createSpy();

         ctrl.incoming_cursor = [1, 2, 3];
         ctrl.template_cursor = [4, 5, 6];

         ctrl.addLandmarkPair();

         expect(ctrl.landmark_pairs.length).toBe(1);
         expect(ctrl.landmark_pairs[0].target_point).toEqual(ctrl.template_cursor);
         expect(ctrl.landmark_pairs[0].source_point).toEqual(ctrl.incoming_cursor);

         ctrl.incoming_cursor = [10, 20, 30];
         ctrl.template_cursor = [40, 50, 60];

         ctrl.addLandmarkPair();

         expect(ctrl.landmark_pairs.length).toBe(2);

         ctrl.incoming_cursor = [100, 200, 300];
         ctrl.template_cursor = [400, 500, 600];

         ctrl.resetLandmarkPair(ctrl.landmark_pairs[0]);

         expect(ctrl.landmark_pairs.length).toBe(2);
         expect(ctrl.landmark_pairs[0].target_point).toEqual(ctrl.template_cursor);
         expect(ctrl.landmark_pairs[0].source_point).toEqual(ctrl.incoming_cursor);

         ctrl.deleteLandmarkPair(ctrl.landmark_pairs[0]);

         expect(ctrl.landmark_pairs.length).toBe(1);

         expect(ctrl.onUpdate).toHaveBeenCalledTimes(4);
       }));
    it("should insert landmark coordinates by value",
       inject(function($componentController) {
         var ctrl = $componentController("landmarkList");

         ctrl.incoming_cursor = [1, 2, 3];
         ctrl.template_cursor = [4, 5, 6];

         ctrl.addLandmarkPair();
         expect(ctrl.landmark_pairs[0].target_point).not.toBe(ctrl.template_cursor);
         expect(ctrl.landmark_pairs[0].source_point).not.toBe(ctrl.incoming_cursor);

         ctrl.resetLandmarkPair(ctrl.landmark_pairs[0]);
         expect(ctrl.landmark_pairs[0].target_point).not.toBe(ctrl.template_cursor);
         expect(ctrl.landmark_pairs[0].source_point).not.toBe(ctrl.incoming_cursor);
       }));
  });
});
