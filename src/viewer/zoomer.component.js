(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .component("zoomer", {
      templateUrl: "viewer/zoomer.template.html",
      controller: ZoomerController,
      bindings: {
        cursor: "<",
        onCursorUpdate: "&"
      }
    });

  function ZoomerController($element, $scope, $log) {
    var vm = this;

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.$postLink = $postLink;
    vm.$onDestroy = $onDestroy;

    // Local variable used by Zoomer to store the current cursor position
    var cut={x: 0, y: 0, z:0};

    ////////////

    function $onInit() {
      $log.debug("$onInit called");
    }

    function $postLink() {
      $log.debug("$postLink called");

      var corcv = $element.find("canvas.coronal")[0];
      var sagcv = $element.find("canvas.sagittal")[0];
      var axlcv = $element.find("canvas.axial")[0];
      // TODO handle resize?
      corcv.height = corcv.clientHeight;
      corcv.width = corcv.clientWidth;
      sagcv.width = sagcv.clientWidth;
      sagcv.height = sagcv.clientHeight;
      axlcv.width = axlcv.clientWidth;
      axlcv.height = axlcv.clientHeight;

      // for reduced-resolution dataset. TODO: make it configurable
      var xdim=(((6572+1)>>1)+1)>>1;
      var zdim=(((7404+1)>>1)+1)>>1;
      var ydim=(((5711+1)>>1)+1)>>1;

      cut = {
        x:xdim/2,
        y:ydim/2,
        z:zdim/2
      };
      vm.onCursorUpdate({cursor: [cut.x, cut.y, cut.z]});

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

      var corz=new Zoomer(corcv,{
        Width:xdim,Height:ydim,TileSize:256,MaxLevel:5-2, // coronal x-y
        Key:function(level,x,y){
          var z=cut.z;
          for(var i=0;i<level;i++)
            z=(z+1)>>1;
          z = Math.round(z);
          return "http://www.nesys.uio.no/CDPTest/data/"+(level+2)+"/z/"+("0000"+z).substr(-4,4)+"/y"+("00"+y).substr(-2,2)+"_x"+("00"+x).substr(-2,2)+".png";
        },
        Load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,next);};
          img.onerror=function(){
            console.log("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,next);
          };
          img.src=url;
        },
        Overlay:function(ctx,cw,ch,x,y,w,h){
          cross(cut.x,cut.y,ctx,cw,ch,x,y,w,h);
        },
        Click:function(event,cnvw,cnvh,cutx,cuty,cutw,cuth){
          cut.x=cutx+event.offsetX*cutw/cnvw;
          cut.y=cuty+event.offsetY*cuth/cnvh;
          cursorUpdatedByZoomer(cut);
          corz.redraw();
          sagz.redraw();
          axlz.redraw();
        },
        Dispatch:function(){
          sagz.setmidzoom(sagz.getmidx(),corz.getmidy(),corz.getzoom());
          axlz.setmidzoom(corz.getmidx(),axlz.getmidy(),corz.getzoom());
        }
      });
      corz.fullcanvas();

      var sagz=new Zoomer(sagcv,{
        Width:zdim,Height:ydim,TileSize:256,MaxLevel:5-2, // sagittal y-z
        Key:function(level,y,z){
          var x=cut.x;
          for(var i=0;i<level;i++)
            x=(x+1)>>1;
          x = Math.round(x);
          return "http://www.nesys.uio.no/CDPTest/data/"+(level+2)+"/x/"+("0000"+x).substr(-4,4)+"/y"+("00"+z).substr(-2,2)+"_z"+("00"+y).substr(-2,2)+".png";
        },
        Load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,next);};
          img.onerror=function(){
            console.log("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,next);
          };
          img.src=url;
        },
        Overlay:function(ctx,cw,ch,x,y,w,h){
          cross(cut.z,cut.y,ctx,cw,ch,x,y,w,h);
        },
        Click:function(event,cnvw,cnvh,cutx,cuty,cutw,cuth){
          cut.z=cutx+event.offsetX*cutw/cnvw;
          cut.y=cuty+event.offsetY*cuth/cnvh;
          cursorUpdatedByZoomer(cut);
          corz.redraw();
          sagz.redraw();
          axlz.redraw();
        },
        Dispatch:function(){
          corz.setmidzoom(corz.getmidx(),sagz.getmidy(),sagz.getzoom());
          axlz.setmidzoom(axlz.getmidx(),sagz.getmidx(),sagz.getzoom());
        }
      });
      sagz.fullcanvas();

      var axlz=new Zoomer(axlcv,{
        Width:xdim,Height:zdim,TileSize:256,MaxLevel:5-2, // horizontal x-z
        Key:function(level,x,z){
          var y=cut.y;
          for(var i=0;i<level;i++)
            y=(y+1)>>1;
          y = Math.round(y);
          return "http://www.nesys.uio.no/CDPTest/data/"+(level+2)+"/y/"+("0000"+y).substr(-4,4)+"/z"+("00"+z).substr(-2,2)+"_x"+("00"+x).substr(-2,2)+".png";
        },
        Load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,next);};
          img.onerror=function(){
            console.log("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,next);
          };
          img.src=url;
        },
        Overlay:function(ctx,cw,ch,x,y,w,h){
          cross(cut.x,cut.z,ctx,cw,ch,x,y,w,h);
        },
        Click:function(event,cnvw,cnvh,cutx,cuty,cutw,cuth){
          cut.x=cutx+event.offsetX*cutw/cnvw;
          cut.z=cuty+event.offsetY*cuth/cnvh;
          cursorUpdatedByZoomer(cut);
          corz.redraw();
          sagz.redraw();
          axlz.redraw();
        },
        Dispatch:function(){
          corz.setmidzoom(axlz.getmidx(),corz.getmidy(),axlz.getzoom());
          sagz.setmidzoom(axlz.getmidy(),sagz.getmidy(),axlz.getzoom());
        }
      });
      axlz.fullcanvas();

      // Synchronize the zoom level for all views, because fullcanvas sets it
      // individually.
      var zoom = Math.max(corz.getzoom(), sagz.getzoom(), axlz.getzoom());
      corz.setmidzoom(cut.x,cut.y,zoom);
      sagz.setmidzoom(cut.z,cut.y,zoom);
      axlz.setmidzoom(cut.x,cut.z,zoom);

      vm.corz = corz;
      vm.sagz = sagz;
      vm.axlz = axlz;
    }

    // Synchronize the views when the cursor is updated externally (e.g. Go
    // To Landmark).
    function $onChanges(changes) {
      if(changes.cursor) {
        var current_value = changes.cursor.currentValue;
        if(current_value[0] != cut.x ||
           current_value[1] != cut.y ||
           current_value[2] != cut.z) {
          cut.x = current_value[0];
          cut.y = current_value[1];
          cut.z = current_value[2];
          vm.corz.redraw();
          vm.sagz.redraw();
          vm.axlz.redraw();
        }
      }
    }

    function $onDestroy() {
      $log.warn("$onDestroy is not implemented, memory may be leaked");
    }

    function cursorUpdatedByZoomer(cut) {
      $scope.$apply(function() {
        vm.onCursorUpdate({cursor: [cut.x, cut.y, cut.z]});
      });
    }
  }

})(); /* IIFE */
