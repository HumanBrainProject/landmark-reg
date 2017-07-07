(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp")
    .config(configure);

  function configure() {
    /* Initialization code that will run before the Angular app starts */

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
