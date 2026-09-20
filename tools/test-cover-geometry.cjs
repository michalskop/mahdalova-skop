const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root=process.argv[2]||require('node:path').resolve(__dirname,'..');
const G=require(root+'/tools/cover-geometry.js');
const html=fs.readFileSync(root+'/tools/poster-editor.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(js);
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const box={x:117.2,y:-31.8,w:310,h:170};
for(const h of ['nw','ne','sw','se'])for(const [dx,dy] of [[0,0],[43,-67],[-800,-450],[222,333]]){
  const r=G.resizeBox(box,h,dx,dy);near(r.w/r.h,box.w/box.h);
  near(h.includes('w')?r.x+r.w:r.x,h.includes('w')?box.x+box.w:box.x);
  near(h.includes('n')?r.y+r.h:r.y,h.includes('n')?box.y+box.h:box.y);
}
for(const h of ['e','w'])near(G.resizeBox(box,h,80,50).h,box.h);
for(const h of ['n','s'])near(G.resizeBox(box,h,80,50).w,box.w);
for(const width of [400,1200,3375])for(const height of [200,1200,4219])for(const zoom of [1,2,3])for(const pan of [-1,0,1]){
 const r=G.imageRect(box,{width,height},{zoom,panX:pan,panY:-pan});
 assert(r.x<=box.x+1e-8&&r.y<=box.y+1e-8);assert(r.x+r.w>=box.x+box.w-1e-8&&r.y+r.h>=box.y+box.h-1e-8);
 near(r.w/r.h,width/height);
}
near(G.snap([10,20,30],18,[50],6).delta,20);
near(G.snap([10],8,[50],6).delta,8);
assert(!js.match(/imgView\(\)\.(zoom|panX|panY)\s*=/));
assert(js.includes('delete state.imageViews[state.format]'));
console.log('PASS syntax, 16 anchored corner cases, 4 edge cases, 81 crop cases, snapping and variant write invariants');
