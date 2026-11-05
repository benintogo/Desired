'use strict';
window.ChartRange={create(chart,years,onChange){
 const first=years[0],last=years.at(-1);let start=first,end=last;
 const box=document.createElement('div');box.className='chart-range';box.id=chart.id+'-range';
 const label=chart.id.replace(/-chart$/, '').replaceAll('-',' ');
 box.innerHTML='<div class="range-heading"><span>Year range <output></output></span><button type="button">Reset</button></div><div class="range-track"><div class="range-rail"></div><div class="range-selection"></div><input type="range" class="range-start"><input type="range" class="range-end"></div><div class="range-extents"><span>'+first+'</span><span>'+last+'</span></div>';
 chart.closest('.population-scroll').after(box);
 const inputs=box.querySelectorAll('input'),output=box.querySelector('output'),band=box.querySelector('.range-selection');
 inputs.forEach((input,i)=>{input.min=first;input.max=last;input.step=1;input.setAttribute('aria-label',label+(i?' end year':' start year'));input.addEventListener('input',()=>{if(i)end=Math.max(start+1,Number(input.value));else start=Math.min(end-1,Number(input.value));update();});});
 function paint(){inputs[0].value=start;inputs[1].value=end;output.textContent=start+'–'+end;inputs[0].setAttribute('aria-valuetext',String(start));inputs[1].setAttribute('aria-valuetext',String(end));band.style.left=(start-first)/(last-first)*100+'%';band.style.width=(end-start)/(last-first)*100+'%';box.querySelector('button').disabled=start===first&&end===last;}
 function update(){paint();document.dispatchEvent(new Event('chart-range-change'));onChange();}
 box.querySelector('button').addEventListener('click',()=>{start=first;end=last;update();});
 let drag=null;
 band.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();drag={x:e.clientX,start,end,width:band.parentElement.getBoundingClientRect().width};band.setPointerCapture(e.pointerId);});
 band.addEventListener('pointermove',e=>{if(!drag)return;const shift=Math.max(first-drag.start,Math.min(last-drag.end,Math.round((e.clientX-drag.x)/drag.width*(last-first))));start=drag.start+shift;end=drag.end+shift;update();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])band.addEventListener(event,()=>{drag=null;});
 paint();return {get start(){return start;},get end(){return end;},contains(y){return y>=start&&y<=end;},clamp(y){return Math.max(start,Math.min(end,y));},fraction(y){return (y-start)/(end-start);},ticks(){const step=Math.max(1,Math.ceil((end-start)/6)),ticks=[start];for(let y=start+step;y<end;y+=step)ticks.push(y);if(end-ticks.at(-1)<step/2&&ticks.length>1)ticks.pop();ticks.push(end);return ticks;}};
}};
