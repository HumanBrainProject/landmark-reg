(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .component("zoomer", {
      templateUrl: "viewer/zoomer.template.html",
      controller: ZoomerController,
      bindings: {
        cursor: "="
      }
    });

  function ZoomerController($element, $scope, $log) {
    var vm = this;

    vm.cursor = [0, 0, 0];

    vm.$onInit = $onInit;
    vm.$postLink = $postLink;
    vm.$onDestroy = $onDestroy;

    ////////////

    function $onInit() {
      $log.debug("$onInit called");
    }

    function $postLink() {
      $log.debug("$postLink called");
      var tlcv = $element.find("canvas.coronal")[0];
      var trcv = $element.find("canvas.sagittal")[0];
      var blcv = $element.find("canvas.axial")[0];

      // TODO handle resize?
      tlcv.height = tlcv.offsetHeight;
      tlcv.width = tlcv.offsetWidth;
      trcv.width = trcv.offsetWidth;
      trcv.height = trcv.offsetHeight;
      blcv.width = blcv.offsetWidth;
      blcv.height = blcv.offsetHeight;

      // Globals from Gergely's index.html. TODO: get rid of them!
      var xdim=(((6572+1)>>1)+1)>>1;
      var zdim=(((7404+1)>>1)+1)>>1;
      var ydim=(((5711+1)>>1)+1)>>1;

      var cut={
        x:xdim/2,
        y:ydim/2,
        z:zdim/2
      };

      function tilecomplete(tile,next){
        var canvas=document.createElement("canvas");
        canvas.width=256;
        canvas.height=256;
        if(tile!==null)canvas.getContext("2d").drawImage(tile,0,0);
        next(canvas);
      }
      function cross(x,y,ctx,cnvw,cnvh,cutx,cuty,cutw,cuth){
        ctx.strokeStyle="#FF8080";
        ctx.beginPath();
        var lx=Math.round((x-cutx)*cnvw/cutw)+0.5;
        ctx.moveTo(lx,0);
        ctx.lineTo(lx,cnvh);
        var ly=Math.round((y-cuty)*cnvh/cuth)+0.5;
        ctx.moveTo(0,ly);
        ctx.lineTo(cnvw,ly);
        ctx.closePath();
        ctx.stroke();
      }

      var tlz=new Zoomer(tlcv,{
        Width:xdim,Height:ydim,TileSize:256,MaxLevel:5-2, // coronal x-y
        url:function(level,x,y){
          var z=cut.z;
          for(var i=0;i<level;i++)
            z=(z+1)>>1;
          return "http://www.nesys.uio.no/CDPTest/GetPNG.php?x="+x+"&y="+y+"&z="+z+"&level="+level+"&stack=z";
        },
        load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,next);};
          img.onerror=function(){
            console.log("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,next);
          };
          img.src=url;
        },
        dispatchmidzoom:function(x,y,zoom){
          trz.setmidzoom(trz.getmidx(),y,zoom);
          blz.setmidzoom(x,blz.getmidy(),zoom);
        },
        overlay:function(ctx,cw,ch,x,y,w,h){
          cross(cut.x,cut.y,ctx,cw,ch,x,y,w,h);
        },
        click:function(x,y,cnvw,cnvh,cutx,cuty,cutw,cuth){
          cut.x=cutx+x*cutw/cnvw;
          cut.y=cuty+y*cuth/cnvh;
          cursorUpdatedByZoomer(cut);
          tlz.redraw();
          trz.redraw();
          blz.redraw();
        }
      });
      tlz.fullscreen();
      //                tlz.setmidzoom(xdim/2,ydim/2,8);

      var trz=new Zoomer(trcv,{
        Width:zdim,Height:ydim,TileSize:256,MaxLevel:5-2, // sagittal y-z
        url:function(level,y,z){
          var x=cut.x;
          for(var i=0;i<level;i++)
            x=(x+1)>>1;
          return "http://www.nesys.uio.no/CDPTest/GetPNG.php?x="+x+"&y="+z+"&z="+y+"&level="+level+"&stack=x";
        },
        load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,next);};
          img.onerror=function(){
            console.log("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,next);
          };
          img.src=url;
        },
        dispatchmidzoom:function(x,y,zoom){
          tlz.setmidzoom(tlz.getmidx(),y,zoom);
          blz.setmidzoom(blz.getmidx(),x,zoom);
        },
        overlay:function(ctx,cw,ch,x,y,w,h){
          cross(cut.z,cut.y,ctx,cw,ch,x,y,w,h);
        },
        click:function(x,y,cnvw,cnvh,cutx,cuty,cutw,cuth){
          cut.z=cutx+x*cutw/cnvw;
          cut.y=cuty+y*cuth/cnvh;
          cursorUpdatedByZoomer(cut);
          tlz.redraw();
          trz.redraw();
          blz.redraw();
        }
      });
      trz.fullscreen();
      //                trz.setmidzoom(zdim/2,ydim/2,8);

      var blz=new Zoomer(blcv,{
        Width:xdim,Height:zdim,TileSize:256,MaxLevel:5-2, // horizontal x-z
        url:function(level,x,z){
          var y=cut.y;
          for(var i=0;i<level;i++)
            y=(y+1)>>1;
          return "http://www.nesys.uio.no/CDPTest/GetPNG.php?x="+x+"&y="+y+"&z="+z+"&level="+level+"&stack=y";
        },
        load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,next);};
          img.onerror=function(){
            console.log("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,next);
          };
          img.src=url;
        },
        dispatchmidzoom:function(x,y,zoom){
          tlz.setmidzoom(x,tlz.getmidy(),zoom);
          trz.setmidzoom(y,trz.getmidy(),zoom);
        },
        overlay:function(ctx,cw,ch,x,y,w,h){
          cross(cut.x,cut.z,ctx,cw,ch,x,y,w,h);
        },
        click:function(x,y,cnvw,cnvh,cutx,cuty,cutw,cuth){
          cut.x=cutx+x*cutw/cnvw;
          cut.z=cuty+y*cuth/cnvh;
          cursorUpdatedByZoomer(cut);
          tlz.redraw();
          trz.redraw();
          blz.redraw();
        }
      });
      blz.fullscreen();

      // Synchronize the views when the cursor is updated externally (e.g. Go
      // To Landmark). The $onChanges lifecycle hook cannot be used because
      // cursor uses two-way binding.
      $scope.$watch(
        function(){
          return vm.cursor;
        },
        function(newValue, oldValue){
          cut.x = vm.cursor[0];
          cut.y = vm.cursor[1];
          cut.z = vm.cursor[2];
          tlz.redraw();
          trz.redraw();
          blz.redraw();
        });
    }

    function $onDestroy() {
      $log.warn("$onDestroy is not implemented, memory may be leaked");
    }

    function cursorUpdatedByZoomer(cut) {
      $scope.$apply(function() {
        vm.cursor = [cut.x, cut.y, cut.z];
      });
    }
  }

})(); /* IIFE */
