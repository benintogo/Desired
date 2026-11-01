'use strict';
(()=>{const $=id=>document.getElementById(id),D=window.LAND_DATA,colors=['#2864b0','#168477','#9255b5','#c27812','#c04467'];let order=[],correct=[],locked=false,total=0,possible=0,round=0,replayTimer;let mode='practice',practice=null,dailyDay='',dailyScore=0;const daily=window.LAND_DAILY;const fmt=n=>n.toLocaleString('en-US',{maximumFractionDigits:2});
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function newRound(){if(mode==='daily')return;clearTimeout(replayTimer);const level=+$('land-level').value,n=3+(level-1)%3,span=level>=7?50:level>=4?150:Infinity;let pool=D;if(isFinite(span)){const starts=D.filter(p=>new Set(D.filter(q=>q.rank>=p.rank&&q.rank<=p.rank+span).map(q=>q.area)).size>=n);const start=starts[Math.floor(Math.random()*starts.length)].rank;pool=D.filter(p=>p.rank>=start&&p.rank<=start+span);}const seen=new Set();order=shuffle([...pool]).filter(p=>{if(seen.has(p.area))return false;seen.add(p.area);return true;}).slice(0,n);correct=[...order].sort((a,b)=>b.area-a.area||a.rank-b.rank);shuffle(order);locked=false;round++;$('land-rule').textContent=n+' places'+(isFinite(span)?' · within '+span+' ranks':' · all ranks');$('land-results').hidden=true;$('land-score').textContent='';$('land-check').disabled=false;render();}
function render(){const list=$('land-order');list.replaceChildren();order.forEach((p,i)=>{const li=document.createElement('li'),name=document.createElement('span');name.textContent=(i+1)+'. '+p.name;li.append(name);for(const [symbol,delta,label]of [['↑',-1,'Move up'],['↓',1,'Move down']]){const b=document.createElement('button');b.textContent=symbol;b.setAttribute('aria-label',label+' '+p.name);b.disabled=locked||i+delta<0||i+delta>=order.length;b.onclick=()=>{[order[i],order[i+delta]]=[order[i+delta],order[i]];saveDaily();render();};li.append(b);}list.append(li);});}
const svg=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;};
function animate(){clearTimeout(replayTimer);const box=$('land-animation');box.replaceChildren();box.style.height=order.length*74+'px';order.forEach((p,i)=>{const row=document.createElement('div');row.className='land-result-row';row.style.borderColor=colors[correct.indexOf(p)];row.style.transform=`translateY(${i*74}px)`;const name=document.createElement('span');name.textContent=p.name;const area=document.createElement('small');area.textContent=fmt(p.area)+' km²';row.append(name,area);box.append(row);});const token=round;replayTimer=setTimeout(()=>{if(round!==token)return;[...box.children].forEach((row,i)=>row.style.transform=`translateY(${correct.indexOf(order[i])*74}px)`);},700);}
function treemap(items,x,y,w,h){if(items.length===1){const p=items[0],idx=correct.indexOf(p),r=svg('rect',{x,y,width:w,height:h,fill:colors[idx],stroke:'white','stroke-width':1});r.append(svg('title',{},p.name+' · '+fmt(p.area)+' km²'));$('land-tree').append(r);if(w>90&&h>35)$('land-tree').append(svg('text',{x:x+8,y:y+22,fill:'white','font-size':13},p.name.length>Math.floor(w/8)?p.name.slice(0,Math.floor(w/8)-2)+'…':p.name));return;}const sum=items.reduce((a,p)=>a+p.area,0);let cut=1,s=items[0].area;while(cut<items.length-1&&s<sum/2){s+=items[cut++].area;}const f=s/sum;if(w>=h){treemap(items.slice(0,cut),x,y,w*f,h);treemap(items.slice(cut),x+w*f,y,w*(1-f),h);}else{treemap(items.slice(0,cut),x,y,w,h*f);treemap(items.slice(cut),x,y+h*f,w,h*(1-f));}}
function showResult(){
 $('land-check').disabled=true;render();$('land-results').hidden=false;$('land-tree').replaceChildren();treemap(correct,0,0,600,400);$('land-key').replaceChildren();correct.forEach((p,i)=>{const row=document.createElement('div');row.style.color=colors[i];row.textContent=`${i+1}. ${p.name} · ${fmt(p.area)} km²`;$('land-key').append(row);});animate();
}
function storageKey(){return 'land-daily-v1:'+dailyDay;}
function saveDaily(){if(mode!=='daily')return;try{localStorage.setItem(storageKey(),JSON.stringify({order:order.map(p=>p.rank),locked}));}catch{$('land-save-notice').hidden=false;$('land-save-notice').textContent='Browser storage is unavailable. Your daily result will not be saved after you leave.';}}
function loadDaily(){
 clearTimeout(replayTimer);round++;dailyDay=daily.day();order=daily.puzzle(D,dailyDay);const ids=order.map(p=>p.rank);locked=false;
 try{const saved=JSON.parse(localStorage.getItem(storageKey()));if(saved&&Array.isArray(saved.order)&&saved.order.length===4&&new Set(saved.order).size===4&&saved.order.every(id=>ids.includes(id))){order=saved.order.map(id=>D.find(p=>p.rank===id));locked=saved.locked===true;}}catch{}
 correct=[...order].sort((a,b)=>b.area-a.area);dailyScore=daily.result(order).filter(Boolean).length;
 $('land-daily-date').textContent=dailyDay+' · Level 8';$('land-rule').textContent='4 places · within 50 ranks';$('land-score').textContent=locked?`${dailyScore} / 3 points · Daily complete`:'';
 $('land-check').disabled=locked;$('land-results').hidden=!locked;$('land-share-panel').hidden=!locked;$('land-share-status').textContent='';$('land-share-text').hidden=true;render();if(locked)showResult();updateReset();
}
function updateReset(){const next=new Date(daily.day()+'T00:00:00Z').getTime()+86400000;const minutes=Math.max(0,Math.ceil((next-Date.now())/60000));$('land-daily-reset').textContent=`Next round in ${Math.floor(minutes/60)}h ${minutes%60}m · midnight UTC`;}
function activateMode(next){
 if(mode===next)return;
 if(mode==='practice')practice={order:[...order],correct:[...correct],locked,score:$('land-score').textContent,rule:$('land-rule').textContent};else saveDaily();
 mode=next;clearTimeout(replayTimer);round++;
 for(const name of ['practice','daily']){const tab=$('land-'+name+'-tab');tab.setAttribute('aria-selected',String(name===mode));tab.tabIndex=name===mode?0:-1;}
 $('land-game-panel').setAttribute('aria-labelledby','land-'+mode+'-tab');$('land-daily-info').hidden=mode!=='daily';$('land-difficulty').hidden=mode==='daily';$('land-new').hidden=mode==='daily';$('land-total').hidden=mode==='daily';$('land-share-panel').hidden=true;$('land-save-notice').hidden=true;
 if(mode==='daily')loadDaily();else if(practice){({order,correct,locked}=practice);$('land-score').textContent=practice.score;$('land-rule').textContent=practice.rule;$('land-check').disabled=locked;$('land-results').hidden=!locked;render();if(locked)showResult();}else newRound();
 requestAnimationFrame(initRoadMap);
}
$('land-check').onclick=()=>{
 if(mode==='daily'&&daily.day()!==dailyDay){loadDaily();return;}
 if(mode==='daily'){try{const saved=JSON.parse(localStorage.getItem(storageKey()));if(saved?.locked){loadDaily();return;}}catch{}}
 if(locked)return;locked=true;const score=daily.result(order).filter(Boolean).length;
 if(mode==='daily'){dailyScore=score;saveDaily();$('land-score').textContent=`${score} / 3 points · Daily complete`;$('land-share-panel').hidden=false;}else{total+=score;possible+=order.length-1;$('land-score').textContent=`${score} / ${order.length-1} points`;$('land-total').textContent=`Total: ${total} / ${possible}`;}
 showResult();
};
$('land-share').onclick=async()=>{
 const text=daily.share(dailyDay,order),status=$('land-share-status');
 try{if(navigator.share){await navigator.share({text});status.textContent='Result shared.';return;}if(navigator.clipboard){await navigator.clipboard.writeText(text);status.textContent='Result copied. Paste it to share with friends.';return;}}catch(e){if(e.name==='AbortError')return;}
 $('land-share-text').value=text;$('land-share-text').hidden=false;$('land-share-text').focus();$('land-share-text').select();status.textContent='Copy this result to share with friends.';
};
for(const name of ['practice','daily']){$('land-'+name+'-tab').onclick=()=>activateMode(name);$('land-'+name+'-tab').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'practice':e.key==='End'?'daily':mode==='daily'?'practice':'daily';activateMode(next);$('land-'+next+'-tab').focus();}};}
setInterval(()=>{if(mode==='daily'){if(daily.day()!==dailyDay)loadDaily();else updateReset();}},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='daily')loadDaily();});
window.addEventListener('storage',e=>{if(mode==='daily'&&e.key===storageKey()&&e.newValue){try{if(JSON.parse(e.newValue).locked)loadDaily();}catch{}}});
$('land-new').onclick=newRound;$('land-level').onchange=newRound;$('land-replay').onclick=animate;
let roadMap;
function initRoadMap(){if($('land-section').hidden)return;if(!window.L){$('land-map-name').textContent='Map could not load. Please reload to try again.';return;}if(!roadMap){roadMap=L.map('land-map',{zoomControl:false,worldCopyJump:true}).setView([22,0],2);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(roadMap);L.control.scale().addTo(roadMap);}roadMap.invalidateSize();}
$('land-section-tab').addEventListener('click',()=>requestAnimationFrame(initRoadMap));new MutationObserver(initRoadMap).observe($('land-section'),{attributes:true,attributeFilter:['hidden']});
$('land-plus').onclick=()=>roadMap?.zoomIn();$('land-minus').onclick=()=>roadMap?.zoomOut();$('land-reset').onclick=()=>roadMap?.setView([22,0],2);newRound();if(new URLSearchParams(location.search).get('game')==='daily'){$('land-section-tab').click();activateMode('daily');}})();
