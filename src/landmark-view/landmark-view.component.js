(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.landmarkView")
    .component("landmarkView", {
      templateUrl: "landmark-view/landmark-view.template.html",
      controller: LandmarkViewController
    });

  function LandmarkViewController(AlignmentTask, $log) {
    var vm = this;

    vm.incoming_cursor = [0, 0, 0];
    vm.incoming_display_referential = "native";
    vm.synchronize_cursors = false;
    vm.template_cursor = [0, 0, 0];
    vm.template_description = "dummy template";
    vm.transformation = null;
    vm.transformation_type = "rigid";
    vm.landmark_pairs = [];
    vm.current_alignment_task = null;

    vm.goToLandmarkPair = goToLandmarkPair;
    vm.performRegistration = performRegistration;
    vm.readyToTransform = readyToTransform;
    vm.transformationAvailable = transformationAvailable;
    vm.updateIncomingCursor = updateIncomingCursor;
    vm.updateTemplateCursor = updateTemplateCursor;

    ////////////

    function goToLandmarkPair(pair) {
      vm.template_cursor = pair.target_point.slice();
      vm.incoming_cursor = pair.source_point.slice();
    }

    function performRegistration() {
      var alignment_task_description = {
        source_image: "URI of source image",
        target_image: "URI of target image",
        landmark_pairs: vm.landmark_pairs
      };
      vm.current_alignment_task
        = AlignmentTask.create(alignment_task_description);
    }

    function readyToTransform() {
      switch(vm.transformation_type) {
      case "rigid":
      case "rigid+scaling":
      case "affine":
        return vm.landmark_pairs.length >= 3;
      default:
        $log.error("unknown transformation type");
        return false;
      }
    }

    function transformationAvailable() {
      return vm.transformation !== null;
    }

    function updateIncomingCursor(coords) {
      vm.incoming_cursor = coords;
    }

    function updateTemplateCursor(coords) {
      vm.template_cursor = coords;
    }

    ////////////

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

    var cor=document.getElementById("template_view_coronal");
    var sag=document.getElementById("template_view_sagittal");
    var axl=document.getElementById("template_view_axial");
    var corcv=document.getElementById("canvas_coronal");
    var sagcv=document.getElementById("canvas_sagittal");
    var axlcv=document.getElementById("canvas_axial");
    corcv.height=cor.offsetHeight;
    corcv.width=cor.offsetWidth;
    sagcv.width=sag.offsetWidth;
    sagcv.height=sag.offsetHeight;
    axlcv.width=axl.offsetWidth;
    axlcv.height=axl.offsetHeight;

    var corz=new Zoomer(corcv,{
        Width:xdim,Height:ydim,TileSize:256,MaxLevel:5-2, // coronal x-y
        Key:function(level,x,y){
            var z=cut.z;
            for(var i=0;i<level;i++)
                z=(z+1)>>1;
//            return "GetPNG.php?x="+x+"&y="+y+"&z="+z+"&level="+level+"&stack=z";
//            $filename=sprintf('data/%d/z/%04d/y%02d_x%02d.png',$level+2,$z,$y,$x);
            return "data/"+(level+2)+"/z/"+("0000"+z).substr(-4,4)+"/y"+("00"+y).substr(-2,2)+"_x"+("00"+x).substr(-2,2)+".png";
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
//            return "GetPNG.php?x="+x+"&y="+z+"&z="+y+"&level="+level+"&stack=x";
//            $filename=sprintf('data/%d/x/%04d/y%02d_z%02d.png',$level+2,$x,$y,$z);
            return "data/"+(level+2)+"/x/"+("0000"+x).substr(-4,4)+"/y"+("00"+z).substr(-2,2)+"_z"+("00"+y).substr(-2,2)+".png";
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
//            return "GetPNG.php?x="+x+"&y="+y+"&z="+z+"&level="+level+"&stack=y";
//            $filename=sprintf('data/%d/y/%04d/z%02d_x%02d.png',$level+2,$y,$z,$x);
            return "data/"+(level+2)+"/y/"+("0000"+y).substr(-4,4)+"/z"+("00"+z).substr(-2,2)+"_x"+("00"+x).substr(-2,2)+".png";
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

  }
})(); /* IIFE */
