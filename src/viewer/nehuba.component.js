(function(){ /* IIFE */
  "use strict";

  angular
    .module('landmarkRegApp.viewer')
      .component('nehuba', {
        templateUrl : 'viewer/nehuba.template.html',
        controller : NehubaController,
        bindings: {
          nehubaId : '<?',
          nehubaConfig: '<?',
          secondaryNgLayer : '<?',
          onViewerPoseUpdate : '&?',
          onNehubaInitEnd : '&?',
          gotoCoord : '<?',
          landmarks: '<'
        }
      });

  function NehubaController(Animation, $timeout){
    var vm = this;
    vm.viewer = null;
    vm.transformCoordFn = [null, null, null];
    vm.position = [0, 0, 0]; // in nm
    vm.orientation = [0, 0, 0, 1];
    vm.secondary_layer = null;

    vm.$onChanges = function(){
      if(vm.secondaryNgLayer && !vm.secondary_layer){
        $timeout(function(){
          vm.viewer.ngviewer.layerManager.addManagedLayer(
            vm.viewer.ngviewer.layerSpecification.getLayer('incoming', vm.secondaryNgLayer)
          );
        });
        vm.secondary_layer = true;
      }

      if(vm.gotoCoord){
        vm.gotoPosition(vm.gotoCoord.slice());
        vm.gotoCoord = null;
      }
    };

    vm.$doCheck = function(){
      if(vm.viewer === null && vm.nehubaConfig !== null){
        var container = document.getElementById(vm.nehubaId);
        if(container){
          var nehubaContainer = document.createElement('div');
          nehubaContainer.setAttribute('id', 'neuroglancer-container');
          nehubaContainer.setAttribute('class','nehuba-container');
          container.appendChild(nehubaContainer);

          vm.viewer = exportNehubaFn.createNehubaViewer(vm.nehubaConfig, console.warn);

          nehubaContainer.setAttribute('id', vm.nehubaId + '-nehuba-container');
          
          $timeout(function(){
            setupViewerListeners(vm.viewer);
            setupContainerListeners(nehubaContainer);
          });
        }
      }
    };

    vm.gotoPosition = function(pos){
      var prevPosition = vm.position.map(function(value){
        return value/1e6;
      });
      var finalPosition = pos.slice();

      var anim = Animation(500);
      var getFraction = function(){
        var value = anim.next();
        if(!value.done){
          var newPosition = [
            getValueFromFraction(prevPosition[0], finalPosition[0], value.value),
            getValueFromFraction(prevPosition[1], finalPosition[1], value.value),
            getValueFromFraction(prevPosition[2], finalPosition[2], value.value),
          ];
          setPosition(newPosition);
          requestAnimationFrame(getFraction);
        }else{
          setPosition(finalPosition);
        }
      };
      requestAnimationFrame(getFraction);
    };

    function setPosition(pos){
      vm.viewer.setPosition(pos.map(function(value){
        return value*1e6;
      }),true);
    }

    vm.gotoRotation = function(index){
      var i = [0,0,0,0];
      
      i[index] = 1;

      var prevOrientation = vm.orientation.slice();
      var anim = Animation(500);
      var getFraction = function(){
        var value = anim.next();
        if(!value.done){
          var newOrientation = [
            getValueFromFraction(prevOrientation[0], i[0], value.value),
            getValueFromFraction(prevOrientation[1], i[1], value.value),
            getValueFromFraction(prevOrientation[2], i[2], value.value),
            getValueFromFraction(prevOrientation[3], 0, value.value)
          ];
          setOrientation(newOrientation);
          requestAnimationFrame(getFraction);
        }else{
          setOrientation(i);
        }
      };
      requestAnimationFrame(getFraction);
    };

    vm.resetRotation = function(){

      // $timeout(function(){
      //   setOrientation([0,0,0,1])
      // })
      // return
      var prevOrientation = vm.orientation.slice();
      var anim = Animation(500);
      var getFraction = function(){
        var value = anim.next();
        if(!value.done){
          var newOrientation = [
            getValueFromFraction(prevOrientation[0], 0, value.value),
            getValueFromFraction(prevOrientation[1], 0, value.value),
            getValueFromFraction(prevOrientation[2], 0, value.value),
            getValueFromFraction(prevOrientation[3], 1, value.value)
          ];
          setOrientation(newOrientation);
          requestAnimationFrame(getFraction);
        }else{
          setOrientation([0,0,0,1]);
        }
      };
      requestAnimationFrame(getFraction);
    };

    function getValueFromFraction(start, final, fraction){
      return (final - start) * fraction + start;
    }

    function setOrientation(quat){
      if(vm.viewer){
        vm.viewer.ngviewer.navigationState.pose.orientation.restoreState(quat);
      }
    }

    function setupContainerListeners(element){
      element.addEventListener('sliceRenderEvent', handleSliceEvent);

      function handleSliceEvent(event){
        var index = 0;
        while(vm.transformCoordFn[index] !== null && index <= 2){
          index += 1;
        }
        if(index <= 2){
          vm.transformCoordFn[index] = event.detail.nanometersToOffsetPixels;
        }else{
          element.removeEventListener('sliceRenderEvent', handleSliceEvent);
        }
      }
    }

    function setupViewerListeners(viewer){
      viewer.navigationState.all
        .delay(1)
        .subscribe(function(state){
          
          vm.position = Array.from(state.position);
          vm.orientation = Array.from(state.orientation);

          if(vm.onViewerPoseUpdate){
            vm.onViewerPoseUpdate({state: state});
          }
      });
    }
  }
})();