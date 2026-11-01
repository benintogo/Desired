'use strict';
window.LAND_DAILY={
 day:()=>new Date().toISOString().slice(0,10),
 puzzle(data,day){
  let seed=2166136261;for(const c of 'land-daily-v1:'+day){seed^=c.charCodeAt(0);seed=Math.imul(seed,16777619);}
  const random=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
  const starts=data.filter(p=>new Set(data.filter(q=>q.rank>=p.rank&&q.rank<=p.rank+50).map(q=>q.area)).size>=4);
  const start=starts[Math.floor(random()*starts.length)].rank;
  const pool=data.filter(p=>p.rank>=start&&p.rank<=start+50);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const seen=new Set();return pool.filter(p=>{if(seen.has(p.area))return false;seen.add(p.area);return true;}).slice(0,4);
 },
 result(order){const correct=[...order].sort((a,b)=>b.area-a.area);return correct.slice(0,-1).map((p,i)=>order.indexOf(p)<order.indexOf(correct[i+1]));},
 share(day,order){const wins=this.result(order);return `Land Area Daily · ${day}\n${wins.filter(Boolean).length}/3 · Level 8\n${wins.map(v=>v?'🟩':'⬛').join('')}\nhttps://benintogo.github.io/Desired/?game=daily`;}
};
