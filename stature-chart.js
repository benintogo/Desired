'use strict';
(()=>{
const $=id=>document.getElementById(id), countries=window.MAP_DATA.countries, data={years:window.POPULATION_DATA.years,series:window.POPULATION_DATA.series.map(row=>row.map(v=>v===null?null:v[0]-v[2]))};
const totals=data.years.map((_,y)=>data.series.reduce((sum,row)=>sum+(row[y]??0),0));
const selected=new Map(),palette=['#2864b0','#c04467','#168477','#9255b5','#c27812','#435565','#d04c20','#657e22'];let nextColor=0, mode='value', pickerMode='add';
const ranks=data.years.map((_,y)=>{const result=Array(countries.length).fill(null), entries=data.series.map((s,i)=>({i,v:s[y]})).filter(e=>e.v!==null).sort((a,b)=>b.v-a.v);let rank=0;entries.forEach((e,i)=>{if(!i||e.v!==entries[i-1].v)rank=i+1;result[e.i]=rank;});return result;});
function add(i){selected.set(i,nextColor<palette.length?palette[nextColor]:`hsl(${nextColor*137.508%360} 65% 40%)`);nextColor++;}
['United States','China'].forEach(n=>{const i=countries.indexOf(n);if(i>=0)add(i);});
function svg(tag,attrs,text){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;return el;}
const format=v=>v.toLocaleString('en-US',{maximumFractionDigits:3});
function render(){
 const chart=$('stature-history-chart');chart.replaceChildren();const W=1000,H=360,L=100,R=25,T=35,B=45;
 const values=i=>data.years.map((_,y)=>mode==='rank'?ranks[y][i]:data.series[i][y]===null?null:data.series[i][y]);
 const all=[...selected.keys()].flatMap(values).filter(v=>v!==null);const max=mode==='rank'?Math.max(5,Math.ceil(Math.max(1,...all)/5)*5):Math.max(1,...all)*1.05;
 const min=mode==='rank'?1:Math.min(0,...all)*1.05;
 const x=j=>L+j/24*(W-L-R),y=v=>mode==='rank'?T+(v-1)/(max-1)*(H-T-B):H-B-(v-min)/(max-min)*(H-T-B);
 chart.setAttribute('aria-label',`Global Stature Index ${mode==='rank'?'rankings, rank 1 at the top':'values in percentage points'}, 1999–2023. ${[...selected.keys()].map(i=>countries[i]).join(', ')}. Exact values in the table below.`);
 chart.append(svg('text',{x:L,y:18,fill:'#53667b','font-size':14},mode==='rank'?'Rank · 1 is highest':'Global Stature Index · percentage points'));
 for(let k=0;k<=4;k++){const v=mode==='rank'?Math.round(1+k*(max-1)/4):min+k*(max-min)/4;chart.append(svg('line',{x1:L,x2:W-R,y1:y(v),y2:y(v),stroke:'#e0e7ef'}),svg('text',{x:L-10,y:y(v)+5,'text-anchor':'end',fill:'#53667b','font-size':13},v.toLocaleString('en-US',{maximumSignificantDigits:2})+(mode==='rank'?'':' pp')));}
 [0,4,8,12,16,20,24].forEach(j=>chart.append(svg('text',{x:x(j),y:H-15,'text-anchor':'middle',fill:'#53667b','font-size':14},data.years[j])));
 const legend=$('stature-history-legend');legend.replaceChildren();
 for(const [i,color] of selected){const vals=values(i);let path='',open=false;vals.forEach((v,j)=>{if(v===null){open=false;return;}path+=`${open?'L':'M'}${x(j)},${y(v)} `;open=true;});chart.append(svg('path',{d:path,fill:'none',stroke:color,'stroke-width':2.5}));vals.forEach((v,j)=>{if(v===null)return;const dot=svg('circle',{cx:x(j),cy:y(v),r:4,fill:color,tabindex:0});const label=`${countries[i]} · ${data.years[j]} · ${mode==='rank'?'Rank '+v:format(v)+' pp'}`;dot.append(svg('title',{},label));dot.setAttribute('aria-label',label);dot.addEventListener('mouseenter',()=>$('stature-history-readout').textContent=label);dot.addEventListener('focus',()=>$('stature-history-readout').textContent=label);dot.addEventListener('click',()=>$('stature-history-readout').textContent=label);chart.append(dot);});const item=document.createElement('span');item.className='legend-item';const swatch=document.createElement('i');swatch.className='swatch';swatch.style.setProperty('--color',color);item.append(swatch,document.createTextNode(countries[i]));legend.append(item);}
 $('stature-history-readout').textContent='';
 $('stature-remove-country').disabled=!selected.size;$('stature-add-country').disabled=selected.size===countries.length;
 const head=$('stature-history-head'),body=$('stature-history-rows');head.replaceChildren();body.replaceChildren();const hr=document.createElement('tr');['Year',...[...selected.keys()].map(i=>countries[i])].forEach(t=>{const th=document.createElement('th');th.scope='col';th.textContent=t;hr.append(th);});head.append(hr);
 data.years.forEach((year,j)=>{const tr=document.createElement('tr');[year,...[...selected.keys()].map(i=>{const v=values(i)[j];return v===null?'No Data':format(v)+(mode==='rank'?'':' pp');})].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.append(td);});body.append(tr);});$('stature-history-table-label').textContent=mode==='rank'?'Rankings by year':'Values by year (pp)';
}
function setupCombo(action){
 const input=$('stature-'+action+'-country'),list=$('stature-'+action+'-options');let active=-1;
 function close(){list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;}
 function choose(i){if(action==='add')add(i);else selected.delete(i);input.value='';close();render();}
 function filter(){const q=input.value.trim().toLocaleLowerCase();list.replaceChildren();active=-1;input.removeAttribute('aria-activedescendant');countries.map((name,i)=>({name,i})).filter(e=>(action==='add'?!selected.has(e.i):selected.has(e.i))&&e.name.toLocaleLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name)).forEach(e=>{const option=document.createElement('button');option.type='button';option.role='option';option.id='stature-'+action+'-option-'+e.i;option.textContent=e.name;option.tabIndex=-1;option.addEventListener('mousedown',e=>e.preventDefault());option.addEventListener('click',()=>choose(e.i));list.append(option);});if(!list.children.length){const empty=document.createElement('span');empty.textContent='No matching countries';list.append(empty);}list.hidden=false;input.setAttribute('aria-expanded','true');}
 input.addEventListener('focus',filter);input.addEventListener('input',filter);input.addEventListener('blur',close);input.addEventListener('keydown',e=>{if(e.key==='Escape'){close();return;}const options=[...list.querySelectorAll('button')];if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)filter();const opts=[...list.querySelectorAll('button')];if(!opts.length)return;active=(active+(e.key==='ArrowDown'?1:-1)+opts.length)%opts.length;opts.forEach((o,i)=>o.setAttribute('aria-selected',String(i===active)));input.setAttribute('aria-activedescendant',opts[active].id);opts[active].scrollIntoView({block:'nearest'});}else if(e.key==='Enter'&&!list.hidden){e.preventDefault();if(options.length)options[Math.max(0,active)].click();}});
}
setupCombo('add');setupCombo('remove');
document.querySelectorAll('input[name="stature-history-mode"]').forEach(input=>input.addEventListener('change',()=>{mode=input.value;render();}));render();
})();
