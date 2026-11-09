'use strict';
window.ChartScale=(values,{rank=false,floor=-Infinity,ceiling=Infinity}={})=>{
 const valid=values.filter(Number.isFinite);let lo=valid.length?Math.min(...valid):0,hi=valid.length?Math.max(...valid):1;
 const pad=(hi-lo||Math.abs(hi)*.1||1)*.06;lo=Math.max(floor,lo-pad);hi=Math.min(ceiling,hi+pad);
 const raw=(hi-lo)/4,power=10**Math.floor(Math.log10(raw)),unit=raw/power;
 let step=([1,2,2.5,5,10].find(n=>n>=unit)||10)*power;if(rank)step=Math.max(1,Math.ceil(step));
 let min=Math.max(floor,Math.floor(lo/step)*step),max=Math.min(ceiling,Math.ceil(hi/step)*step);
 if(max<=min)max=min+step;
 const ticks=[];for(let n=Math.ceil(min/step);n*step<=max+step*1e-8;n++)ticks.push(Number((n*step).toPrecision(12)));
 if(rank&&min===1&&!ticks.includes(1))ticks.unshift(1);
 const digits=rank?0:Math.min(12,Math.max(0,-Math.floor(Math.log10(step))+(Math.abs(step/power-2.5)<1e-8?1:0)));
 return {min,max,ticks,format:v=>v.toLocaleString('en-US',{maximumFractionDigits:digits}),fraction:v=>(v-min)/(max-min)};
};
