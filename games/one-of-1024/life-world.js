/* Small, deterministic pixel landscape; no remote artwork or downloads. */
(function(){
const $=id=>document.getElementById(id);
function rect(x,y,w,h,c){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;}
function tree(x,y,color,small=false){
 const k=small?.75:1;
 return `<g transform="translate(${x} ${y}) scale(${k})">${rect(-2,55,42,4,'#9dad88')}${rect(15,32,6,26,'#765f48')}${rect(17,38,2,18,'#a0845b')}${rect(8,8,20,38,'#4f705c')}${rect(2,18,32,22,'#4f705c')}${rect(0,24,36,10,'#4f705c')}${rect(8,6,18,6,color)}${rect(4,14,28,18,color)}${rect(8,32,22,8,color)}${rect(10,10,12,4,'#a9bd84')}${rect(6,18,8,4,'#a9bd84')}${rect(24,26,6,6,'#688863')}${rect(10,38,6,4,'#688863')}</g>`;
}
function building(arc){
 const colors=['#bd9383','#d6b480','#b2bda6','#94b2b2','#b3b0a4','#9cafa9','#a7b69b','#c7a78b'],c=colors[arc??7];
 if(arc===3)return `<g transform="translate(420 85)">${rect(0,20,90,10,'#b9d7ca')}${rect(10,13,76,17,'#e7e2c5')}${rect(25,0,35,18,'#f3ecd5')}${rect(29,4,10,8,'#7fa2a0')}${rect(43,4,10,8,'#7fa2a0')}${rect(17,30,61,6,'#687e70')}${rect(5,36,83,3,'#93b6ad')}</g>`;
 return `<g transform="translate(430 72)">${rect(4,19,72,53,c)}${rect(0,15,80,7,'#8c826c')}${rect(8,8,64,7,'#9c9078')}${rect(16,1,48,7,'#a4977b')}${rect(12,32,17,17,'#dce6ce')}${rect(49,32,17,17,'#dce6ce')}${rect(15,35,11,10,'#86a4a0')}${rect(52,35,11,10,'#86a4a0')}${rect(33,42,13,30,'#786e55')}${rect(36,45,7,13,'#d8d8b6')}${rect(2,72,76,5,'#aaa78b')}${arc===1||arc===7?rect(7,25,66,6,'#a36650')+rect(11,25,7,6,'#f2dec1')+rect(27,25,7,6,'#f2dec1')+rect(43,25,7,6,'#f2dec1')+rect(59,25,7,6,'#f2dec1'):''}${arc===6?rect(-18,43,9,27,'#cbd4b5')+rect(-16,37,5,7,'#739080'):''}</g>`;
}
let key='';
function render(s){
 const season=Math.floor(s.age/7)%4,world=s.place==='大都市'?'city':s.place==='港町'?'coast':'town';
 const next=[s.arc,season,world].join('/');if(next===key)return;key=next;
 const greens=['#83a27c','#709779','#b3986b','#94aca0'],grass=['#c0d0a1','#b2c99d','#d8c69c','#ced8c2'],sky=['#cee1d6','#c1dcd8','#dfd9bb','#d7e4df'];
 $('walkerScene').dataset.season=season;$('walkerScene').dataset.world=world;
 const ground=$('pixelLandscape');if(!ground)return;
 let art=rect(0,0,600,260,sky[season])+rect(0,107,600,153,grass[season]);
 art+=`<g class="pixel-clouds" fill="#f6f0db"><path d="M53 33h20v-8h33v8h18v11H53z M321 20h16v-8h28v8h20v10h-64z"/></g>`;
 art+=rect(530,20,29,29,'#f3e2aa')+rect(523,28,43,13,'#f3e2aa');
 art+=`<path d="M0 105V87h45V72h37v17h40v16h67V81h35V67h44v21h43v17h53V86h45V70h43v24h50v11h58V82h40v23z" fill="#acbfa0"/>`;
 if(world==='coast')art+=rect(0,124,99,136,'#9bbfbc')+rect(0,145,85,4,'#c5d8cb')+rect(0,179,68,3,'#c5d8cb')+rect(0,224,91,4,'#c5d8cb');
 art+=building(s.arc);
 art+=tree(55,63,greens[season])+tree(106,59,greens[season],true)+tree(528,137,greens[season]);
 if(world==='city')art+=rect(192,65,32,42,'#aab5a5')+rect(231,52,29,55,'#b9b9a4')+rect(197,72,8,8,'#dce2ce')+rect(238,61,7,8,'#e8e3c9');
 for(let i=0;i<22;i++){const x=(i*71+19)%580,y=160+(i*29)%94;if(x>228&&x<370)continue;art+=rect(x,y,3,6,'#8eaa7c')+rect(x-2,y+2,7,2,'#8eaa7c');if(i%3===0)art+=rect(x,y-2,3,3,season===2?'#c47f60':'#e9d8a0');}
 ground.innerHTML=art;
 $('seasonLabel').textContent=['春の気配','夏の光','秋の風','冬の空'][season];
}
window.LIFE_WORLD={render};
})();
