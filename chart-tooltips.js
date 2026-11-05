'use strict';
(()=>{
 const tip=document.createElement('div');
 tip.id='chart-point-tooltip';tip.role='tooltip';tip.hidden=true;
 Object.assign(tip.style,{position:'fixed',zIndex:'1000',pointerEvents:'none',background:'#162843',color:'#fff',padding:'9px 12px',borderRadius:'7px',fontSize:'14px',lineHeight:'1.4',maxWidth:'min(360px, calc(100vw - 24px))',boxShadow:'0 3px 12px #0003'});
 document.body.append(tip);
 let active=null;
 function hide(){tip.hidden=true;if(active){active.removeAttribute('aria-describedby');active=null;}}
 function show(text,x,y,target){
  if(!text)return hide();
  if(active&&active!==target)active.removeAttribute('aria-describedby');
  active=target;active?.setAttribute('aria-describedby',tip.id);
  tip.textContent=text;tip.hidden=false;
  const box=tip.getBoundingClientRect();
  tip.style.left=Math.max(12,Math.min(x+14,innerWidth-box.width-12))+'px';
  tip.style.top=Math.max(12,y+18+box.height>innerHeight?y-box.height-12:y+18)+'px';
 }
 for(const id of ['power-history-chart','stature-history-chart','concentration-chart','balance-chart','population-chart']){
  const chart=document.getElementById(id);if(!chart)continue;
  const readoutId={'balance-chart':'balance-readout','population-chart':'population-readout'}[id];
  chart.addEventListener('pointermove',e=>{
   if(e.pointerType==='touch')return;
   if(readoutId){show(document.getElementById(readoutId).textContent,e.clientX,e.clientY,null);return;}
   let best=null,distance=18;
   for(const point of chart.querySelectorAll('circle[aria-label]')){
    const b=point.getBoundingClientRect(),d=Math.hypot(e.clientX-b.x-b.width/2,e.clientY-b.y-b.height/2);
    if(d<distance){distance=d;best=point;}
   }
   if(best)show(best.getAttribute('aria-label'),e.clientX,e.clientY,best);else hide();
  });
  chart.addEventListener('pointerleave',hide);
  chart.addEventListener('focusin',e=>{
   const p=e.target;if(!p.matches('circle[aria-label]'))return;
   const b=p.getBoundingClientRect();show(p.getAttribute('aria-label'),b.x+b.width/2,b.y+b.height/2,p);
  });
  chart.addEventListener('focusout',hide);
 }
 document.addEventListener('chart-range-change',hide);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 document.addEventListener('click',hide);
 window.addEventListener('scroll',hide,true);
 window.addEventListener('resize',hide);
})();
