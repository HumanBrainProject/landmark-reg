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
    vm.swapAP = false;
    vm.swapLR = false;
    vm.swapSI = false;
    vm.nehubaElement = null;

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
          var nehubaElement = document.createElement('div');
          nehubaElement.setAttribute('id', 'neuroglancer-container');
          nehubaElement.setAttribute('class','nehuba-container');
          container.appendChild(nehubaElement);

          vm.viewer = exportNehubaFn.createNehubaViewer(vm.nehubaConfig, console.warn);

          nehubaElement.setAttribute('id', vm.nehubaId + '-nehuba-container');
          
          $timeout(function(){
            setupViewerListeners(vm.viewer);
            setupContainerListeners(nehubaElement);
            vm.nehubaElement = nehubaElement;
          });
        }
      }
    };

    /**
     * 
     * @param {string} axis 
     * @returns {void} 
     */
    function rotateQuat(){
      
      var quat = exportNehubaFn.quat;
      var views = vm.nehubaConfig.layout.views;

      views.slice1 = quat.rotateX(quat.create(), quat.create(), -Math.PI / 2);
      views.slice2 = quat.rotateY(quat.create(), quat.rotateX(quat.create(), quat.create(), -Math.PI / 2), -Math.PI / 2);
      views.slice3 = quat.rotateX(quat.create(), quat.create(), Math.PI);

      if(vm.swapAP){
        quat.mul(views.slice2, quat.rotateZ(quat.create(), quat.create(), Math.PI ), views.slice2);
        quat.mul(views.slice3, quat.rotateX(quat.create(), quat.create(), -Math.PI), views.slice3);
      }

      if(vm.swapLR){
        quat.mul(views.slice1, quat.rotateZ(quat.create(), quat.create(), Math.PI), views.slice1);
        quat.mul(views.slice3, quat.rotateY(quat.create(), quat.create(), Math.PI), views.slice3);
      }

      if(vm.swapSI){
        quat.mul(views.slice1, quat.rotateX(quat.create(), quat.create(), Math.PI), views.slice1);
        quat.mul(views.slice2, quat.rotateY(quat.create(), quat.create(), Math.PI ), views.slice2);
      }
      
      /* required to apply the relayout */
      vm.viewer.relayout();
    }

    vm.swapAxis = function(axis){
      if(vm.viewer){
        if(axis === 'ap'){
          vm.swapAP = !vm.swapAP;
        }
        if(axis === 'lr'){
          vm.swapLR = !vm.swapLR;
        }
        if(axis === 'si'){
          vm.swapSI = !vm.swapSI;
        }

        vm.transformCoordFn = [null, null, null]
        rotateQuat();
        setupContainerListeners();
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

    function handleSliceEvent(event){
      var index = 0;
      while(vm.transformCoordFn[index] !== null && index <= 2){
        index += 1;
      }
      if(index <= 2){
        vm.transformCoordFn[index] = event.detail.nanometersToOffsetPixels;
      }else{
        if(vm.nehubaElement){
          vm.nehubaElement.removeEventListener('sliceRenderEvent', handleSliceEvent);
        }
      }
    }

    function setupContainerListeners(element){
      var target;
      if(element){
        target = element;
      }else if(vm.nehubaElement){
        target = vm.nehubaElement;
      }else{
        throw new Error('neither element nor vm.nehubaElement is defined');
      }
      target.addEventListener('sliceRenderEvent', handleSliceEvent);
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