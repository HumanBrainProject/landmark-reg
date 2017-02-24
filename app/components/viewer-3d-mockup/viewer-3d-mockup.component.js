angular.
  module("viewer3dMockup").
  component("viewer3dMockup", {
    templateUrl: "components/viewer-3d-mockup/viewer-3d-mockup.template.html",
    controller: function Viewer3dMockupController() {
      this.cursor_X = 0;
      this.cursor_Y = 0;
      this.cursor_Z = 0;
    }
  });
