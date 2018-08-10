(function(){
  'use strict';

  angular.module('landmarkRegApp.viewer')
    .component('landmark',{
      templateUrl : 'viewer/landmark-marker/landmark-marker.template.html',
      controller : LandmarkController,
      bindings : {
        coord : '<',
        colour : '<',
        nmToPixelFn : '<'
      }
    });

  function LandmarkController($scope){
    var vm = this;
    vm.height = 0;
    vm.x = 0;
    vm.y = 0;
    vm.z = 0;

    // vm.$onChanges = function(){
    //   var pos = Array.from(
    //     vm.nmToPixelFn(vm.coord
    //       .map(function(string){ 
    //         return Number(string)*1e6;
    //       }))
    //     );
    //   vm.x = pos[0];
    //   vm.y = pos[1];
    //   vm.z = pos[2];
    // }

    // vm.getStyle = function(){
    //   return {
    //     color : vm.color,
    //     transform : 'translate(' + vm.x + 'px, ' + vm.y + 'px)'
    //   }
    // }

    vm.getStyle = function(){
      var colour;
      if(vm.colour){
        colour = vm.colour;
      }else{
        colour = 'white';
      }

      if(vm.nmToPixelFn && vm.coord){
        var pos = Array.from(
          vm.nmToPixelFn(vm.coord
            .map(function(string){ 
              return Number(string)*1e6;
            }))
          );
        vm.z = pos[2];
        return {
          color : colour,
          transform : 'translate(' + pos.filter(function(_, index){
              return index <= 1;
            }).map(function (value){
              return value + 'px';
            }).join(',') + ')'
        };
      }else{
        return {
          color : colour,
          transform : 'translate(0, 0)'
        };
      }
    };

    vm.getMapMarkerStyle = function(){
      return {
        transform : 'translateY(' + (-1 * vm.z).toString()  + 'px)'
      };
    };

    vm.getBeamStyle = function(){
      var translateY, z, color;

      if(vm.z > 0){
        translateY = '-' + vm.z.toString() + 'px';
        z = vm.z.toString() + 'px';
      }else{
        translateY = '0px';
        z = (vm.z * -1).toString() + 'px';
      }

      if(vm.colour){
        color = vm.colour;
      }else{
        color = 'white';
      }

      return {
        transform : 'translateY(' + translateY + ')',
        height : z,
        width : '3px',
        backgroundColor : color
      };
    };
  }
})();