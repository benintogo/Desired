'use strict';
(()=>{
const $=id=>document.getElementById(id),data=window.POPULATION_DATA,svg=$('balance-chart'),ns='http://www.w3.org/2000/svg';
let reference=0,year=1999;const x=y=>65+(y-1999)/24*850,yp=v=>145-v*1.25;
const score=v=>v===null?null:v[0]-v[2];const format=v=>(v>0?'+':'')+v.toFixed(2)+' pp';
const rankY=r=>20+(r-1)/196*250;
const ranks=data?data.years.map((_,yi)=>{const sorted=data.series.map((s,i)=>({i,value:score(s[yi])})).filter(e=>e.value!==null).sort((a,b)=>b.value-a.value);const result=Array(data.series.length).fill(null);let rank=0,previous=null;sorted.forEach((e,i)=>{if(previous===null||e.value!==previous)rank=i+1;result[e.i]=rank;previous=e.value;});return result;}):[];
function el(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function readout(y){const value=score(data.series[reference][y-1999]);$('balance-readout').textContent=value===null?`${y} · No Data for this country`:`${y} · Index ${format(value)} · Rank ${ranks[y-1999][reference]}`;const line=$('balance-year-line');if(line){line.setAttribute('x1',x(y));line.setAttribute('x2',x(y));}const dot=$('balance-year-dot');if(dot){dot.setAttribute('cx',x(y));dot.setAttribute('cy',value===null?145:yp(value));dot.setAttribute('visibility',value===null?'hidden':'visible');}}
function render(){svg.replaceChildren();$('balance-title').textContent=`Global Stature Index · ${window.MAP_DATA.countries[reference]}`;
for(const v of [-100,-50,0,50,100])svg.append(el('line',{x1:65,x2:915,y1:yp(v),y2:yp(v),stroke:v===0?'#708299':'#dce4ec','stroke-width':v===0?1.5:1}),el('text',{x:55,y:yp(v)+5,'text-anchor':'end',fill:'#53667b','font-size':14},(v>0?'+':'')+v));
for(const r of [1,50,100,150,197])svg.append(el('text',{x:930,y:rankY(r)+5,fill:'#a34b9b','font-size':14},r));
for(const y of [1999,2003,2007,2011,2015,2019,2023])svg.append(el('text',{x:x(y),y:300,'text-anchor':'middle',fill:'#53667b','font-size':14},y));
let d='',rd='',connected=false;const frag=document.createDocumentFragment();data.series[reference].forEach((v,i)=>{const n=score(v);if(n===null)connected=false;else {d+=(connected?'L':'M')+x(1999+i)+','+yp(n);rd+=(connected?'L':'M')+x(1999+i)+','+rankY(ranks[i][reference]);connected=true;}const tr=document.createElement('tr');for(const t of [1999+i,n===null?'No Data':format(n),ranks[i][reference]===null?'No Data':ranks[i][reference]]){const td=document.createElement('td');td.textContent=t;tr.append(td);}frag.append(tr);});
svg.append(el('path',{d:rd,fill:'none',stroke:'#a34b9b','stroke-width':3,'stroke-dasharray':'8 4','stroke-linejoin':'round'}),el('path',{d,fill:'none',stroke:'#2864b0','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'}),el('line',{id:'balance-year-line',x1:x(year),x2:x(year),y1:20,y2:270,stroke:'#708299','stroke-dasharray':'5 4'}),el('circle',{id:'balance-year-dot',r:5,fill:'#2864b0',stroke:'#fff','stroke-width':2}));$('balance-rows').replaceChildren(frag);readout(year);}
if(!data){$('balance-readout').textContent='Population data could not load. Please reload the page.';return;}
function yearAt(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return Math.max(1999,Math.min(2023,Math.round(1999+(p.matrixTransform(svg.getScreenCTM().inverse()).x-65)/850*24)));}
svg.addEventListener('pointermove',e=>readout(yearAt(e)));svg.addEventListener('pointerleave',()=>readout(year));svg.addEventListener('click',e=>{$('year').value=yearAt(e);$('year').dispatchEvent(new Event('change'));});
document.addEventListener('map-view-change',e=>{const changed=reference!==e.detail.reference;reference=e.detail.reference;year=e.detail.year;if(changed||!svg.firstChild)render();else readout(year);});
})();
