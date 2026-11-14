'use strict';
(()=>{
const $=id=>document.getElementById(id),countries=MAP_DATA.countries,years=POWER_DATA.years;
const totals=years.map((_,y)=>POWER_DATA.series.reduce((s,r)=>s+(r[y]??0),0));
const shares=POWER_DATA.series.map(r=>r.map((v,y)=>Number.isFinite(v)?v/totals[y]:null));
const majorThresholds=years.map((_,y)=>1/shares.filter(r=>Number.isFinite(r[y])).length);
const majorCountries=countries.map((_,i)=>i).filter(i=>shares[i].some((v,y)=>Number.isFinite(v)&&v>majorThresholds[y]));
const majorColors=new Map(majorCountries.map((i,j)=>[i,d3.hsl((j*137.508)%360,.85,.65).formatHex()]));
const isMajor=()=>$('globe-metric').value==='major';
const threshold=()=>majorThresholds[+$('globe-slider').value-years[0]];
const max=Math.max(...shares.flat().filter(Number.isFinite));
const features=GLOBE_FEATURES;
for(const f of features)for(const polygon of f.geometry.coordinates)if(d3.geoArea({type:'Polygon',coordinates:polygon})>2*Math.PI)polygon[0].reverse();
const centers=features.map(f=>{const polygons=f.geometry.coordinates.map(coordinates=>({type:'Polygon',coordinates}));return d3.geoCentroid(polygons.reduce((a,b)=>d3.geoArea(a)>d3.geoArea(b)?a:b));});
const svg=d3.select('#globe-map'),projection=d3.geoOrthographic().translate([450,350]).scale(310).rotate([20,-15]),path=d3.geoPath(projection);
svg.append('path').datum({type:'Sphere'}).attr('class','globe-ocean').attr('d',path);
svg.append('path').datum(d3.geoGraticule10()).attr('class','globe-grid').attr('d',path);
const shapes=svg.append('g').selectAll('path').data(features).join('path').attr('class','globe-country');
const dots=svg.append('g').selectAll('circle').data(features.map((f,i)=>({f,center:centers[i]})).filter(d=>d.f.properties.index>=0&&d3.geoArea(d.f)<.00002)).join('circle').attr('r',3).attr('class','globe-dot');
let selected=-1,timer=null,hover=-1;
function values(){const y=+$('globe-slider').value-years[0];return $('globe-metric').value!=='gsi'?shares.map(r=>r[y]):POPULATION_DATA.series.map(r=>r[y]?(r[y][0]-r[y][2])/100:null);}
function color(v,i){if(isMajor())return Number.isFinite(v)&&v>threshold()?majorColors.get(i):'#162a3a';if(!Number.isFinite(v))return '#596574';return $('globe-metric').value==='gpi'?d3.interpolateRgb('#162a3a','#c92732')(v/max):v>=0?d3.interpolateRgb('#ffffff','#168047')(v):d3.interpolateRgb('#ffffff','#c92732')(-v);}
function readout(i){const v=values(),n=v[i];$('globe-readout').textContent=i<0?'Drag to rotate · Scroll to zoom':`${countries[i]} · ${$('globe-slider').value} · ${Number.isFinite(n)?($('globe-metric').value!=='gsi'?(n*100).toPrecision(4)+'%':n.toFixed(3))+' · Rank '+(1+v.filter(x=>Number.isFinite(x)&&x>n).length)+(isMajor()?' · '+(n>threshold()?'Major power':'Below or equal to average'):''):'No data'}`;}
function draw(){svg.selectAll('path').attr('d',path);const view=projection.invert([450,350]);dots.attr('cx',d=>projection(d.center)[0]).attr('cy',d=>projection(d.center)[1]).attr('display',d=>d3.geoDistance(view,d.center)<Math.PI/2?null:'none');}
function render(){const v=values();shapes.attr('fill',f=>color(v[f.properties.index],f.properties.index)).classed('is-selected',f=>selected>=0&&f.properties.index===selected);dots.attr('fill',d=>color(v[d.f.properties.index],d.f.properties.index));$('globe-current-year').textContent=$('globe-slider').value;$('globe-slider').style.setProperty('--progress',((+$('globe-slider').value-years[0])/(years.at(-1)-years[0])*100)+'%');const gpi=$('globe-metric').value==='gpi';$('globe-gradient').style.background=gpi?'linear-gradient(to right,#162a3a,#c92732)':'linear-gradient(to right,#c92732,#fff,#168047)';$('globe-scale').replaceChildren(...(gpi?['0%',(max*100).toFixed(1)+'%']:['−1','0','+1']).map(t=>{const span=document.createElement('span');span.textContent=t;return span;}));$('globe-gradient').hidden=isMajor();$('globe-scale').hidden=isMajor();document.querySelector('.globe-missing').hidden=isMajor();readout(hover>=0?hover:selected);draw();}
function point(i){hover=i;readout(i);}shapes.on('pointerenter',(_,f)=>point(f.properties.index)).on('pointerleave',()=>{hover=-1;readout(selected);}).on('click',(_,f)=>{selected=f.properties.index;render();});dots.on('pointerenter',(_,d)=>point(d.f.properties.index)).on('pointerleave',()=>{hover=-1;readout(selected);}).on('click',(_,d)=>{selected=d.f.properties.index;render();});
$('globe-slider').min=years[0];$('globe-slider').max=years.at(-1);$('globe-slider').value=years.at(-1);
function pause(){clearInterval(timer);timer=null;$('globe-play').textContent='▶ Play';$('globe-play').setAttribute('aria-pressed','false');}
$('globe-play').onclick=()=>{if(timer)return pause();if(+$('globe-slider').value===years.at(-1))$('globe-slider').value=years[0];render();$('globe-play').textContent='Ⅱ Pause';$('globe-play').setAttribute('aria-pressed','true');timer=setInterval(()=>{const y=+$('globe-slider').value;if(y>=years.at(-1))return pause();$('globe-slider').value=y+1;render();},850);};
$('globe-metric').onchange=render;$('globe-slider').oninput=()=>{pause();render();};
let origin;svg.call(d3.drag().on('start',e=>{origin={x:e.x,y:e.y,r:projection.rotate()};}).on('drag',e=>{projection.rotate([origin.r[0]+(e.x-origin.x)*.3,Math.max(-90,Math.min(90,origin.r[1]-(e.y-origin.y)*.3))]);draw();}));
function zoom(f){projection.scale(Math.max(200,Math.min(1100,projection.scale()*f)));draw();}
svg.on('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.08:1/1.08);},{passive:false}).on('keydown',e=>{const r=projection.rotate();if(e.key==='ArrowLeft')r[0]-=10;else if(e.key==='ArrowRight')r[0]+=10;else if(e.key==='ArrowUp')r[1]=Math.min(90,r[1]+10);else if(e.key==='ArrowDown')r[1]=Math.max(-90,r[1]-10);else return;e.preventDefault();projection.rotate(r);draw();});
$('globe-plus').onclick=()=>zoom(1.25);$('globe-minus').onclick=()=>zoom(.8);$('globe-reset').onclick=()=>{projection.scale(310).rotate([20,-15]);draw();};
document.querySelectorAll('.section-tabs button').forEach(b=>b.addEventListener('click',()=>{if(b.id!=='globe-section-tab')pause();}));document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});new MutationObserver(()=>{if($('globe-section').hidden)pause();}).observe($('globe-section'),{attributes:true,attributeFilter:['hidden']});render();
})();
