"use strict";

describe("landmarkRegApp.viewer module", function() {
  beforeEach(module("landmarkRegApp.viewer"));

  describe("viewer3dMockup controller", function() {
    it("should initialize the cursor at (0, 0, 0)",
       inject(function($componentController) {
         var ctrl = $componentController("viewer3dMockup");

         expect(ctrl.cursor_X).toBe(0);
         expect(ctrl.cursor_Y).toBe(0);
         expect(ctrl.cursor_Z).toBe(0);
       }));
  });
});
