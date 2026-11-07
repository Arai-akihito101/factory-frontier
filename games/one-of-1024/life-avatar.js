/* Code-native pixel sprite: integer-coordinate SVG, four walking frames. */
(function(){
'use strict';
const $=id=>document.getElementById(id),pawn=$('walkerPawn'),body=$('walkerPixels');
if(!pawn||!body)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const uniforms=[['#323d52','#c1bba7','舞台制作'],['#d4ad73','#fff2d3','パン職人'],['#af6551','#ebd9b5','教員'],['#345b78','#ecede2','船員'],['#6d7960','#d1b890','映像制作者'],['#477e94','#b7bcb0','修理職人'],['#739079','#e6d9b7','河川調査員'],['#ac7966','#f0dfba','宿の仕事']];
let scrollDistance=0,scrollBase=0;
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
// Each row is one pixel high. Silhouette and face are authored together,
// rather than assembled from independently sized rectangles.
function sprite(s,frame=0,direction='front'){
 const a=appearance(s),out=[],side=direction==='side',back=direction==='back';
 const pal={o:'#38494b',h:a.hair,H:a.age>=67?'#f1ecda':'#766051',s:'#edc09b',l:'#f6d1ad',d:'#cc997d',
 c:a.coat,t:a.accent,p:'#4b6268',q:'#6c8080',b:'#3f4546',w:'#f0e8cf'};
 if(s.npc){pal.c=['#916f8e','#6a9190','#b48865','#64809b','#8a966e','#b58b62','#78a087','#b77f73'][s.arc];}
 const front=[
 '.....hhhhhh.....',
 '...hhhhHHhhhh...',
 '...hhhhhhhhhh...',
 '..hhhhhhhhhhhh..',
 '..hhllllllllhh..',
 '..hhlsllllslhh..',
 '...slllllllld...',
 '...slllllllls...',
 '....slllllls....',
 '.....ssssss.....',
 '......dddd......',
 '....ccwttwcc....',
 '...ccccwwcccc...',
 '...cccccccccc...',
 '...ccctcctccc...',
 '...sccccccccs...',
 '...sccccccccs...',
 '....cccccccc....',
 '.....pppppp.....',
 '.....pp..pq.....',
 '.....pp..pq.....',
 '.....pp..pq.....',
 '....bbb..bbb....',
 '................'];
 const profile=[
 '.....hhhhhh.....',
 '....hhHHhhhh....',
 '...hhhhhhhhhh...',
 '...hhhhhhhhhh...',
 '...hhhhllllll...',
 '...hhhhllllsl...',
 '...hhhllllllss..',
 '...hhhlllllll...',
 '....hhllllll....',
 '......sssss.....',
 '......ddd.......',
 '.....cccccc.....',
 '....cccccccc....',
 '....cccccccc....',
 '....cccccccc....',
 '....ccctcccc....',
 '.....cctccc.....',
 '.....ccsccc.....',
 '.....pppppp.....',
 '.....pp..pq.....',
 '.....pp..pq.....',
 '.....pp..pq.....',
 '.....bbb.bbb....',
 '................'];
 const rows=(side?profile:front).map(row=>row.split(''));
 if(!side&&!back){rows[5][5]='o';rows[5][10]='o';}
 if(side)rows[5][11]='o';
 if(back){for(let y=4;y<10;y++)for(let x=3;x<13;x++)if(rows[y][x]!=='.')rows[y][x]='h';for(let y=11;y<18;y++)for(let x=5;x<11;x++)rows[y][x]=y===11?'t':'c';}
 // A two-pose stride moves the shoes and hands, with a one-pixel body bob.
 const step=[0,1,0,-1][frame%4],top=a.child?4:a.teen?1:0,bob=frame%2;
 const r=(x,y,w,h,c)=>out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
 for(let y=0;y<rows.length;y++){
  if(a.child&&y>=19&&y<=21&&y!==20)continue;
  let yy=y+(a.child&&y>=19?(y>=21?-2:-1):0)+top;
  for(let x=0;x<16;x++){const c=rows[y][x];if(c==='.')continue;let xx=x+6;
   if(y>=19)xx+=x<8?step:-step;else yy=y+(a.child&&y>20?-2:0)+top+bob;
   r(xx,yy,1,1,pal[c]);
  }
 }
 const ty=top+bob,k=a.arc;
 if(a.child||a.teen||a.student){if(side||back){r(9,ty+12,4,7,'#82634c');r(9,ty+13,3,4,'#b88f5c');}else{r(10,ty+12,1,5,'#bda573');r(17,ty+12,1,5,'#bda573');}}
 if(k!==null&&!a.child&&!a.teen&&!a.student&&!s.retired&&!s.npc){
  if(k===1){r(10,ty-2,8,4,'#f6efdc');r(9,ty,10,2,'#f6efdc');r(10,ty+2,9,1,'#d4c9ab');}
  if(k===3){r(10,ty,9,2,'#e9e8d7');r(10,ty+2,10,1,'#3c5e75');}
  if(k===6){r(11,ty-1,7,3,'#b8a06b');r(8,ty+2,13,1,'#d2b77c');}
  if(!back){
   if(k===1||k===7){r(12,ty+13,5,5,'#eee3c7');r(13,ty+15,3,1,'#c5b594');}
   if(k===0){r(9,ty+5,1,3,'#344349');r(10,ty+8,3,1,'#344349');}
   if(k===2){r(18,ty+15,3,4,'#986455');r(19,ty+15,1,3,'#eddfbd');}
   if(k===4){r(12,ty+12,1,3,'#c6b58e');r(12,ty+15,5,3,'#3b4d51');r(14,ty+16,2,1,'#99bab6');}
   if(k===5){r(11,ty+12,1,5,'#b0c6b7');r(17,ty+12,1,5,'#b0c6b7');r(11,ty+17,7,1,'#746652');}
   if(k===6){r(11,ty+13,2,2,'#c9c6a4');r(16,ty+13,2,2,'#c9c6a4');}
  }
 }
 if(s.npc&&k%2===0){r(9,ty+6,1,6,pal.h);r(18,ty+6,1,6,pal.h);}
 if(a.age>=56&&!side&&!back){r(10,ty+4,4,3,'#7f7b6b');r(15,ty+4,4,3,'#7f7b6b');r(11,ty+5,2,1,pal.l);r(16,ty+5,2,1,pal.l);r(14,ty+5,1,1,'#7f7b6b');}
 if(a.cane){r(19,ty+16,3,1,'#8b7651');r(21,ty+17,1,7,'#8b7651');}
 return out.join('');
}
function draw(frame,x,y){
 if(!state)return;
 const direction=mode==='walk'||departure?'side':'front';
 const key=[state.age,state.arc,state.college,state.retired,state.health<50,frame,direction].join('/');
 if(key!==lastKey){body.innerHTML=sprite(state,frame,direction);lastKey=key;}
 const scale=2,flip=1;
 body.setAttribute('transform',`translate(${-14*scale*flip} ${-(state.age<12?25:state.age<18?24:23)*scale}) scale(${scale*flip} ${scale})`);
 pawn.setAttribute('transform',`translate(${Math.round(x/2)*2} ${y})`);
}
function updateCaption(){const a=appearance(state);$('avatarCaption').textContent=`あなた · ${state.age}歳 · ${a.role}`;$('walkerScene').setAttribute('aria-label',`${state.age}歳の主人公、${a.role}。${mode==='walk'||mode==='depart'?'道を歩いています。':'道の上に立っています。'}`);$('walkerScene').dataset.age=state.age;$('walkerScene').dataset.role=a.role;}
function moveWorld(distance){scrollDistance=distance;$('pixelLandscape').setAttribute('transform',`translate(${-Math.floor((distance%600)/2)*2} 0)`);}
function tick(now){
 frameId=0;if(!state)return;
 const elapsed=now-started,walking=mode==='walk'||mode==='depart';
 const frame=walking&&!reduced.matches?Math.floor(now/(state.age>=67?200:130))%4:0;
 if(departure){
  const t=reduced.matches?1:Math.min(1,elapsed/departure.duration),e=t*t*(3-2*t);
  moveWorld(scrollBase+60*e);draw(frame,300,218);
  if(t===1){const done=departure.resolve;departure=null;mode='idle';done();return;}
 }else{if(mode==='walk')moveWorld(scrollBase+Math.min(elapsed,duration)*.016);draw(frame,300,218);}
 if(walking&&!reduced.matches)frameId=requestAnimationFrame(tick);
}
function cancel(){if(frameId)cancelAnimationFrame(frameId);frameId=0;if(departure){const done=departure.resolve;departure=null;done();}}
function show(s,nextMode='idle',ms=6000){cancel();state={...s};mode=nextMode;pausedAt=null;duration=ms;scrollBase=scrollDistance;started=performance.now();updateCaption();tick(started);}
function depart(bit,fast=false){cancel();pausedAt=null;mode='depart';scrollBase=scrollDistance;started=performance.now();updateCaption();return new Promise(resolve=>{departure={bit,resolve,duration:fast?450:1050};tick(started);});}
function pause(){if(pausedAt===null)pausedAt=performance.now();if(frameId)cancelAnimationFrame(frameId);frameId=0;}
function resume(){if(pausedAt!==null){started+=performance.now()-pausedAt;pausedAt=null;}if(!frameId&&(mode==='walk'||mode==='depart'))frameId=requestAnimationFrame(tick);}
reduced.addEventListener('change',()=>{if(state){pause();tick(performance.now());}});
window.LIFE_AVATAR={show,depart,cancel,pause,resume,appearance,sprite};
})();
