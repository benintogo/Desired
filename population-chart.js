'use strict';
(()=>{
const data=window.POPULATION_DATA,$=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
const colors=['#dc3545','#f2cd32','#22964f'],names=['Trailer','Self + Peer','Target'];
const svg=$('population-chart');let reference=0,selectedYear=1999;
const left=55,right=975,top=15,bottom=270,x=y=>left+(y-1999)/24*(right-left),yp=p=>bottom-p/100*(bottom-top);
function element(tag,attrs,text){const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
function readout(year){const v=data.series[reference][year-1999];$('population-readout').textContent=v?`${year} · Trailer ${v[0].toFixed(2)}% · Self + Peer ${v[1].toFixed(2)}% · Target ${v[2].toFixed(2)}%`:`${year} · No Data for this country`;const line=$('population-year-line');if(line){line.setAttribute('x1',x(year));line.setAttribute('x2',x(year));}}
function render(){svg.replaceChildren();$('population-title').textContent=`Population by relationship · ${window.MAP_DATA.countries[reference]}`;
svg.append(element('rect',{x:left,y:top,width:right-left,height:bottom-top,fill:'#eef2f6'}));
const values=data.series[reference];let segments=[],segment=[];values.forEach((v,i)=>{if(v){segment.push({year:1999+i,v});}else if(segment.length){segments.push(segment);segment=[];}});if(segment.length)segments.push(segment);
for(const seg of segments){for(let k=0;k<3;k++){const lo=p=>p.v.slice(0,k).reduce((a,b)=>a+b,0),hi=p=>lo(p)+p.v[k];const upper=seg.map(p=>`${x(p.year)},${yp(hi(p))}`),lower=[...seg].reverse().map(p=>`${x(p.year)},${yp(lo(p))}`);svg.append(element('path',{d:'M'+upper.join('L')+'L'+lower.join('L')+'Z',fill:colors[k],stroke:colors[k],'stroke-width':.5}));}}
for(const p of [0,25,50,75,100]){svg.append(element('line',{x1:left,x2:right,y1:yp(p),y2:yp(p),stroke:'#172b4530','stroke-width':1}),element('text',{x:left-10,y:yp(p)+5,'text-anchor':'end',fill:'#53667b','font-size':14},p+'%'));}
for(const year of [1999,2003,2007,2011,2015,2019,2023])svg.append(element('text',{x:x(year),y:bottom+27,'text-anchor':'middle',fill:'#53667b','font-size':14},year));
svg.append(element('line',{id:'population-year-line',x1:x(selectedYear),x2:x(selectedYear),y1:top,y2:bottom,stroke:'#172b45','stroke-width':2,'stroke-dasharray':'5 4'}));
const frag=document.createDocumentFragment();values.forEach((v,i)=>{const tr=document.createElement('tr');[1999+i,...(v?v.map(n=>n.toFixed(2)+'%'):['No Data','No Data','No Data'])].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.append(td);});frag.append(tr);});$('population-rows').replaceChildren(frag);readout(selectedYear);}
if(!data){$('population-readout').textContent='Population data could not load. Please reload the page.';return;}
function yearAt(e){const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const p=point.matrixTransform(svg.getScreenCTM().inverse());return Math.max(1999,Math.min(2023,Math.round(1999+(p.x-left)/(right-left)*24)));}
svg.addEventListener('pointermove',e=>readout(yearAt(e)));svg.addEventListener('pointerleave',()=>readout(selectedYear));svg.addEventListener('click',e=>{const select=$('year');select.value=yearAt(e);select.dispatchEvent(new Event('change'));});
document.addEventListener('map-view-change',e=>{const changed=reference!==e.detail.reference;reference=e.detail.reference;selectedYear=e.detail.year;if(changed||!svg.firstChild)render();else readout(selectedYear);});
})();
