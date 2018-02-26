(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.utils")
    .directive("lregOnFileChange", LregOnFileChangeDirective);

  function LregOnFileChangeDirective() {
    var directive = {
      link: link,
      restrict: "A",
      scope: {
        onChange: "&lregOnFileChange"
      }
    };
    return directive;

    ////////////
    function link(scope, element, attrs) {
      element.on("change", function(event) {
        scope.onChange({"$event": event});
      });
    }
  }
})(); /* IIFE */
