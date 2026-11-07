/* Side-on town scene. All scenery sits behind a separate, level footpath.
   Logical pixels: 300 x 130, rendered on a common 2px grid. */
(function(){
const $=id=>document.getElementById(id);
const R=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const P=(d,c)=>`<path d="${d}" fill="${c}"/>`;
function tree(x,y,season){
 const leaf=['#5b855c','#497657','#a97649','#6e8c7d'][season],lit=['#88aa65','#729752','#c69755','#a1b6a0'][season];
 return `<g transform="translate(${x} ${y})">`+R(16,23,4,24,'#685343')+R(17,26,1,19,'#a28457')+P('M7 6h6V2h12v4h6v6h4v17h-5v7H8v-5H3V14h4z','#3f6650')+P('M8 7h7V4h9v4h6v8h3v9h-7v6H9v-7H5v-9h3z',leaf)+R(11,9,9,3,lit)+R(7,15,5,5,lit)+R(22,23,7,4,'#466c4f')+R(7,46,28,2,'#829375')+'</g>';
}
function windowArt(x,y){return R(x-1,y-1,12,17,'#b3a581')+R(x,y,10,14,'#50747b')+R(x+1,y+1,8,5,'#8db7b4')+R(x+4,y,1,14,'#e9dfc4')+R(x,y+7,10,1,'#e9dfc4')+R(x-2,y+14,14,2,'#f3e6c7');}
function house(x,arc){
 const wall=['#d2b39b','#e5c391','#ddd5b6','#a4b9ba','#c8b7a1','#b6c2b6','#bec6a4','#d6b79a'][arc??7];
 let h=`<g transform="translate(${x} 36)">`;
 h+=R(3,48,67,7,'#93a080')+R(6,12,60,40,wall)+R(6,12,4,40,'#b29c80')+R(59,12,7,40,'#a99780');
 h+=P('M0 13V9h6V5h6V1h48v4h6v4h6v6H0z','#5f6962')+P('M7 8h6V4h46v4h6v3H7z','#849184')+R(0,14,72,2,'#485851');
 h+=R(52,-3,6,9,'#998b77')+R(51,-4,8,2,'#b9a789');
 h+=windowArt(14,24)+windowArt(48,24)+R(30,25,12,27,'#675b4e')+R(32,27,8,12,'#8ba6a0')+R(33,28,6,4,'#c6d8c5')+R(39,42,1,2,'#e8ce8a')+R(28,52,16,2,'#a9a38a');
 if(arc===1||arc===7){h+=R(8,17,56,5,'#a16550');for(let i=0;i<7;i++)h+=R(9+i*8,17,4,5,'#f0dfb9');}
 else {h+=R(28,18,16,4,'#ede1bc')+R(31,19,10,1,'#8a886c');}
 h+=R(10,44,12,6,'#a77857')+R(12,41,3,4,'#5a7d51')+R(17,40,3,5,'#6e8d57')+R(13,40,2,2,'#e0b274');
 return h+'</g>';
}
let key='';
function render(s){
 const season=Math.floor(s.age/7)%4,world=s.place==='大都市'?'city':s.place==='港町'?'coast':'town',next=[s.arc,season,world].join('/');if(key===next)return;key=next;
 $('walkerScene').dataset.season=season;$('walkerScene').dataset.world=world;
 const sky=['#d5e5df','#c5e0df','#e7ddc3','#dae4e3'][season],grass=['#a8bc8c','#9db584','#c4b386','#b5c5b4'][season];
 let h=R(0,0,300,130,sky)+R(239,12,13,13,'#f6e5b3');
 h+='<g class="pixel-clouds">'+P('M19 18h8v-4h17v4h9v5H19z M157 12h7V8h16v4h10v5h-33z','#f8f4e5')+'</g>';
 h+=P('M0 60V48h15v-7h21v7h13v7h23V43h20v-8h26v8h17v12h18V44h26v7h19v-8h26v8h24V41h20v7h17v12z','#adc6b6');
 if(world==='city'){for(let i=0;i<5;i++){let x=90+i*20,y=32+(i%3)*7;h+=R(x,y,16,36,'#a2b8b2');for(let j=0;j<3;j++)h+=R(x+3,y+5+j*8,3,4,'#d6e1ce')+R(x+10,y+5+j*8,3,4,'#d6e1ce');}}
 h+=R(0,66,300,28,grass);
 if(world==='coast')h+=R(0,62,88,21,'#80aaa9')+R(5,68,22,1,'#c7dbcb')+R(36,75,35,1,'#c7dbcb');
 h+=house(207,s.arc)+house(-26,null)+tree(69,39,season);
 // A park bench and fence stand on the grass, never in the walking lane.
 h+=R(124,75,26,3,'#9c7857')+R(124,80,26,3,'#b38d62')+R(123,85,28,3,'#927253')+R(126,88,2,5,'#59695a')+R(147,88,2,5,'#59695a');
 for(let x=164;x<198;x+=8)h+=R(x,78,2,15,'#eee1be');h+=R(164,81,34,2,'#e8d9b5')+R(164,87,34,2,'#e8d9b5');
 h+=R(0,94,300,3,'#829274')+R(0,97,300,4,'#e5d9bc')+R(0,101,300,1,'#b0a88f')+R(0,102,300,17,'#d5c6a4')+R(0,119,300,2,'#a89f83')+R(0,121,300,9,grass);
 for(let x=0;x<300;x+=24)h+=R(x,98,1,3,'#bbb298');
 for(let i=0;i<20;i++){const x=(i*43+7)%300;h+=R(x,124+(i%3),3,1,'#83996c');if(i%4===0)h+=R(x,123,1,2,'#e9d6a0');}
 h+=R(181,53,2,40,'#5b6c60')+R(177,51,10,2,'#5b6c60')+R(178,44,8,7,'#5b6c60')+R(180,45,4,5,'#f4dfaa')+R(180,42,4,2,'#5b6c60');
 $('pixelLandscape').innerHTML='<g transform="scale(2)">'+h+'</g>';
 $('seasonLabel').textContent=['春の気配','夏の光','秋の風','冬の空'][season];
}
window.LIFE_WORLD={render};
})();
