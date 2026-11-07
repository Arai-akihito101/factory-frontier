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
function sprite(s,frame=0,direction='front'){
 const a=appearance(s),out=[],ink='#394343',skin='#e7b590',light='#f4caa3';
 const r=(x,y,w,h,c)=>{if(w>0&&h>0)out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`)};
 const back=direction==='back',side=direction==='side',step=[0,1,0,-1][frame%4],bob=frame%2;
 const top=(a.child?7:a.teen?3:0)+bob,hip=a.child?29:28;
 const coat=s.npc?['#96647d','#64848e','#ac7960','#637890','#8b8661','#ad805b','#739280','#a07369'][s.arc]:a.coat;
 const hair=a.hair;
 // A compact silhouette, with a single-pixel outline and a shared 28 x 40 grid.
 r(9,hip,4,7+step,ink);r(15,hip,4,7-step,ink);
 r(9,hip,3,5+step,'#59676b');r(15,hip,3,5-step,'#69777a');
 r(8,hip+6+step,5,2,'#443f3e');r(15,hip+6-step,5,2,'#443f3e');
 r(8,top+16,12,hip-top-14,ink);r(9,top+17,10,hip-top-16,coat);
 r(6,top+17+step,3,8,ink);r(7,top+18+step,2,5,coat);r(7,top+23+step,2,2,skin);
 r(19,top+17-step,3,8,ink);r(19,top+18-step,2,5,coat);r(19,top+23-step,2,2,light);
 r(11,top+15,6,2,skin);r(10,top+1,8,1,ink);r(8,top+2,12,2,ink);r(7,top+4,14,9,ink);r(9,top+13,10,2,ink);
 r(9,top+3,10,10,skin);r(10,top+4,8,7,light);r(10,top+13,7,2,skin);
 r(8,top+3,12,4,hair);r(9,top+2,9,2,hair);r(8,top+7,2,4,hair);
 if(back){r(8,top+4,12,9,hair);r(10,top+13,8,2,hair);r(10,top+4,7,1,a.age>=67?'#f4eedc':'#66554a');r(10,top+17,8,1,a.accent);}
 else if(side){r(8,top+5,8,8,hair);r(19,top+9,2,2,skin);r(18,top+8,1,2,ink);r(18,top+12,2,1,'#b97e69');}
 else{r(11,top+8,1,2,ink);r(17,top+8,1,2,ink);r(14,top+12,2,1,'#b97e69');r(12,top+17,4,2,a.accent);r(13,top+19,1,7,a.accent);}
 if(a.child||a.teen||a.student){
  if(back){r(10,top+19,8,9,'#765943');r(11,top+20,6,6,'#b38358');r(11,top+25,6,2,'#936545');}
  else{r(9,top+18,1,8,'#c6a375');if(!side)r(18,top+18,1,8,'#c6a375');}
 }
 if(!a.child&&!a.teen&&!a.student&&a.arc!==null&&!s.npc&&!s.retired){
  const k=a.arc;
  if(k===1){r(8,top,12,4,'#d6d9c9');r(9,top-3,10,4,'#f7f3df');r(7,top-1,14,3,'#f7f3df');}
  if(k===3){r(8,top+1,12,3,'#f1edd9');r(8,top+4,12,2,'#314d62');}
  if(k===6){r(9,top,10,3,'#a48b59');r(6,top+3,17,2,'#c7ac70');}
  if(!back){
   if(k===1||k===7){r(11,top+19,7,10,'#e6dcc0');r(12,top+25,5,2,'#b9ad90');}
   if(k===0){r(7,top+7,2,5,'#283b40');r(8,top+12,4,1,'#283b40');}
   if(k===2){r(20,top+23,4,6,'#8c5950');r(21,top+24,2,4,'#e4d5b7');}
   if(k===4){r(11,top+19,1,5,'#b5aa8c');r(17,top+19,1,5,'#b5aa8c');r(11,top+24,7,4,'#303e42');r(13,top+25,3,2,'#8da5a1');}
   if(k===5){r(10,top+20,2,6,'#b3c5b7');r(17,top+20,2,6,'#b3c5b7');r(9,top+26,10,2,'#645a47');}
   if(k===6){r(10,top+20,3,3,'#c0b18a');r(16,top+20,3,3,'#c0b18a');}
  }else if(k===4||k===6){r(10,top+19,8,8,'#575e4b');r(11,top+20,6,5,'#89916c');}
 }
 if(s.npc&&s.arc%2===0){r(7,top+7,2,10,hair);r(19,top+7,2,10,hair);}
 if(a.age>=56&&!back&&!side){r(10,top+7,4,4,'#766d60');r(16,top+7,4,4,'#766d60');r(11,top+8,2,2,light);r(17,top+8,2,2,light);r(14,top+8,2,1,'#766d60');}
 if(a.cane){r(22,top+25,3,1,'#806b4c');r(24,top+26,1,12,'#806b4c');}
 return out.join('');
}
function draw(frame,x,y){
 if(!state)return;
 const direction=departure?'side':mode==='walk'?'back':'front';
 const key=[state.age,state.arc,state.college,state.retired,state.health<50,frame,direction].join('/');
 if(key!==lastKey){body.innerHTML=sprite(state,frame,direction);lastKey=key;}
 const scale=2,flip=departure?.bit===0?-1:1;
 body.setAttribute('transform',`translate(${-14*scale*flip} ${-38*scale}) scale(${scale*flip} ${scale})`);
 pawn.setAttribute('transform',`translate(${Math.round(x/2)*2} ${Math.round(y/2)*2})`);
}
function updateCaption(){const a=appearance(state);$('avatarCaption').textContent=`あなた · ${state.age}歳 · ${a.role}`;$('walkerScene').setAttribute('aria-label',`${state.age}歳の主人公、${a.role}。${mode==='walk'||mode==='depart'?'道を歩いています。':'道の上に立っています。'}`);$('walkerScene').dataset.age=state.age;$('walkerScene').dataset.role=a.role;}
function tick(now){
 frameId=0;if(!state)return;
 const elapsed=now-started,walking=mode==='walk'||mode==='depart';
 const frame=walking&&!reduced.matches?Math.floor(now/(state.age>=67?200:130))%4:0;
 if(departure){
  const t=reduced.matches?1:Math.min(1,elapsed/departure.duration),e=t*t*(3-2*t),sign=departure.bit?1:-1;
  draw(frame,300+sign*150*e,177-69*e);
  if(t===1){const done=departure.resolve;departure=null;mode='idle';done();return;}
 }else{draw(frame,300,mode==='walk'?226-49*Math.min(1,elapsed/duration):177);}
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
