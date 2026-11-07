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
function sprite(s,frame=0){
 const a=appearance(s),r=[],ink='#34473f',skin='#e5b992',skinLight='#f4d2aa',skinShade='#c18d72';
 const rect=(x,y,w,h,c)=>{if(w>0&&h>0)r.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`)};
 const child=a.child,top=child?7:a.teen?3:0,hip=child?28:27;
 const phase=frame%4,leg=[0,2,0,-2][phase],arm=[0,-1,0,1][phase],bob=phase%2?0:1;
 const coat=s.npc?['#9a6c83','#71929b','#ac7960','#637890','#8b8661','#ad805b','#739280','#a07369'][s.arc]:a.coat;
 const hair=s.npc&&s.age<47?['#5c4540','#4b4b41','#6e4e3e','#484748','#4f4242','#6b5241','#49483f','#694b40'][s.arc]:a.hair;
 // Fixed-length legs move in opposite directions; they no longer stretch like rubber.
 rect(8+leg,hip,5,8,ink);rect(7+leg,hip+7,7,3,'#5e5346');rect(8+leg,hip+7,5,1,'#938170');
 rect(15-leg,hip,5,8,'#465c53');rect(14-leg,hip+7,7,3,'#4b463d');rect(15-leg,hip+7,5,1,'#897765');
 // Hair, face, neck: a small light edge makes the face readable at phone size.
 rect(8,top+1+bob,12,2,ink);rect(6,top+3+bob,16,10,ink);
 rect(7,top+3+bob,14,8,hair);rect(9,top+2+bob,10,2,hair);
 rect(8,top+5+bob,12,10,skin);rect(9,top+6+bob,9,3,skinLight);
 rect(8,top+5+bob,5,2,hair);rect(7,top+5+bob,2,7,hair);
 rect(20,top+8+bob,2,4,skinShade);rect(13,top+9+bob,1,2,ink);rect(18,top+9+bob,1,2,ink);
 rect(12,top+12+bob,2,1,'#d8977d');rect(18,top+12+bob,2,1,'#d8977d');rect(15,top+14+bob,3,1,'#aa7765');
 rect(11,top+15+bob,6,3,skinShade);rect(12,top+15+bob,4,2,skin);
 if(a.age>=40&&a.age<67){rect(7,top+8+bob,2,4,'#aaa99d');rect(20,top+5+bob,1,4,'#aaa99d');}
 if(s.npc&&s.arc%3===0){rect(5,top+6+bob,2,10,hair);rect(20,top+4+bob,2,12,hair);}
 // Jacket outline, shoulder highlights, shirt and pocket.
 rect(7,top+18,14,hip-top-16,ink);rect(8,top+18,12,hip-top-17,coat);
 rect(9,top+18,10,1,a.accent);rect(12,top+18,4,3,a.accent);
 rect(13,top+21,1,hip-top-20,'#eee1bf');rect(16,top+22,3,2,a.accent);
 rect(5,top+19+arm,3,6,coat);rect(5,top+24+arm,3,3,skin);
 rect(20,top+19-arm,3,6,coat);rect(20,top+24-arm,3,3,skinLight);
 if(child||a.teen){rect(3,top+19,2,8,'#7e6450');rect(2,top+20,3,6,'#b68160');rect(8,top+19,1,7,'#d9b888');}
 if(a.student){rect(20,27,6,7,'#9b7652');rect(21,28,4,2,'#cfb68b');rect(22,27,2,1,'#5c5542');}
 if(!child&&!a.teen&&!a.student&&a.arc!==null&&!s.npc){
 const k=a.arc;
 if(!s.retired){
 if(k===0){rect(5,top+5+bob,2,8,'#263c39');rect(5,top+12+bob,8,1,'#263c39');rect(21,25,5,7,'#b2936a');rect(22,26,3,4,'#ede0ba');}
 if(k===1){rect(6,top+bob,16,4,'#fff3d5');rect(8,top-3+bob,12,4,'#fff7e3');rect(8,top+bob,12,1,'#e7d6af');rect(10,21,9,8,'#f2e5c6');rect(12,25,5,2,'#d0b991');}
 if(k===2){rect(21,25,5,8,'#8d5c53');rect(22,26,3,6,'#ecdcba');rect(21,26,1,6,'#69453e');}
 if(k===3){rect(7,top+bob,14,4,'#f7edd4');rect(6,top+4+bob,16,2,'#34586a');rect(13,22,2,5,'#dec18a');rect(15,22,3,1,'#e9dfc6');}
 if(k===4){rect(9,20,2,9,'#aead88');rect(18,20,1,9,'#aead88');rect(10,25,9,6,'#30433d');rect(13,26,4,4,'#8caeaa');rect(14,27,2,2,'#344e4c');}
 if(k===5){rect(10,20,1,10,'#bfd1bc');rect(18,20,1,10,'#bfd1bc');rect(8,28,13,2,'#6a6550');rect(23,25,2,9,'#bac3b6');rect(22,24,4,2,'#bac3b6');}
 if(k===6){rect(5,top+1+bob,18,2,'#b4a16c');rect(9,top-2+bob,11,3,'#b4a16c');rect(9,top+bob,11,1,'#8c875b');rect(10,22,3,3,'#d3c7a2');rect(16,22,3,3,'#d3c7a2');rect(23,26,2,6,'#c4dfcf');rect(23,26,2,1,'#6e8c76');}
 if(k===7){rect(10,22,9,8,'#eee0bc');rect(11,26,7,1,'#c9b98e');rect(23,25,2,2,'#dbba65');rect(24,27,1,5,'#dbba65');rect(24,30,3,1,'#dbba65');}
 }else{rect(21,26,5,7,uniforms[k][0]);rect(22,27,3,1,'#e9d5b5');}
 }
 if(s.npc){const style=[2,0,3,1,2,1,0,3][s.arc];if(style===1){rect(8,top+bob,3,2,hair);rect(15,top+bob,4,2,hair);rect(7,top+7+bob,2,7,hair);}if(style===2){rect(5,top+7+bob,3,15,hair);rect(20,top+6+bob,3,15,hair);rect(9,top+5+bob,8,2,hair);}if(style===3){rect(21,top+3+bob,4,5,hair);rect(20,top+7+bob,2,11,hair);rect(10,top+5+bob,8,2,hair);}}
 if(a.age>=56){rect(12,top+8+bob,4,4,'#786b58');rect(17,top+8+bob,4,4,'#786b58');rect(13,top+9+bob,2,2,skin);rect(18,top+9+bob,2,2,skin);rect(16,top+9+bob,1,1,'#786b58');}
 if(a.cane){rect(23,27,4,1,'#806b4c');rect(26,28,1,10,'#806b4c');}
 return r.join('');
}
function draw(frame,x,y){
 if(!state)return;
 const key=[state.age,state.arc,state.college,state.retired,state.health<50,frame].join('/');
 if(key!==lastKey){body.innerHTML=sprite(state,frame);lastKey=key;}
 body.setAttribute("transform",departure?.bit===0?"translate(34 -91) scale(-2.4 2.4)":"translate(-34 -91) scale(2.4)");
 pawn.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);
}
function updateCaption(){const a=appearance(state);$('avatarCaption').textContent=`あなた · ${state.age}歳 · ${a.role}`;$('walkerScene').setAttribute('aria-label',`${state.age}歳の主人公、${a.role}。${mode==='walk'||mode==='depart'?'道を歩いています。':'道の上に立っています。'}`);$('walkerScene').dataset.age=state.age;$('walkerScene').dataset.role=a.role;}
function tick(now){
 frameId=0;if(!state)return;
 const elapsed=now-started,walking=mode==='walk'||mode==='depart';
 const frame=walking&&!reduced.matches?Math.floor(now/(state.age>=67?200:130))%4:0;
 if(departure){
  const t=reduced.matches?1:Math.min(1,elapsed/departure.duration),e=t*t*(3-2*t),sign=departure.bit?1:-1;
  draw(frame,300+sign*150*e,177-72*e);
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
