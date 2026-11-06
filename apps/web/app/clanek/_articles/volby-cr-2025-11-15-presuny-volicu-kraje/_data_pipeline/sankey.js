(function(){
// Sankey přesunů voličů 2021 → 2025 (vkládá vypocet.py místo __DATA__). Kreslí se podle skutečné šířky článku
// (ResizeObserver), písmo 14/12 px, tooltip v našem stylu (DESIGN §10), klik na stranu zvýrazní její toky.
var D=__DATA__,NS='http://www.w3.org/2000/svg',INK='#101432',SEDA='#55597a',STRED='#b9bccb';
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function svetla(h){var r=parseInt(h.substr(1,2),16)/255,g=parseInt(h.substr(3,2),16)/255,b=parseInt(h.substr(5,2),16)/255;
  function l(c){return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)}return .2126*l(r)+.7152*l(g)+.0722*l(b)>.45}
function cis(v){return v>=995000?(v/1e6).toFixed(1).replace('.',',')+' mil.':Math.round(v/1000)+' tis.'}
function pr(a,b){var x=a/b*100;return (x<1?'méně než 1':Math.round(x))+' %'}
var tt=document.getElementById('dt-sk-tt');
if(!tt){tt=document.createElement('div');tt.id='dt-sk-tt';document.body.appendChild(tt);
  var st=document.createElement('style');st.textContent=
  '#dt-sk-tt{position:fixed;z-index:9999;display:none;pointer-events:none;max-width:300px;background:rgba(248,246,240,.97);border:1px solid #e8e3d2;border-radius:7px;box-shadow:0 4px 10px rgba(16,20,50,.14);color:#101432;font:13px/1.4 "IBM Plex Sans",Arial,sans-serif;overflow:hidden}'+
  '#dt-sk-tt.on{display:block}#dt-sk-tt .h{font-weight:700;font-size:13.5px;padding:5px 12px}'+
  '#dt-sk-tt .b{padding:6px 12px 8px}#dt-sk-tt .b strong{font-weight:700}#dt-sk-tt .m{margin-top:3px;font-size:12.5px}';
  document.head.appendChild(st)}
function ukaz(h,b,barva,ev){tt.innerHTML='<div class="h" style="background:'+barva+';color:'+(svetla(barva)?INK:'#fff')+'">'+h+'</div><div class="b">'+b+'</div>';
  tt.classList.add('on');var p=12,w=tt.offsetWidth,hh=tt.offsetHeight,x=ev.clientX+p+w>innerWidth?ev.clientX-w-p:ev.clientX+p,y=ev.clientY+p+hh>innerHeight?ev.clientY-hh-p:ev.clientY+p;
  tt.style.left=Math.max(8,x)+'px';tt.style.top=Math.max(8,y)+'px'}
function schovej(){tt.classList.remove('on')}
document.addEventListener('pointerdown',function(e){if(!(e.target.closest&&e.target.closest('.dt-sankey2')))schovej()});
document.querySelectorAll('.dt-sankey2:not([data-init])').forEach(function(root){
  root.setAttribute('data-init','1');var sel=null,obl=0,id='sv'+Math.random().toString(36).slice(2,7);
  // přepínač oblasti: Česko a 14 krajů
  var lista=document.createElement('div');lista.style.cssText='display:flex;align-items:center;gap:10px;margin:0 0 12px;font:14px "IBM Plex Sans",Arial,sans-serif;color:#101432';
  var lab=document.createElement('label');lab.textContent='Zobrazit:';lab.style.fontWeight='600';
  var vyb=document.createElement('select');vyb.style.cssText='font:inherit;color:#101432;background:#f8f6f0;border:1px solid #c3c6d8;border-radius:6px;padding:5px 30px 5px 10px;cursor:pointer';
  vyb.setAttribute('aria-label','Oblast');D.oblasti.forEach(function(o,i){var op=document.createElement('option');op.value=i;op.textContent=o.n;vyb.appendChild(op)});
  lab.appendChild(vyb);lista.appendChild(lab);root.appendChild(lista);
  var plocha=document.createElement('div');root.appendChild(plocha);
  vyb.addEventListener('change',function(){obl=+vyb.value;sel=null;schovej();kresli()});
  function kresli(){
    var W=plocha.clientWidth;if(!W)return;var mob=W<560,fs=mob?12:14,fm=mob?10.5:12,nw=mob?8:10,top=fs*1.9;
    var O=D.oblasti[obl],T=O.t.map(function(x){return{s:x[0],t:x[1],v:x[2]}}),tl={},tr={};
    T.forEach(function(x){tl[x.s]=(tl[x.s]||0)+x.v;tr[x.t]=(tr[x.t]||0)+x.v});
    var Ln=D.L.filter(function(n){return tl[n]}),Rn=D.R.filter(function(n){return tr[n]}),sum=0;for(var n in tl)sum+=tl[n];
    var mer=el('svg',{width:0,height:0},plocha),mL=0,mR=0;mer.style.cssText='position:absolute;visibility:hidden;font-family:"IBM Plex Sans",Arial,sans-serif';
    function sir(t,f,w){var e=el('text',{'font-size':f,'font-weight':w},mer);e.textContent=t;var v=e.getComputedTextLength();mer.removeChild(e);return v}
    Ln.forEach(function(n){mL=Math.max(mL,sir(n,fs,700),sir('≈ '+cis(tl[n])+' · '+cis(tl[n]),fm,400))});
    Rn.forEach(function(n){mR=Math.max(mR,sir(n+' · '+cis(tr[n]),fs,700),sir('≈ '+cis(tr[n]),fm,400))});
    plocha.removeChild(mer);var lw=Math.ceil(mL)+12,rw=Math.ceil(mR)+12;
    var x0=lw,x1=W-rw-nw,gap=mob?8:10,H=mob?560:Math.min(700,Math.max(600,W*.68));
    function poz(ns,tot){var k=(H-gap*(ns.length-1))/sum,y={},c=top;ns.forEach(function(n){y[n]=c;c+=Math.max(tot[n]*k,2.5)+gap});return{y:y,k:k}}
    var PL=poz(Ln,tl),PR=poz(Rn,tr),k=PL.k;
    plocha.innerHTML='';var svg=el('svg',{width:W,height:top+H+4,viewBox:'0 0 '+W+' '+(top+H+4),role:'img','aria-label':root.getAttribute('data-alt')||''},plocha);
    svg.style.cssText='display:block;font-family:"IBM Plex Sans",Arial,sans-serif;overflow:visible';
    function text(x,yy,s,o){var t=el('text',{x:x,y:yy,'font-size':o.fs||fs,'font-weight':o.w||600,fill:o.fill||INK,'text-anchor':o.a||'start','dominant-baseline':'middle'},o.p||svg);t.textContent=s;return t}
    text(x0+nw,fs*.6,'Volby 2021',{a:'end',w:700,fs:fm,fill:SEDA});text(x1,fs*.6,'Volby 2025',{w:700,fs:fm,fill:SEDA});
    var defs=el('defs',{},svg),gL=el('g',{},svg),gN=el('g',{},svg),oL={},oR={},cx=(x0+nw+x1)/2,cesty=[],uzly=[];
    Ln.forEach(function(n){oL[n]=PL.y[n]});Rn.forEach(function(n){oR[n]=PR.y[n]});
    // toky v pořadí cílů (vlevo) a zdrojů (vpravo), ať se pruhy nekříží zbytečně
    Ln.forEach(function(s){Rn.forEach(function(t){T.forEach(function(x){if(x.s!==s||x.t!==t)return;
      var h=x.v*k,a=oL[s],b=oR[t];oL[s]+=h;oR[t]+=h;var i=cesty.length;
      var gr=el('linearGradient',{id:id+'g'+i,gradientUnits:'userSpaceOnUse',x1:x0+nw,y1:0,x2:x1,y2:0},defs);
      el('stop',{offset:0,'stop-color':D.barvy[s]},gr);el('stop',{offset:.5,'stop-color':STRED},gr);el('stop',{offset:1,'stop-color':D.barvy[t]},gr);
      var p=el('path',{d:'M'+(x0+nw)+','+a+' C'+cx+','+a+' '+cx+','+b+' '+x1+','+b+' L'+x1+','+(b+h)+' C'+cx+','+(b+h)+' '+cx+','+(a+h)+' '+(x0+nw)+','+(a+h)+' Z',fill:'url(#'+id+'g'+i+')'},gL);
      p.x=x;cesty.push(p);
      function info(e){if(sel&&!p.on)return;ukaz(s===t?s+': zůstali':s+' → '+t,(s===t?'Zůstalo':'Přešlo')+' zhruba <strong>'+cis(x.v)+'</strong>'+
        '<div class="m">'+pr(x.v,tl[s])+' voličů '+(s==='Nevoliči'?'nevoličů':s)+' z roku 2021 · '+pr(x.v,tr[t])+' voličů '+(t==='Nevoliči'?'nevoličů':t)+' 2025</div>',D.barvy[s],e)}
      p.addEventListener('pointermove',info);p.addEventListener('pointerdown',info);
      p.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')schovej()});
    })})});
    function uzel(n,side){var P=side==='L'?PL:PR,tot=side==='L'?tl:tr,h=Math.max(tot[n]*k,2.5),y=P.y[n],ym=y+h/2,tw=n==='ANO'?700:600;
      var g=el('g',{tabindex:0,role:'button','aria-label':'Zvýraznit '+(side==='L'?'odkud odešli voliči: ':'odkud přišli voliči: ')+n},gN);g.style.cursor='pointer';g.style.outline='none';
      g.n=n;g.side=side;uzly.push(g);var hz=Math.max(h,fs*1.8);
      el('rect',{x:side==='L'?0:x1,y:ym-hz/2,width:side==='L'?x0+nw:W-x1,height:hz,fill:'transparent'},g);
      el('rect',{x:side==='L'?x0:x1,y:y,width:nw,height:h,fill:D.barvy[n],rx:1.5},g);
      var dve=h>fs*2.3,xt=side==='L'?x0-10:x1+nw+10,a=side==='L'?'end':'start';
      var t1=text(xt,dve?ym-fs*.45:ym,n,{a:a,w:tw,p:g});g.cnt=el('tspan',{fill:SEDA,'font-weight':400},t1);
      if(dve)text(xt,ym+fs*.6,'≈ '+cis(tot[n]),{a:a,w:400,fs:fm,fill:SEDA,p:g});
      g.addEventListener('click',function(){sel=sel&&sel.n===n&&sel.side===side?null:{n:n,side:side};stav();schovej()});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();g.dispatchEvent(new Event('click'))}});
      g.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;
        var sez=T.filter(function(x){return side==='L'?x.s===n:x.t===n}).sort(function(a,b){return b.v-a.v}).slice(0,4)
          .map(function(x){var o=side==='L'?x.t:x.s;return (o===n?'zůstali':o)+' '+pr(x.v,tot[n])}).join(', ');
        ukaz(n+(side==='L'?' (2021)':' (2025)'),'Voličů zhruba <strong>'+cis(tot[n])+'</strong><div class="m">'+(side==='L'?'Kam šli: ':'Odkud přišli: ')+sez+'</div>',D.barvy[n],e)});
      g.addEventListener('pointerleave',schovej)}
    Ln.forEach(function(n){uzel(n,'L')});Rn.forEach(function(n){uzel(n,'R')});
    function stav(){var par={};
      cesty.forEach(function(p){var on=sel&&(sel.side==='L'?p.x.s:p.x.t)===sel.n;p.on=on;if(on)par[sel.side==='L'?p.x.t:p.x.s]=p.x.v;
        p.setAttribute('fill-opacity',sel?(on?.85:.05):(p.x.s==='ANO'||p.x.t==='ANO'?.6:.38));p.style.pointerEvents=sel&&!on?'none':'auto'});
      uzly.forEach(function(g){var hl=!sel||(g.n===sel.n&&g.side===sel.side)||(g.side!==sel.side&&g.n in par);
        g.setAttribute('opacity',hl?1:.3);g.cnt.textContent=sel&&g.side!==sel.side&&g.n in par?' · '+cis(par[g.n]):''})}
    stav();
  }
  kresli();var sirka=plocha.clientWidth;
  if(window.ResizeObserver)new ResizeObserver(function(){if(Math.abs(plocha.clientWidth-sirka)>4){sirka=plocha.clientWidth;kresli()}}).observe(plocha);
  root.addEventListener('pointerleave',schovej);
});
})();
