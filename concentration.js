'use strict';
(()=>{
const $=id=>document.getElementById(id),d=window.POWER_DATA,chart=$('concentration-chart');
const points=d.years.map((year,j)=>{const values=d.series.map(s=>s[j]).filter(v=>v!==null),total=values.reduce((a,b)=>a+b,0);return {year,hhi:values.reduce((sum,v)=>sum+(v/total)**2,0),count:values.length};});
const el=(tag,attrs,text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
const fmt=v=>v.toLocaleString('en-US',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1});
const range=ChartRange.create(chart,d.years,render);
function read(p){$('concentration-readout').textContent=`${p.year} · HHI ${fmt(p.hhi)} · ${p.count} countries with data`;}
function render(){
 chart.replaceChildren();const visible=points.filter(p=>range.contains(p.year));
 const low=Math.floor(Math.min(...visible.map(p=>p.hhi))*100)/100,top=Math.max(low+.01,Math.ceil(Math.max(...visible.map(p=>p.hhi))*100)/100);
 const x=year=>85+range.fraction(year)*875,y=v=>305-(v-low)/(top-low)*260;
 chart.setAttribute('aria-label',`Concentration of Global Power Index shares, ${range.start}–${range.end}`);
 chart.append(el('text',{x:85,y:24,fill:'#53667b','font-size':14},'HHI (%)'));
 for(let i=0;i<=4;i++){const v=low+i*(top-low)/4;chart.append(el('line',{x1:85,x2:960,y1:y(v),y2:y(v),stroke:'#e0e7ef'}),el('text',{x:75,y:y(v)+5,'text-anchor':'end',fill:'#53667b','font-size':14},fmt(v)));}
 for(const year of range.ticks())chart.append(el('text',{x:x(year),y:335,'text-anchor':'middle',fill:'#53667b','font-size':14},year));
 chart.append(el('path',{d:visible.map((p,i)=>(i?'L':'M')+x(p.year)+','+y(p.hhi)).join(' '),fill:'none',stroke:'#2864b0','stroke-width':3}));
 for(const p of visible){const dot=el('circle',{cx:x(p.year),cy:y(p.hhi),r:5,fill:'#2864b0',tabindex:0,'aria-label':`${p.year}: HHI ${fmt(p.hhi)}`});dot.append(el('title',{},`${p.year}: ${fmt(p.hhi)}`));for(const event of ['mouseenter','focus','click'])dot.addEventListener(event,()=>read(p));chart.append(dot);}
 read(visible.at(-1));
}
for(const p of points){const tr=document.createElement('tr');for(const value of [p.year,fmt(p.hhi),p.count]){const td=document.createElement('td');td.textContent=value;tr.append(td);}$('concentration-rows').append(tr);}
render();
})();
