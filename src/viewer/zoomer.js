function Zoomer(canvas,cfg){
    "use strict";
    var cache=new LRUCache(300);

    var canvaswidth=0;
    var canvasheight=0;
    var view=null; // cutx-cuty-cutw-cuth visible portion of image (in image pixels)
    var cfg = cfg;

    this.reconfigure=function(new_cfg){
        Object.assign(cfg, new_cfg);
    }

    this.fullcanvas=function(){
        canvaswidth=canvas.width;
        canvasheight=canvas.height;
        var w=cfg.Width;
        var h=cfg.Height;
        if(w/h<canvaswidth/canvasheight){
            view={
                cutx:(w-h*canvaswidth/canvasheight)/2,
                cuty:0,
                cutw:h*canvaswidth/canvasheight,
                cuth:h
            };
        }else{
            view={
                cutx:0,
                cuty:(h-w*canvasheight/canvaswidth)/2,
                cutw:w,
                cuth:w*canvasheight/canvaswidth
            };
        }
        prepare();
    };
    
    var viewnumber=0;
    
    this.redraw=prepare;
    function prepare(){
        var cutx=view.cutx;
        var cuty=view.cuty;
        var cutw=view.cutw;
        var cuth=view.cuth;

        var loadingnumber=++viewnumber;

        var planewidth=cfg.Width;
        var planeheight=cfg.Height;
        var tilesize=cfg.TileSize;
        var maxlevel=cfg.MaxLevel;
        var level=0;
        while((cutw>=canvaswidth*2)&&(cuth>=canvasheight*2)&&(level<maxlevel)){
            planewidth=(planewidth+1)>>1;
            planeheight=(planeheight+1)>>1;
            cutw=(cutw+1)>>1;
            cuth=(cuth+1)>>1;
            cutx=(cutx+1)>>1;
            cuty=(cuty+1)>>1;
            level++;
        }
        var tx=Math.floor(cutx/tilesize);
        var ty=Math.floor(cuty/tilesize);
        var tw=Math.floor((cutx+cutw)/tilesize-tx+1);
        var th=Math.floor((cuty+cuth)/tilesize-ty+1);

        var image=document.createElement("canvas");
        image.width=tw*tilesize;
        image.height=th*tilesize;
        var ctx=image.getContext("2d");

        var mainctx=canvas.getContext("2d");
        mainctx.setTransform(cfg.MirrorHoriz ? -1 : 1, 0,
                             0, cfg.MirrorVert ? -1 : 1,
                             cfg.MirrorHoriz ? canvaswidth : 0,
                             cfg.MirrorVert ? canvasheight : 0);
        var tempx=cutx;
        while(tempx<0)tempx+=tilesize;
        var tempy=cuty;
        while(tempy<0)tempy+=tilesize;
        function drawImage(){
            mainctx.globalAlpha=1;
            mainctx.fillStyle=cfg.FillStyle || "#FFFFFF";
            mainctx.fillRect(0,0,canvaswidth,canvasheight);
            mainctx.drawImage(image,tempx % tilesize,tempy % tilesize,cutw,cuth,0,0,canvaswidth,canvasheight);
            if(cfg.Overlay)
                try{cfg.Overlay(mainctx,canvaswidth,canvasheight,view.cutx,view.cuty,view.cutw,view.cuth);}
                catch(ex){console.log("Overlay exception: "+ex);}
        };

        function drawTile(tile,x,y){
            ctx.drawImage(tile,x*tilesize,y*tilesize);
        }

        var loading=[];

        for(var y=th-1;y>=0;y--)
            for(var x=tw-1;x>=0;x--){
                var ex=tx+x;
                var ey=ty+y;
                if(ex>=0 && ey>=0 && ex*tilesize<planewidth && ey*tilesize<planeheight){
                    var key=cfg.Key(level,ex,ey);
                    var tile=cache.get(key);
                    if(!tile){
                        loading.push({x:x,y:y,ex:ex,ey:ey,key:key});
                        (function(ex,ey,level){
                            var ox=ex,oy=ey;
                            var size=tilesize;
                            var mask=0;
                            while(!tile && level<maxlevel){
                                size >>= 1;
                                mask=(mask<<1)+1;
                                ex >>= 1;
                                ey >>= 1;
                                level++;
                                key=cfg.Key(level,ex,ey);
                                tile=cache.get(key);
                            }
                            if(tile)
                                ctx.drawImage(tile,(ox&mask)*size,(oy&mask)*size,size,size,x*tilesize,y*tilesize,tilesize,tilesize);
                        })(ex,ey,level);
                    }
                    else
                        drawTile(tile,x,y);
                }
            }
        drawImage();

        (function loadloop(){
            if(loading.length===0)return;
            var loaditem=loading.pop();
            cfg.Load(loaditem.key,loaditem.ex,loaditem.ey,function(tile){
                cache.put(loaditem.key,tile);
                if(viewnumber===loadingnumber){
                    drawTile(tile,loaditem.x,loaditem.y);
                    drawImage();
                    loadloop();
                }
            });
        })();
    }

    this.setmidzoom=function(midx,midy,zoom){
        canvaswidth=canvas.width;
        canvasheight=canvas.height;
        view={
            cutx:midx-zoom*canvaswidth/2,
            cuty:midy-zoom*canvasheight/2,
            cutw:zoom*canvaswidth,
            cuth:zoom*canvasheight
        };
        prepare();
    };
    this.getmidx=function(){
        return view.cutx+view.cutw/2;
    };
    this.getmidy=function(){
        return view.cuty+view.cuth/2;
    };
    this.getzoom=getzoom;
    function getzoom(){
        return view.cutw/canvaswidth;
    };


    function coords_for_mouseevent(event) {
        var clientrect = canvas.getBoundingClientRect();
        var clickx_px = event.clientX - clientrect.left;
        var clicky_px = event.clientY - clientrect.top;
        return {
            dataX: view.cutx+(cfg.MirrorHoriz ? (clientrect.width - clickx_px) : clickx_px)*view.cutw/clientrect.width,
            dataY: view.cuty+(cfg.MirrorVert ? (clientrect.height - clicky_px) : clicky_px)*view.cuth/clientrect.height
        };
    }

    var pick=false;
    var pickt=null;
    var pickx;
    var picky;
    this.mdown=function(event){
        pick=true;
        pickt=Date.now();
        pickx=event.clientX;
        picky=event.clientY;
//        if(cfg.MouseDown)
//            try{cfg.MouseDown(event,canvaswidth,canvasheight,view.cutx,view.cuty,view.cutw,view.cuth);}
//            catch(ex){console.log("MouseDown exception: "+ex);}
    };
    this.mup=function(event){
        pick=false;
//        if(cfg.MouseUp)
//            try{cfg.MouseUp(event,canvaswidth,canvasheight,view.cutx,view.cuty,view.cutw,view.cuth);}
//            catch(ex){console.log("MouseUp exception: "+ex);}
        if(pickt && (Date.now()-pickt<1000) && cfg.Click) {
            var event_coords = coords_for_mouseevent(event);
            try{cfg.Click(event,event_coords.dataX,event_coords.dataY);}
            catch(ex){console.log("Click exception: "+ex);}
        }
    };
    this.mmove=function(event){
//        pickt=null;
        if(pick) {
            view.cutx+=(cfg.MirrorHoriz ? -1 : 1) * (pickx-event.clientX)*view.cutw/canvaswidth;
            view.cuty+=(cfg.MirrorVert ? -1 : 1) * (picky-event.clientY)*view.cuth/canvasheight;
            pickx=event.clientX;
            picky=event.clientY;
            prepare();
            if(cfg.Dispatch)
                try{cfg.Dispatch();}
                catch(ex){console.log("Dispatch exception: "+ex);}
        }
        if(cfg.MouseMove)
            try{cfg.MouseMove(event,canvaswidth,canvasheight,view.cutx,view.cuty,view.cutw,view.cuth);}
            catch(ex){console.log("MouseMove exception: "+ex);}
    };
    this.mwheel=function(event){
        if(event.shiftKey){
            var slices_to_scroll = Math.sign(event.deltaY);
            if(getzoom() > 1)
                slices_to_scroll = Math.round(slices_to_scroll * getzoom());
            event.preventDefault();
            if(cfg.Scroll)
                try{cfg.Scroll(slices_to_scroll);}
                catch(ex){console.log("Scroll exception: "+ex);}
        }else{
            var event_coords = coords_for_mouseevent(event);
            if(event.deltaY<0){
                view.cutx+=(event_coords.dataX - view.cutx)*0.1;
                view.cuty+=(event_coords.dataY - view.cuty)*0.1;

                view.cutw*=0.9;
                view.cuth=view.cutw*canvasheight/canvaswidth;
            }else{
                view.cutw/=0.9;
                view.cuth=view.cutw*canvasheight/canvaswidth;
                view.cutx-=(event_coords.dataX - view.cutx)*0.1;
                view.cuty-=(event_coords.dataY - view.cuty)*0.1;
            }
            event.preventDefault();
            prepare();
            if(cfg.Dispatch)
                try{cfg.Dispatch();}
                catch(ex){console.log("Dispatch exception: "+ex);}
      }
    };
    this.kpress=function(event){
        if(cfg.KeyPress)
            try{cfg.KeyPress(event,canvaswidth,canvasheight,view.cutx,view.cuty,view.cutw,view.cuth);}
            catch(ex){console.log("KeyPress exception: "+ex);}
    };
    
    canvas.addEventListener("mousedown",this.mdown,true);
    canvas.addEventListener("mouseup",this.mup,true);
    canvas.addEventListener("mousemove",this.mmove,true);
    canvas.addEventListener("wheel",this.mwheel,true);
    canvas.addEventListener("keypress",this.kpress,true);
}

// Local Variables:
// js-indent-level: 4
// End:
