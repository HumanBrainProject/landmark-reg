"use strict";

describe("landmarkRegApp.viewer module", function() {
  beforeEach(module("landmarkRegApp.viewer"));

  describe("viewer3dMockup controller", function() {
    it("should make its own local copy of the cursor",
       inject(function($componentController) {
         var original_cursor = [1, 2, 3];
         var bindings = {cursor: original_cursor};
         var ctrl = $componentController("viewer3dMockup", null, bindings);

         // During tests this is not called, so call it manually (maybe there
         // is a better way?)
         ctrl.$onChanges({cursor: {current_value: original_cursor}});

         expect(ctrl.cursor).toEqual(original_cursor);
         expect(ctrl.cursor).not.toBe(original_cursor);
       }));
    it("should notify updates to the cursor",
       inject(function($componentController) {
         var cursorUpdateSpy = jasmine.createSpy("onCursorUpdate");
         var bindings = {onCursorUpdate: cursorUpdateSpy};
         var ctrl = $componentController("viewer3dMockup", null, bindings);

         ctrl.cursor = [4, 5, 6];
         ctrl.sendCursorUpdate();
         expect(cursorUpdateSpy).toHaveBeenCalledWith({cursor: [4, 5, 6]});
       }));
  });
});
