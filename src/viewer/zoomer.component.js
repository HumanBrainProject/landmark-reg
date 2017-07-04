(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .component("zoomer", {
      templateUrl: "viewer/zoomer.template.html",
      controller: ZoomerController,
      bindings: {
        cursor: "<",
        imageUrl: "@",
        onCursorUpdate: "&"
      }
    });

  function ZoomerController(ZoomerMetadata, $element, $scope, $log) {
    var vm = this;

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.$postLink = $postLink;
    vm.$onDestroy = $onDestroy;

    // Local variable used by Zoomer to store the current cursor position
    var cut={x: 0, y: 0, z:0};

    ////////////

    function $onInit() {
      vm.image_info = ZoomerMetadata.get_metadata(vm.imageUrl);
      vm.image_info.url = vm.imageUrl;
    }

    function $postLink() {
      if(!vm.image_info) {
        $log.error("no available image metadata for " + vm.imageUrl);
        return;
      }

      var image_url = vm.image_info.url;
      var xdim = vm.image_info.size[0];
      var ydim = vm.image_info.size[1];
      var zdim = vm.image_info.size[2];
      var level_offset;
      if(vm.image_info.level_offset)
        level_offset = vm.image_info.level_offset;
      else
        level_offset = 0;
      var max_level = vm.image_info.max_level;
      var tile_size= vm.image_info.tile_size;

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

      cut = {
        x:xdim/2,
        y:ydim/2,
        z:zdim/2
      };
      vm.onCursorUpdate({
        cursor: [
          cut.x * vm.image_info.voxel_size[0],
          cut.y * vm.image_info.voxel_size[1],
          cut.z * vm.image_info.voxel_size[2]
        ]
      });

      function tilecomplete(tile,next){
        var canvas=document.createElement("canvas");
        canvas.width=tile_size;
        canvas.height=tile_size;
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
        Width:xdim,Height:ydim,TileSize:tile_size,MaxLevel:max_level, // coronal x-y
        Key:function(level,x,y){
          var z=cut.z;
          for(var i=0;i<level;i++)
            z=(z+1)>>1;
          z = Math.round(z);
          return image_url+"/"+(level+level_offset)+"/z/"+("0000"+z).substr(-4,4)+"/y"+("00"+y).substr(-2,2)+"_x"+("00"+x).substr(-2,2)+".png";
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
        Width:zdim,Height:ydim,TileSize:tile_size,MaxLevel:max_level, // sagittal y-z
        Key:function(level,y,z){
          var x=cut.x;
          for(var i=0;i<level;i++)
            x=(x+1)>>1;
          x = Math.round(x);
          return image_url+"/"+(level+level_offset)+"/x/"+("0000"+x).substr(-4,4)+"/y"+("00"+z).substr(-2,2)+"_z"+("00"+y).substr(-2,2)+".png";
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
        Width:xdim,Height:zdim,TileSize:tile_size,MaxLevel:max_level, // horizontal x-z
        Key:function(level,x,z){
          var y=cut.y;
          for(var i=0;i<level;i++)
            y=(y+1)>>1;
          y = Math.round(y);
          return image_url+"/"+(level+level_offset)+"/y/"+("0000"+y).substr(-4,4)+"/z"+("00"+z).substr(-2,2)+"_x"+("00"+x).substr(-2,2)+".png";
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
      if(!vm.image_info)
        return;

      if(changes.cursor) {
        var current_value = changes.cursor.currentValue;
        var new_cut = [
          Math.round(current_value[0] / vm.image_info.voxel_size[0]),
          Math.round(current_value[1] / vm.image_info.voxel_size[1]),
          Math.round(current_value[2] / vm.image_info.voxel_size[2])];
        if(cut.x != new_cut[0] ||
           cut.y != new_cut[1] ||
           cut.z != new_cut[2]) {
          cut.x = new_cut[0];
          cut.y = new_cut[1];
          cut.z = new_cut[2];
          if(vm.axlz && vm.sagz && vm.corz) {
            vm.corz.redraw();
            vm.sagz.redraw();
            vm.axlz.redraw();
          }
        }
      }
      if(changes.imageUrl) {
        $log.error("dynamically changing the image shown by Zoomer is not supported");
      }
    }

    function $onDestroy() {
      $log.warn("$onDestroy is not implemented, memory may be leaked");
    }

    function cursorUpdatedByZoomer(cut) {
      $scope.$apply(function() {
        vm.onCursorUpdate({
          cursor: [
            cut.x * vm.image_info.voxel_size[0],
            cut.y * vm.image_info.voxel_size[1],
            cut.z * vm.image_info.voxel_size[2]
          ]
        });
      });
    }
  }

})(); /* IIFE */
