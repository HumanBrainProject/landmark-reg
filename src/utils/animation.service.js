(function(){
  'use strict';

  angular
    .module('landmarkRegApp.utils')
    .factory('Animation', Animation);

  function Animation(){
    function* getNewGenerator(sec){
      var startTime = Date.now();

      var getValue = function(fraction){
        if(fraction < 1){
          return fraction;
        }else{
          return 1;
        }
      };
      while((Date.now() - startTime) < sec){
        yield getValue( (Date.now() - startTime) / sec );
      }
      return 1;
    }
    return getNewGenerator;
  }
})();