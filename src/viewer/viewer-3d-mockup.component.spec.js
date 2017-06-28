"use strict";

describe("landmarkRegApp.viewer module", function() {
  beforeEach(module("landmarkRegApp.viewer"));

  describe("viewer3dMockup controller", function() {
    it("should make its own local copy of the cursor",
       inject(function($componentController) {
         var cursorUpdateSpy = jasmine.createSpy("onCursorUpdate");
         var original_cursor = [1, 2, 3];
         var bindings = {cursor: original_cursor, onCursorUpdate: cursorUpdateSpy};
         var ctrl = $componentController("viewer3dMockup", null, bindings);

         expect(ctrl.cursor).toEqual(original_cursor);
         // FIXME: the line below requires $onChanges to be called, how to
         // trigger this?
         //expect(ctrl.cursor).not.toBe(original_cursor);

         ctrl.cursor = [4, 5, 6];
         ctrl.sendCursorUpdate();
         expect(cursorUpdateSpy).toHaveBeenCalledWith({cursor: [4, 5, 6]});
       }));
  });
});
