(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp")
    .config(configure);

  function configure($compileProvider) {
    /* Initialization code that will run before the Angular app starts */

    // Extra strictness in upcoming versions
    if($compileProvider.strictComponentBindingsEnabled) {
      $compileProvider.strictComponentBindingsEnabled(true);
    }
    // Performance optimization (unused features)
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
    // Disable debug info by default
    $compileProvider.debugInfoEnabled(false);


    // Handling window resize in an optimized way, from
    // https://developer.mozilla.org/en-US/docs/Web/Events/resize
    var throttle = function(type, name, obj) {
      obj = obj || window;
      var running = false;
      var func = function() {
        if (running) { return; }
        running = true;
        requestAnimationFrame(function() {
          obj.dispatchEvent(new CustomEvent(name));
          running = false;
        });
      };
      obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");
  }
})(); /* IIFE */
