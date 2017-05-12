"use strict";

describe("landmarkRegApp.landmarkView module", function() {
  beforeEach(module("landmarkRegApp.landmarkView"));

  describe("LandmarkViewController controller", function() {
    it("should change the cursor when requested to go to a landmark pair",
       inject(function($componentController) {
         var ctrl = $componentController("landmarkView");

         ctrl.goToLandmarkPair({target_point: [1, 2, 3],
                                source_point: [4, 5, 6]});
         expect(ctrl.template_cursor).toEqual([1, 2, 3]);
         expect(ctrl.incoming_cursor).toEqual([4, 5, 6]);
       }));
  });
});
