/* Code-native pixel sprite: integer-coordinate SVG, four walking frames. */
(function(){
'use strict';
const $=id=>document.getElementById(id),pawn=$('walkerPawn'),body=$('walkerPixels');
if(!pawn||!body)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const uniforms=[['#323d52','#c1bba7','舞台制作'],['#d4ad73','#fff2d3','パン職人'],['#af6551','#ebd9b5','教員'],['#345b78','#ecede2','船員'],['#6d7960','#d1b890','映像制作者'],['#477e94','#b7bcb0','修理職人'],['#739079','#e6d9b7','河川調査員'],['#ac7966','#f0dfba','宿の仕事']];
let state=null,mode='idle',frameId=0,lastKey='',started=0,duration=6000,departure=null,pausedAt=null;
function appearance(s){
 const age=s.age,child=age<12,teen=age>=12&&age<18,student=age>=18&&age<24&&s.college;
 const arc=Number.isInteger(s.arc)?s.arc:null;
 const role=child?'子ども':teen?'学生':student?'大学生':arc===null?'若者':s.retired?'引退後':uniforms[arc][2];
 return {age,child,teen,student,arc,role,height:child?26:teen?31:35,
  hair:age>=67?'#e5dfd1':age>=47?'#8f9390':'#4b3e39',
  coat:child?'#ce875c':teen?'#4b647d':student?'#798863':s.retired?'#aa8e6b':uniforms[arc??0][0],
  accent:child?'#edd199':teen?'#e7e0cb':student?'#c1ac7c':uniforms[arc??0][1],
  cane:age>=78&&s.health<50};
}
function sprite(s,frame){
 const a=appearance(s),r=[],outline='#33493f',skin='#e3b68e',shade='#bd8c6d';
 const rect=(x,y,w,h,c)=>r.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
 const top=35-a.height,hip=a.child?27:25,step=[0,2,0,-2][frame],arm=[0,-1,0,1][frame];
 // A silhouette stays recognisable across outfits and ages.
 rect(7,top+1,9,2,outline);rect(5,top+3,13,9,outline);
 rect(6,top+3,11,7,a.hair);rect(7,top+6,10,7,skin);rect(16,top+7,2,4,shade);
 rect(7,top+5,4,2,a.hair);rect(12,top+8,1,2,outline);rect(16,top+8,1,2,outline);
 rect(13,top+12,3,1,shade);rect(10,top+13,5,3,skin);
 if(a.age>=40&&a.age<67){rect(6,top+7,1,4,'#c0bdb1');rect(17,top+5,1,3,'#c0bdb1');}
 rect(6,top+15,12,hip-top-13,outline);rect(7,top+15,10,hip-top-14,a.coat);
 rect(10,top+15,4,2,a.accent);rect(11,top+17,1,hip-top-17,a.accent);
 // Arms and feet move in opposing, whole-pixel steps.
 rect(4,top+16+arm,3,7,a.coat);rect(4,top+23+arm,3,3,skin);
 rect(17,top+16-arm,3,7,a.coat);rect(17,top+23-arm,3,3,skin);
 rect(7,hip,5,8+step,outline);rect(13,hip,5,8-step,outline);
 rect(6,hip+7+step,6,2,'#55483c');rect(13,hip+7-step,6,2,'#55483c');
 if(a.child||a.teen){rect(2,top+15,3,9,'#ad6452');rect(6,top+15,1,7,'#eed39e');}
 if(a.student){rect(17,23,5,7,'#b8895e');rect(18,24,3,1,'#f3e8cb');}
 if(!a.child&&!a.teen&&!a.student&&a.arc!==null){
  const k=a.arc;
  if(!s.retired){
   if(k===0){rect(4,top+5,2,7,'#273b3c');rect(4,top+10,7,1,'#273b3c');rect(18,23,4,6,'#ba9368');}
   if(k===1){rect(5,top,13,4,'#fff4dc');rect(7,top-3,9,3,'#fff4dc');rect(8,18,8,9,'#f6e7ca');rect(10,23,4,2,'#cda880');}
   if(k===2){rect(18,22,4,7,'#7b4a48');rect(19,23,2,5,'#eadfbd');}
   if(k===3){rect(5,top+1,13,3,'#f7f1dd');rect(6,top+4,12,2,'#284e6a');rect(11,18,2,5,'#e2c47c');}
   if(k===4){rect(7,17,2,9,'#d7c498');rect(16,17,1,9,'#d7c498');rect(9,21,7,5,'#2f4243');rect(11,22,3,3,'#92bec2');}
   if(k===5){rect(8,17,1,10,'#c3c8b5');rect(15,17,1,10,'#c3c8b5');rect(18,22,2,8,'#bdc4bf');rect(17,21,4,2,'#bdc4bf');}
   if(k===6){rect(5,top,14,2,'#a99d6e');rect(8,top-2,7,2,'#a99d6e');rect(8,19,3,3,'#d8cfab');rect(14,19,3,3,'#d8cfab');rect(19,24,2,5,'#b7d5c3');}
   if(k===7){rect(8,19,8,8,'#eee0bd');rect(19,23,2,2,'#d4aa50');rect(20,25,1,4,'#d4aa50');}
  }else{rect(18,23,4,6,uniforms[k][0]);rect(19,24,2,1,'#e8d8b7');}
 }
 if(a.age>=56){rect(11,top+7,3,3,'#746e61');rect(15,top+7,3,3,'#746e61');rect(12,top+8,1,1,skin);rect(16,top+8,1,1,skin);rect(14,top+8,1,1,'#746e61');}
 if(a.cane){rect(20,25,4,1,'#775b40');rect(22,26,1,10,'#775b40');}
 return r.join('');
}
function draw(frame,x,y){
 if(!state)return;
 const key=[state.age,state.arc,state.college,state.retired,state.health<50,frame].join('/');
 if(key!==lastKey){body.innerHTML=sprite(state,frame);lastKey=key;}
 body.setAttribute("transform",departure?.bit===0?"translate(25 -78) scale(-2.2 2.2)":"translate(-25 -78) scale(2.2)");
 pawn.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);
}
function updateCaption(){const a=appearance(state);$('avatarCaption').textContent=`あなた · ${state.age}歳 · ${a.role}`;$('walkerScene').setAttribute('aria-label',`${state.age}歳の主人公、${a.role}。${mode==='walk'||mode==='depart'?'道を歩いています。':'道の上に立っています。'}`);$('walkerScene').dataset.age=state.age;$('walkerScene').dataset.role=a.role;}
function tick(now){
 frameId=0;if(!state)return;
 const elapsed=now-started,walking=mode==='walk'||mode==='depart';
 const frame=walking&&!reduced.matches?Math.floor(now/(state.age>=67?200:130))%4:0;
 if(departure){
  const t=reduced.matches?1:Math.min(1,elapsed/departure.duration),e=t*t*(3-2*t),sign=departure.bit?1:-1;
  draw(frame,300+sign*150*e,145-62*e);
  if(t===1){const done=departure.resolve;departure=null;mode='idle';done();return;}
 }else{draw(frame,300,mode==='walk'?205-60*Math.min(1,elapsed/duration):145);}
 if(walking&&!reduced.matches)frameId=requestAnimationFrame(tick);
}
function cancel(){if(frameId)cancelAnimationFrame(frameId);frameId=0;if(departure){const done=departure.resolve;departure=null;done();}}
function show(s,nextMode='idle',ms=6000){cancel();state={...s};mode=nextMode;pausedAt=null;duration=ms;started=performance.now();updateCaption();tick(started);}
function depart(bit,fast=false){cancel();pausedAt=null;mode='depart';started=performance.now();updateCaption();return new Promise(resolve=>{departure={bit,resolve,duration:fast?450:1050};tick(started);});}
function pause(){if(pausedAt===null)pausedAt=performance.now();if(frameId)cancelAnimationFrame(frameId);frameId=0;}
function resume(){if(pausedAt!==null){started+=performance.now()-pausedAt;pausedAt=null;}if(!frameId&&(mode==='walk'||mode==='depart'))frameId=requestAnimationFrame(tick);}
reduced.addEventListener('change',()=>{if(state){pause();tick(performance.now());}});
window.LIFE_AVATAR={show,depart,cancel,pause,resume,appearance,sprite};
})();
