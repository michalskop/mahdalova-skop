/* Pure logical-coordinate geometry shared by the editor and regression tests. */
(function(root){
  function resizeBox(b, handle, dx, dy, minimum=24){
    const west=handle.includes('w'),east=handle.includes('e'),north=handle.includes('n'),south=handle.includes('s');
    let w=b.w,h=b.h;
    if(handle.length===2){
      const vx=(west?-1:1)*b.w,vy=(north?-1:1)*b.h;
      const scale=Math.max(minimum/Math.min(b.w,b.h),(vx*(vx+dx)+vy*(vy+dy))/(vx*vx+vy*vy));
      w=b.w*scale;h=b.h*scale;
    }else{
      if(west||east)w=Math.max(minimum,b.w+(west?-dx:dx));
      if(north||south)h=Math.max(minimum,b.h+(north?-dy:dy));
    }
    return {x:west?b.x+b.w-w:b.x,y:north?b.y+b.h-h:b.y,w,h};
  }
  function snap(start, delta, targets, threshold){
    let best=threshold,offset=0,target=null;
    for(const t of targets)for(const edge of start){
      const distance=t-(edge+delta);
      if(Math.abs(distance)<best){best=Math.abs(distance);offset=distance;target=t;}
    }
    return {delta:delta+offset,target};
  }
  function imageRect(box,source,transform){
    const zoom=Math.max(1,transform.zoom||1);
    const scale=Math.max(box.w/source.width,box.h/source.height)*zoom;
    const w=source.width*scale,h=source.height*scale;
    const px=Math.max(-1,Math.min(1,transform.panX||0)),py=Math.max(-1,Math.min(1,transform.panY||0));
    return {x:box.x+(box.w-w)/2+px*(w-box.w)/2,y:box.y+(box.h-h)/2+py*(h-box.h)/2,w,h,scale};
  }
  const api={resizeBox,snap,imageRect};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.CoverGeometry=api;
})(typeof globalThis==='undefined'?window:globalThis);
