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

      var top_left_canvas = $element.find("canvas.top_left")[0];
      var top_right_canvas = $element.find("canvas.top_right")[0];
      var bottom_left_canvas = $element.find("canvas.bottom_left")[0];
      // TODO handle resize?
      top_left_canvas.height = top_left_canvas.clientHeight;
      top_left_canvas.width = top_left_canvas.clientWidth;
      top_right_canvas.width = top_right_canvas.clientWidth;
      top_right_canvas.height = top_right_canvas.clientHeight;
      bottom_left_canvas.width = bottom_left_canvas.clientWidth;
      bottom_left_canvas.height = bottom_left_canvas.clientHeight;

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

      var inplane_axes_for_slice_axis = {
        "x": ["y", "z"],
        "y": ["z", "x"],
        "z": ["y", "x"]
      };

      function url_for_tile(level, slice_axis, slice_number,
                            vertical_idx, horizontal_idx)
      {
        return image_url
          + "/" + (level + level_offset)
          + "/" + slice_axis
          + "/" + ("0000" + slice_number).substr(-4, 4)
          + "/" + inplane_axes_for_slice_axis[slice_axis][0] + ("00" + vertical_idx).substr(-2, 2)
          + "_" + inplane_axes_for_slice_axis[slice_axis][1] + ("00" + horizontal_idx).substr(-2, 2)
          + ".png";
      }

      var top_left_zoomer=new Zoomer(top_left_canvas,{
        Width:xdim,Height:ydim,TileSize:tile_size,maxlevel:max_level, // x-y
        Key:function(level,x,y){
          var z=cut.z;
          for(var i=0;i<level;i++)
            z=(z+1)>>1;
          z = Math.round(z);
          return url_for_tile(level, "z", z, y, x);
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
          top_left_zoomer.redraw();
          top_right_zoomer.redraw();
          bottom_left_zoomer.redraw();
        },
        Dispatch:function(){
          top_right_zoomer.setmidzoom(top_right_zoomer.getmidx(),
                                      top_left_zoomer.getmidy(),
                                      top_left_zoomer.getzoom());
          bottom_left_zoomer.setmidzoom(top_left_zoomer.getmidx(),
                                        bottom_left_zoomer.getmidy(),
                                        top_left_zoomer.getzoom());
        },
        Scroll:function(slices){
          cut.z += slices;
          if(cut.z < 0)
            cut.z = 0;
          else if(cut.z >= xdim)
            cut.z = xdim;
          cursorUpdatedByZoomer(cut);
          top_left_zoomer.redraw();
          top_right_zoomer.redraw();
          bottom_left_zoomer.redraw();
        }
      });
      top_left_zoomer.fullcanvas();

      var top_right_zoomer=new Zoomer(top_right_canvas,{
        Width:zdim,Height:ydim,TileSize:tile_size,maxlevel:max_level, // z-y
        Key:function(level,z,y){
          var x=cut.x;
          for(var i=0;i<level;i++)
            x=(x+1)>>1;
          x = Math.round(x);
          return url_for_tile(level, "x", x, y, z);
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
          top_left_zoomer.redraw();
          top_right_zoomer.redraw();
          bottom_left_zoomer.redraw();
        },
        Dispatch:function(){
          top_left_zoomer.setmidzoom(top_left_zoomer.getmidx(),
                                     top_right_zoomer.getmidy(),
                                     top_right_zoomer.getzoom());
          bottom_left_zoomer.setmidzoom(bottom_left_zoomer.getmidx(),
                                        top_right_zoomer.getmidx(),
                                        top_right_zoomer.getzoom());
        },
        Scroll:function(slices){
          cut.x += slices;
          if(cut.x < 0)
            cut.x = 0;
          else if(cut.x >= xdim)
            cut.x = xdim;
          cursorUpdatedByZoomer(cut);
          top_left_zoomer.redraw();
          top_right_zoomer.redraw();
          bottom_left_zoomer.redraw();
        }
      });
      top_right_zoomer.fullcanvas();

      var bottom_left_zoomer=new Zoomer(bottom_left_canvas,{
        Width:xdim,Height:zdim,TileSize:tile_size,maxlevel:max_level, // x-z
        Key:function(level,x,z){
          var y=cut.y;
          for(var i=0;i<level;i++)
            y=(y+1)>>1;
          y = Math.round(y);
          return url_for_tile(level, "y", y, z, x);
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
          top_left_zoomer.redraw();
          top_right_zoomer.redraw();
          bottom_left_zoomer.redraw();
        },
        Dispatch:function(){
          top_left_zoomer.setmidzoom(bottom_left_zoomer.getmidx(),
                                     top_left_zoomer.getmidy(),
                                     bottom_left_zoomer.getzoom());
          top_right_zoomer.setmidzoom(bottom_left_zoomer.getmidy(),
                                      top_right_zoomer.getmidy(),
                                      bottom_left_zoomer.getzoom());
        },
        Scroll:function(slices){
          cut.y += slices;
          if(cut.y < 0)
            cut.y = 0;
          else if(cut.y >= xdim)
            cut.y = xdim;
          cursorUpdatedByZoomer(cut);
          top_left_zoomer.redraw();
          top_right_zoomer.redraw();
          bottom_left_zoomer.redraw();
        }
      });
      bottom_left_zoomer.fullcanvas();

      // Synchronize the zoom level for all views, because fullcanvas sets it
      // individually.
      var zoom = Math.max(top_left_zoomer.getzoom(), top_right_zoomer.getzoom(), bottom_left_zoomer.getzoom());
      top_left_zoomer.setmidzoom(cut.x,cut.y,zoom);
      top_right_zoomer.setmidzoom(cut.z,cut.y,zoom);
      bottom_left_zoomer.setmidzoom(cut.x,cut.z,zoom);

      vm.top_left_zoomer = top_left_zoomer;
      vm.top_right_zoomer = top_right_zoomer;
      vm.bottom_left_zoomer = bottom_left_zoomer;
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
          // TODO handle out-of-bounds
          cut.x = new_cut[0];
          cut.y = new_cut[1];
          cut.z = new_cut[2];
          if(vm.bottom_left_zoomer && vm.top_right_zoomer && vm.top_left_zoomer) {
            vm.top_left_zoomer.redraw();
            vm.top_right_zoomer.redraw();
            vm.bottom_left_zoomer.redraw();
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
