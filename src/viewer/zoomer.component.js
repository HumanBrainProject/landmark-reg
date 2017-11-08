(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.viewer")
    .component("zoomer", {
      templateUrl: "viewer/zoomer.template.html",
      controller: ZoomerController,
      bindings: {
        imageUrl: "@",
        cursor: "<?",
        onCursorUpdate: "&?",
        displayPixelSize: "<?",
        onDisplayPixelSizeUpdate: "&?",
        landmarks: "<?"
      }
    });

  function ZoomerController(ZoomerMetadata, $element, $log, $scope,
                            $timeout, $window) {
    var vm = this;

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.$postLink = $postLink;
    vm.$onDestroy = $onDestroy;

    vm.axis_label = axis_label;
    vm.toggle_axis_inversion = toggle_axis_inversion;
    vm.exchange_axes = exchange_axes;

    ////////////

    function $onInit() {
      $($window).on("optimizedResize", resize);
    }

    function initialize_zoomer(image_info) {
      vm.image_info = image_info;

      // Data axes (x, y, z) are written in lowercase. Display axes (X, Y, Z)
      // are fixed relative to the layout, they are written in uppercase.

      if(vm.image_info.axis_orientations) {
        var ornt = vm.image_info.axis_orientations;
        vm.data_to_display_axis = {
          "x": AXIS_PERMUTATION[ornt[0]],
          "y": AXIS_PERMUTATION[ornt[1]],
          "z": AXIS_PERMUTATION[ornt[2]]
        };
        vm.data_axis_inversions = {
          "x": AXIS_INVERSION[ornt[0]],
          "y": AXIS_INVERSION[ornt[1]],
          "z": AXIS_INVERSION[ornt[2]]
        };
      } else {
        // Assume native Zoomer orientation
        vm.data_to_display_axis = {"x": "X", "y": "Y", "z": "Z"};
        vm.data_axis_inversions = {"x": false, "y": false, "z": false};
      }

      updateDisplayAxisSwap();

      vm.cut = {
        X: vm.image_info.size[vm.display_to_data_axis_idx.X] / 2,
        Y: vm.image_info.size[vm.display_to_data_axis_idx.Y] / 2,
        Z: vm.image_info.size[vm.display_to_data_axis_idx.Z] / 2
      };
      send_cursor_update();
      vm.mid = Object.assign({}, vm.cut);

      reconfigure_zoomer_instances();

      vm.top_left_zoomer.fullcanvas();
      vm.top_right_zoomer.fullcanvas();
      vm.bottom_left_zoomer.fullcanvas();

      // Synchronize the zoom level for all views, because fullcanvas sets it
      // individually.
      var zoom = Math.max(vm.top_left_zoomer.getzoom(),
                          vm.top_right_zoomer.getzoom(),
                          vm.bottom_left_zoomer.getzoom());
      // FIXME: this displayPixelSize is approximate because Zoomer does not
      // yet support anisotropic pixels
      vm.displayPixelSize = zoom * (vm.image_info.voxel_size[0]
                                    + vm.image_info.voxel_size[1]
                                    + vm.image_info.voxel_size[2]) / 3;
      display_pixel_size_updated();
      set_view();
      redraw();
    }

    function display_pixel_size_updated() {
      if(vm.onDisplayPixelSizeUpdate) {
        vm.onDisplayPixelSizeUpdate({pixel_size: vm.displayPixelSize});
      }
    }

    function set_view() {
      // FIXME: this displayPixelSize is approximate because Zoomer does not
      // yet support anisotropic pixels
      var zoom = get_current_zoom();
      vm.top_left_zoomer.setmidzoom(vm.mid.X,vm.mid.Y,zoom);
      vm.top_right_zoomer.setmidzoom(vm.mid.Z,vm.mid.Y,zoom);
      vm.bottom_left_zoomer.setmidzoom(vm.mid.X,vm.mid.Z,zoom);
      redraw();
    }

    function $postLink() {
      var top_left_canvas = $element.find("canvas.top_left")[0];
      var top_right_canvas = $element.find("canvas.top_right")[0];
      var bottom_left_canvas = $element.find("canvas.bottom_left")[0];
      top_left_canvas.width = top_left_canvas.clientWidth;
      top_left_canvas.height = top_left_canvas.clientHeight;
      top_right_canvas.width = top_right_canvas.clientWidth;
      top_right_canvas.height = top_right_canvas.clientHeight;
      bottom_left_canvas.width = bottom_left_canvas.clientWidth;
      bottom_left_canvas.height = bottom_left_canvas.clientHeight;

      function tilecomplete(tile,swap_axes,next){
        var canvas=document.createElement("canvas");
        canvas.width=vm.image_info.tile_size;
        canvas.height=vm.image_info.tile_size;
        if(tile !== null) {
          var ctx = canvas.getContext("2d");
          if(swap_axes)
            ctx.setTransform(0, 1, 1, 0, 0, 0);
          else
            ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(tile,0,0);
        }
        next(canvas);
      }
      function cross(x,y,ctx,cnvw,cnvh,cutx,cuty,cutw,cuth){
        ctx.beginPath();
        var lx=Math.round((x-cutx)*cnvw/cutw)+0.5;
        ctx.moveTo(lx,0);
        ctx.lineTo(lx,cnvh);
        var ly=Math.round((y-cuty)*cnvh/cuth)+0.5;
        ctx.moveTo(0,ly);
        ctx.lineTo(cnvw,ly);
        ctx.closePath();
        ctx.strokeStyle="#FF8080";
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
        ctx.stroke();
      }

      function draw_landmark(x,y,ctx,cnvw,cnvh,cutx,cuty,cutw,cuth,colour){
        var lx=(x-cutx)*cnvw/cutw+0.5;
        var ly=(y-cuty)*cnvh/cuth+0.5;
        ctx.beginPath();
        var landmark_size = 7;
        var landmark_hole_size = 2;
        ctx.moveTo(lx - landmark_size, ly - landmark_size);
        ctx.lineTo(lx - landmark_hole_size, ly - landmark_hole_size);
        ctx.moveTo(lx + landmark_size, ly - landmark_size);
        ctx.lineTo(lx + landmark_hole_size, ly - landmark_hole_size);
        ctx.moveTo(lx - landmark_size, ly + landmark_size);
        ctx.lineTo(lx - landmark_hole_size, ly + landmark_hole_size);
        ctx.moveTo(lx + landmark_size, ly + landmark_size);
        ctx.lineTo(lx + landmark_hole_size, ly + landmark_hole_size);
        ctx.closePath();
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.strokeStyle = colour;
        ctx.stroke();
        // Now, draw smaller cross in black to make the landmark more contrasted
        ctx.beginPath();
        ctx.moveTo(lx - landmark_size, ly - landmark_size);
        ctx.lineTo(lx - landmark_hole_size, ly - landmark_hole_size);
        ctx.moveTo(lx + landmark_size, ly - landmark_size);
        ctx.lineTo(lx + landmark_hole_size, ly - landmark_hole_size);
        ctx.moveTo(lx - landmark_size, ly + landmark_size);
        ctx.lineTo(lx - landmark_hole_size, ly + landmark_hole_size);
        ctx.moveTo(lx + landmark_size, ly + landmark_size);
        ctx.lineTo(lx + landmark_hole_size, ly + landmark_hole_size);
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";
        ctx.stroke();
      }

      function url_for_tile(level, slice_axis, slice_number,
                            axis1, idx1, axis2, idx2)
      {
        var vertical_idx, horizontal_idx;
        if(AXIS_SWAP_NEEDED[axis1 + axis2]) {
          horizontal_idx = idx1;
          vertical_idx = idx2;
        } else {
          vertical_idx = idx1;
          horizontal_idx = idx2;
        }
        return vm.imageUrl
          + "/" + (level + (vm.image_info.level_offset || 0))
          + "/" + slice_axis
          + "/" + ("0000" + slice_number).substr(-4, 4)
          + "/" + INPLANE_AXES_FOR_SLICE_AXIS[slice_axis][0] + ("00" + vertical_idx).substr(-2, 2)
          + "_" + INPLANE_AXES_FOR_SLICE_AXIS[slice_axis][1] + ("00" + horizontal_idx).substr(-2, 2)
          + ".png";
      }

      var top_left_zoomer = new Zoomer(top_left_canvas, {  // X-Y
        ExternalRedraw: true,
        Key:function(level,X,Y){
          var Z=vm.cut.Z;
          for(var i=0;i<level;i++)
            Z=(Z+1)>>1;
          Z = Math.round(Z);
          return url_for_tile(level, vm.display_to_data_axis.Z, Z,
                              vm.display_to_data_axis.Y, Y,
                              vm.display_to_data_axis.X, X);
        },
        Load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,AXIS_SWAP_NEEDED[vm.display_to_data_axis.Y + vm.display_to_data_axis.X],next);};
          img.onerror=function(){
            $log.warn("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,null,next);
          };
          img.src=url;
        },
        Overlay:function(ctx,cw,ch,x,y,w,h){
          cross(vm.cut.X,vm.cut.Y,ctx,cw,ch,x,y,w,h);
          if(vm.landmarks) {
            vm.landmarks.forEach(function(landmark) {
              var pos = data_to_display_coords(landmark.coords);
              var colour = landmark.colour || "#33CC33";
              draw_landmark(pos.X,pos.Y,ctx,cw,ch,x,y,w,h,colour);
            });
          }
        },
        Click:function(event,clickx, clicky){
          vm.cut.X=clickx;
          vm.cut.Y=clicky;
          cutUpdatedByZoomer();
          redraw();
        },
        Dispatch:function(){
          var old_zoom = get_current_zoom();
          var zoom = top_left_zoomer.getzoom();
          vm.mid.X = top_left_zoomer.getmidx();
          vm.mid.Y = top_left_zoomer.getmidy();
          vm.mid.Z = vm.cut.Z + (zoom / old_zoom) * (vm.mid.Z - vm.cut.Z);
          top_right_zoomer.setmidzoom(vm.mid.Z, vm.mid.Y, zoom);
          bottom_left_zoomer.setmidzoom(vm.mid.X, vm.mid.Z, zoom);
          zoom_updated_by_zoomer(zoom);
          redraw();
        },
        Scroll:function(slices){
          var Zdim = vm.image_info.size[vm.display_to_data_axis_idx.Z];
          vm.cut.Z += slices;
          if(vm.cut.Z < 0)
            vm.cut.Z = 0;
          else if(vm.cut.Z >= Zdim)
            vm.cut.Z = Zdim;
          cutUpdatedByZoomer();
          redraw();
        }
      });

      var top_right_zoomer = new Zoomer(top_right_canvas, {  // Z-Y
        ExternalRedraw: true,
        Key:function(level,Z,Y){
          var X=vm.cut.X;
          for(var i=0;i<level;i++)
            X=(X+1)>>1;
          X = Math.round(X);
          return url_for_tile(level, vm.display_to_data_axis.X, X,
                              vm.display_to_data_axis.Y, Y,
                              vm.display_to_data_axis.Z, Z);
        },
        Load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,AXIS_SWAP_NEEDED[vm.display_to_data_axis.Y + vm.display_to_data_axis.Z],next);};
          img.onerror=function(){
            $log.warn("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,null,next);
          };
          img.src=url;
        },
        Overlay:function(ctx,cw,ch,x,y,w,h){
          cross(vm.cut.Z,vm.cut.Y,ctx,cw,ch,x,y,w,h);
          if(vm.landmarks) {
            vm.landmarks.forEach(function(landmark) {
              var pos = data_to_display_coords(landmark.coords);
              var colour = landmark.colour || "#33CC33";
              draw_landmark(pos.Z,pos.Y,ctx,cw,ch,x,y,w,h,colour);
            });
          }
        },
        Click:function(event,clickx, clicky){
          vm.cut.Z=clickx;
          vm.cut.Y=clicky;
          cutUpdatedByZoomer();
          redraw();
        },
        Dispatch:function(){
          var old_zoom = get_current_zoom();
          var zoom = top_right_zoomer.getzoom();
          vm.mid.Z = top_right_zoomer.getmidx();
          vm.mid.Y = top_right_zoomer.getmidy();
          vm.mid.X = vm.cut.X + (zoom / old_zoom) * (vm.mid.X - vm.cut.X);
          top_left_zoomer.setmidzoom(vm.mid.X, vm.mid.Y, zoom);
          bottom_left_zoomer.setmidzoom(vm.mid.X, vm.mid.Z, zoom);
          zoom_updated_by_zoomer(zoom);
          redraw();
        },
        Scroll:function(slices){
          var Xdim = vm.image_info.size[vm.display_to_data_axis_idx.X];
          vm.cut.X += slices;
          if(vm.cut.X < 0)
            vm.cut.X = 0;
          else if(vm.cut.X >= Xdim)
            vm.cut.X = Xdim;
          cutUpdatedByZoomer();
          redraw();
        }
      });

      var bottom_left_zoomer = new Zoomer(bottom_left_canvas, {  // X-Z
        ExternalRedraw: true,
        Key:function(level,X,Z){
          var Y=vm.cut.Y;
          for(var i=0;i<level;i++)
            Y=(Y+1)>>1;
          Y = Math.round(Y);
          return url_for_tile(level, vm.display_to_data_axis.Y, Y,
                              vm.display_to_data_axis.Z, Z,
                              vm.display_to_data_axis.X, X);
        },
        Load:function(url,x,y,next){
          var img=document.createElement("img");
          img.onload=function(){tilecomplete(img,AXIS_SWAP_NEEDED[vm.display_to_data_axis.Z + vm.display_to_data_axis.X],next);};
          img.onerror=function(){
            $log.warn("Invalid tile: "+x+","+y+ " "+url);
            tilecomplete(null,null,next);
          };
          img.src=url;
        },
        Overlay:function(ctx,cw,ch,x,y,w,h){
          cross(vm.cut.X,vm.cut.Z,ctx,cw,ch,x,y,w,h);
          if(vm.landmarks) {
            vm.landmarks.forEach(function(landmark) {
              var pos = data_to_display_coords(landmark.coords);
              var colour = landmark.colour || "#33CC33";
              draw_landmark(pos.X,pos.Z,ctx,cw,ch,x,y,w,h,colour);
            });
          }
        },
        Click:function(event, clickx, clicky){
          vm.cut.X=clickx;
          vm.cut.Z=clicky;
          cutUpdatedByZoomer();
          redraw();
        },
        Dispatch:function(){
          var old_zoom = get_current_zoom();
          var zoom = bottom_left_zoomer.getzoom();
          vm.mid.X = bottom_left_zoomer.getmidx();
          vm.mid.Z = bottom_left_zoomer.getmidy();
          vm.mid.Y = vm.cut.Y + (zoom / old_zoom) * (vm.mid.Y - vm.cut.Y);
          top_left_zoomer.setmidzoom(vm.mid.X, vm.mid.Y, zoom);
          top_right_zoomer.setmidzoom(vm.mid.Z, vm.mid.Y, zoom);
          zoom_updated_by_zoomer(zoom);
          redraw();
        },
        Scroll:function(slices){
          var Ydim = vm.image_info.size[vm.display_to_data_axis_idx.Y];
          vm.cut.Y += slices;
          if(vm.cut.Y < 0)
            vm.cut.Y = 0;
          else if(vm.cut.Y >= Ydim)
            vm.cut.Y = Ydim;
          cutUpdatedByZoomer();
          redraw();
        }
      });

      vm.top_left_zoomer = top_left_zoomer;
      vm.top_right_zoomer = top_right_zoomer;
      vm.bottom_left_zoomer = bottom_left_zoomer;
    }

    function $onChanges(changes) {
      if(changes.imageUrl) {
        vm.image_info = null;
        ZoomerMetadata.fetch_metadata(vm.imageUrl)
          .then(initialize_zoomer,
                function(reason) {
                  $log.error("cannot fetch metadata for image " + vm.imageUrl
                             + ": " + reason.statusText)
                });
       }

      if(!vm.image_info)
        return;

      // Synchronize the views when the cursor is updated externally (e.g. Go
      // To Landmark).
      if(changes.cursor) {
        // TODO handle out-of-bounds
        //
        // We cannot replace vm.cut with the new object (vm.cut = ...), because
        // the Zoomer instances would still use the old object. Update the
        // properties in-place instead.
        Object.assign(vm.cut, data_to_display_coords(changes.cursor.currentValue));
        if(zoomer_is_instantiated()) {
          redraw();
        }
      }

      if(changes.landmarks) {
        redraw();
      }

      if(changes.displayPixelSize) {
        if(vm.image_info && zoomer_is_instantiated()) {
          set_view();
        }
      }
    }

    function $onDestroy() {
      if(redraw_throttler) $timeout.cancel(redraw_throttler);
      $($window).off("optimizedResize", resize);
      if(vm.bottom_left_zoomer)
        vm.bottom_left_zoomer.destroy();
      if(vm.top_right_zoomer)
        vm.top_right_zoomer.destroy();
      if(vm.top_left_zoomer)
        vm.top_left_zoomer.destroy();
    }

    function cutUpdatedByZoomer() {
      $scope.$apply(function() {
        send_cursor_update();
      });
    }

    function send_cursor_update() {
      if(vm.onCursorUpdate) {
        vm.onCursorUpdate({cursor: display_to_data_coords(vm.cut)});
      }
    }

    function display_to_data_coords(cut) {
      return [
        cut[vm.data_to_display_axis.x] * vm.image_info.voxel_size[0],
        cut[vm.data_to_display_axis.y] * vm.image_info.voxel_size[1],
        cut[vm.data_to_display_axis.z] * vm.image_info.voxel_size[2]
      ];
    }

    function data_to_display_coords(cursor) {
      var axX = vm.display_to_data_axis_idx.X;
      var axY = vm.display_to_data_axis_idx.Y;
      var axZ = vm.display_to_data_axis_idx.Z;
      return {
        "X": Math.round(cursor[axX] / vm.image_info.voxel_size[axX]),
        "Y": Math.round(cursor[axY] / vm.image_info.voxel_size[axY]),
        "Z": Math.round(cursor[axZ] / vm.image_info.voxel_size[axZ])
      };
    }

    // uses vm.data_to_display_axis as an input
    function updateDisplayAxisSwap() {
      // Invert the mapping
      vm.display_to_data_axis = {};
      for(var axis in vm.data_to_display_axis) {
        vm.display_to_data_axis[vm.data_to_display_axis[axis]] = axis;
      }

      vm.display_to_data_axis_idx = {
        "X": DATA_AXIS_NAME_TO_INDEX[vm.display_to_data_axis.X],
        "Y": DATA_AXIS_NAME_TO_INDEX[vm.display_to_data_axis.Y],
        "Z": DATA_AXIS_NAME_TO_INDEX[vm.display_to_data_axis.Z]
      };
    }

    /* the argument is one of the strings: X-, X+, Y-, Y+, Z-, Z+ */
    function axis_label(oriented_display_axis) {
      if(!vm.image_info)
        return;
      var data_axis = vm.display_to_data_axis[oriented_display_axis[0]];
      var negative_data_axis = (oriented_display_axis[1] == "-")
          != vm.data_axis_inversions[data_axis];
      if(vm.image_info.axis_orientations) {
        var data_axis_idx = DATA_AXIS_NAME_TO_INDEX[data_axis];
        if(negative_data_axis)
          return INVERSE_AXIS_NAMES[vm.image_info.axis_orientations[data_axis_idx]];
        else
          return vm.image_info.axis_orientations[data_axis_idx];
      } else {
        return data_axis + (negative_data_axis ? "-" : "+");
      }
    }

    function toggle_axis_inversion(display_axis) {
      var data_axis = vm.display_to_data_axis[display_axis];
      vm.data_axis_inversions[data_axis] = !vm.data_axis_inversions[data_axis];
      reconfigure_zoomer_instances();
      redraw();
    }

    function exchange_axes(display_axis1, display_axis2) {
      var cursor = display_to_data_coords(vm.cut);
      var mid_in_data_coords = display_to_data_coords(vm.mid);
      var data_axis1 = vm.display_to_data_axis[display_axis1];
      var data_axis2 = vm.display_to_data_axis[display_axis2];
      vm.data_to_display_axis[data_axis1] = display_axis2;
      vm.data_to_display_axis[data_axis2] = display_axis1;
      updateDisplayAxisSwap();
      Object.assign(vm.cut, data_to_display_coords(cursor));
      Object.assign(vm.mid, data_to_display_coords(mid_in_data_coords));
      set_view();
      reconfigure_zoomer_instances();
      redraw();
    }

    function reconfigure_zoomer_instances() {
      var Xdim = vm.image_info.size[vm.display_to_data_axis_idx.X];
      var Ydim = vm.image_info.size[vm.display_to_data_axis_idx.Y];
      var Zdim = vm.image_info.size[vm.display_to_data_axis_idx.Z];
      var max_level = vm.image_info.max_level;
      var tile_size= vm.image_info.tile_size;

      vm.top_left_zoomer.reconfigure({
        Width: Xdim,
        Height: Ydim,
        MirrorHoriz: vm.data_axis_inversions[vm.display_to_data_axis.X],
        MirrorVert: vm.data_axis_inversions[vm.display_to_data_axis.Y],
        TileSize: tile_size,
        MaxLevel: max_level
      });
      vm.top_right_zoomer.reconfigure({
        Width: Zdim,
        Height: Ydim,
        MirrorHoriz: vm.data_axis_inversions[vm.display_to_data_axis.Z],
        MirrorVert: vm.data_axis_inversions[vm.display_to_data_axis.Y],
        TileSize: tile_size,
        MaxLevel: max_level
      });
      vm.bottom_left_zoomer.reconfigure({
        Width: Xdim,
        Height: Zdim,
        MirrorHoriz: vm.data_axis_inversions[vm.display_to_data_axis.X],
        MirrorVert: vm.data_axis_inversions[vm.display_to_data_axis.Z],
        TileSize: tile_size,
        MaxLevel: max_level
      });
    }

    var redraw_pending = false;
    function redraw() {
      if(!redraw_pending) {
        redraw_pending = true;
        $window.requestAnimationFrame(function() {
          redraw_pending = false;
          vm.top_left_zoomer.redraw();
          vm.top_right_zoomer.redraw();
          vm.bottom_left_zoomer.redraw();
        });
      }
    }

    function zoomer_is_instantiated() {
      return Boolean(vm.top_left_zoomer
                     && vm.top_right_zoomer
                     && vm.bottom_left_zoomer);
    }

    function resize() {
      if(zoomer_is_instantiated()) {
        vm.top_left_zoomer.resize();
        var new_zoom = vm.top_left_zoomer.getzoom();
        vm.top_right_zoomer.resize(new_zoom);
        vm.bottom_left_zoomer.resize(new_zoom);
        zoom_updated_by_zoomer(new_zoom);
      }
    }

    function zoom_updated_by_zoomer(zoom) {
      $scope.$apply(function() {
        // FIXME: this displayPixelSize is approximate because Zoomer does not
        // yet support anisotropic pixels
        vm.displayPixelSize = zoom * (vm.image_info.voxel_size[0]
                                      + vm.image_info.voxel_size[1]
                                      + vm.image_info.voxel_size[2]) / 3;
        display_pixel_size_updated();
      });
    }

    function get_current_zoom() {
      // FIXME: this displayPixelSize is approximate because Zoomer does not
      // yet support anisotropic pixels
      return vm.displayPixelSize / (vm.image_info.voxel_size[0]
                                    + vm.image_info.voxel_size[1]
                                    + vm.image_info.voxel_size[2]) * 3;
    }

    // The following objects are constant, they describe the filename lay-out
    // of Zoomer tiles. TODO: move this to a service, make it modular to
    // support DZI.
    var DATA_AXIS_NAME_TO_INDEX = {"x": 0, "y": 1, "z": 2};
    var INPLANE_AXES_FOR_SLICE_AXIS = {
      "x": ["y", "z"],
      "y": ["z", "x"],
      "z": ["y", "x"]
    };
    var AXIS_SWAP_NEEDED = {
      "yz": false,
      "zy": true,
      "zx": false,
      "xz": true,
      "yx": false,
      "xy": true
    };

    // Constants related to the anatomical meaning of axes
    var INVERSE_AXIS_NAMES = {"R": "L", "L": "R",
                              "A": "P", "P": "A",
                              "S": "I", "I": "S"};
    // These constants define a lay-out in neurological convention (subject
    // right to the right of the screen) with the coronal view on the top
    // left, axial view on the bottom left, sagittal view on the top right.
    var AXIS_PERMUTATION = {"R": "X", "L": "X",
                            "S": "Y", "I": "Y",
                            "A": "Z", "P": "Z"};
    var AXIS_INVERSION = {"R": false, "L": true,
                          "S": true, "I": false,
                          "A": true, "P": false};
  }
})(); /* IIFE */
