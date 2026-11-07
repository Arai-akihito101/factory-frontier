/* 1/2¹⁰ Life Simulator 2.0 — state, autoplay, persistence, road rendering */
(function(){
"use strict";
const C=window.LIFE_CONTENT;if(!C){document.body.textContent="ゲームのデータを読み込めませんでした。ページを再読み込みしてください。";return;}
const $=id=>document.getElementById(id);
const key="one-of-1024-cinematic-v2";
const defaultSaved=()=>({current:"",found:{},last:null,best:null,plays:0,visited:{}});
let saved=defaultSaved();
try{const v=JSON.parse(localStorage.getItem(key)||"null");if(v&&typeof v==="object")saved=Object.assign(defaultSaved(),v);}catch(_){}
let path=typeof saved.current==="string"&&/^[01]{0,10}$/.test(saved.current)?saved.current:"";
let phase="travel",pending=null,beatIndex=0,timer=null,fast=false,fromChoice=null;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const int=x=>Math.round(x).toLocaleString("ja-JP");
const bound=(n,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(n)));
function store(){
 saved.current=path;
 try{localStorage.setItem(key,JSON.stringify(saved));}catch(_){}
}
function start(){
 return {age:5,place:"港町",home:"親と暮らす",job:"小学校入学前",income:0,savings:0,debt:0,bond:57,joy:60,health:91,
    knowledge:26,freedom:30,style:"",movedEarly:false,college:false,partner:false,children:0,retired:false,
    ambitious:false,settled:false,pace:"",care:"",finalWay:"",path:"",story:[],choices:[],happenings:[]};
}
function tidy(s){
 for(const k of ["bond","joy","health","knowledge","freedom"])s[k]=bound(s[k]);
 for(const k of ["savings","debt","income"])s[k]=Math.round(s[k]);
 if(s.debt<0){s.savings+=-s.debt;s.debt=0;}
 if(s.savings<0){s.debt+=-s.savings;s.savings=0;}
}
function alter(s,delta,fields){
 for(const [key,v] of Object.entries(delta||{})){if(typeof s[key]==="number")s[key]+=v;}
 Object.assign(s,fields||{});
 tidy(s);
}
function earnBetween(s,age){
 const years=Math.max(0,age-s.age);
 if(!years)return;
 if(s.age>=18){
   let cost=s.place==="大都市"?300:s.place==="地方都市"?235:s.place==="郊外"?210:192;
   if(s.college&&s.age<24)cost=165;
   if(s.partner)cost+=42;
   if(s.children)cost+=48*s.children;
   if(s.age>=67)cost=Math.round(cost*.8);
   const earned=Math.round(((s.income*.77)-cost)*years*.62);
   const interest=Math.round(s.debt*.018*years);
   s.savings+=earned-interest;
   // Well-being is not a score that always rises. Financial strain, ageing and
   // fraying relationships can erode it during the years between choices.
   s.joy-=Math.round(years*(s.debt>700?.85:s.debt>250?.56:.34));
   s.bond-=Math.round(years*(s.place==="大都市"?.35:.2));
   if(s.income>0 && s.income<cost*.9)s.joy-=Math.round(years*.5);
   if(s.age>=65)s.health-=Math.round(years*.38);else if(s.age>=46)s.health-=Math.round(years*.20);
 }
 s.age=age;tidy(s);
}
function appendBeat(s,b,stage){
 earnBetween(s,b.age);
 alter(s,b.effects,b.fields);
 const record={age:s.age,title:b.title,text:b.text,type:"beat",place:s.place,job:s.job,savings:s.savings,bond:s.bond,joy:s.joy};
 s.story.push(record);s.happenings.push(record);
}
function appendChoice(s,node,bit,stage){
 const o=node.options[bit];
 alter(s,o.effects,o.fields);
 s.path+=String(bit);
 const record={age:s.age,title:o.title,text:o.consequence,type:"choice",bit,place:s.place,job:s.job,savings:s.savings,bond:s.bond,joy:s.joy,level:stage};
 s.choices.push(record);s.story.push(record);
 return record;
}
function simulate(prefix){
 let s=start();
 for(let stage=0;stage<prefix.length;stage++){
   const beats=C.makeBeats(s,stage,prefix.slice(0,stage));
   beats.forEach(b=>appendBeat(s,b,stage));
   const node=C.makeDecision(s,stage,prefix.slice(0,stage));
   appendChoice(s,node,Number(prefix[stage]),stage);
 }
 return s;
}
function upcoming(prefix){
 const base=simulate(prefix),s=JSON.parse(JSON.stringify(base)),stage=prefix.length;
 const beats=C.makeBeats(s,stage,prefix),snapshots=[];
 for(const b of beats){appendBeat(s,b,stage);snapshots.push(JSON.parse(JSON.stringify(s)));}
 const node=stage<10?C.makeDecision(s,stage,prefix):null;
 return {base,beats,snapshots,ready:s,node,stage};
}
function summarize(s){
 const family=s.children?"子どもが"+s.children+"人いる暮らし":s.partner?"誰かと生活を分け合った人生":"自分の時間を大切にした人生";
 const money=s.savings-s.debt;
 const place=C.textPlace(s);
 const moneyLine=money>1500?"経済的には余裕のある年もあった。":money<-250?"お金の心配が大きかった時期もあった。":"多くの年は、日々の生活をやりくりしてきた。";
 const bond=s.bond>=70?"人とのつながりに恵まれた。":s.bond<35?"一人で過ごす時間が長かった。":"一人の時間も、人と過ごす時間もあった。";
 const job=s.college?"学び続ける道を経て、働き始めた。":"若いうちから働き始め、自分で生活を築いた。";
 const feeling=s.joy>=72?"振り返ると、充実した日々が多かった。":s.joy>=44?"楽しい日も、苦しい日もあった。":"思い通りにいかない時期も、長く続いた。";
 let title=s.joy>75&&s.bond>65?"暮らしを大切にできた人生":money>1000&&s.joy<55?"豊かさと引き換えに走った人生":s.freedom>67?"自分の道を歩いた人生":s.bond>70?"たくさんの人と生きた人生":s.college?"学びから広がった人生":"選び続けた人生";
 return {title,text:job+" "+family+"。"+place+"で長い時間を過ごした。"+moneyLine+bond+feeling,net:money,place,home:s.home,career:s.job,bond:s.bond,joy:s.joy,age:s.age,children:s.children,partner:s.partner,savings:s.savings,debt:s.debt};
}
function renderStats(s){
 $("age").textContent=s.age;
 $("sideAge").textContent=s.age+"歳";
 $("place").textContent=C.textPlace(s);
 $("sidePlace").textContent=C.textPlace(s);
 $("sideHome").textContent=s.home;
 $("sideJob").textContent=s.job;
 $("sideIncome").textContent=s.age<18?"—":int(Math.max(0,s.income))+"万円";
 $("saveValue").textContent=int(s.savings)+"万円"+(s.debt?"（借入 "+int(s.debt)+"万円）":"");
 $("bondValue").textContent=bound(s.bond);
 $("joyValue").textContent=bound(s.joy);
 $("saveBar").style.width=bound(s.savings/35)+"%";
 $("bondBar").style.width=bound(s.bond)+"%";
 $("joyBar").style.width=bound(s.joy)+"%";
 const hh=s.partner?(s.children?"一緒に暮らす家族と子どもがいる。":"誰かと日々を分け合っている。"):"自分の生活を自分のペースで営んでいる。";
 const line=s.age<18?"まだ社会に出る前。これから何が起きるかは分からない。":
  s.age<31?"少しずつ自分で稼ぎ、生活を作っている。":
  s.age<60?hh:s.retired?"仕事から離れ、日々の過ごし方が変わってきた。":hh;
 $("lifeSnapshot").textContent=line;
 const world=s.place==="大都市"?"city":s.place==="港町"?"coast":s.place==="地方都市"?"town":"rural";
 $("stage").dataset.world=world;
 const taken=path.slice(-1);
 $("routeLeft").classList.toggle("chosen",taken==="0");
 $("routeRight").classList.toggle("chosen",taken==="1");
}
function renderJournal(s){
 const opened=Object.keys(saved.found||{}).length;
 $("found").textContent=opened+" / 1,024";
 $("count").textContent=path.length===10?"10 / 10":String(path.length+1).padStart(2,"0")+" / 10";
 const journey=s.choices.slice(-8);
 const route=path.split("");
 let thread="";
 for(let i=0;i<10;i++){
  const age=C.ages[i];
  const active=i===path.length;
  const done=i<path.length;
  thread+='<button class="thread-node '+(done?"done ":"")+(active?"active":"")+'"'+(done?' data-rewind="'+path.slice(0,i)+'"':' disabled')+' title="'+age+'歳の分岐へ戻る"><b>'+(i+1)+'</b><small>'+age+'歳</small></button>';
 }
 $("thread").innerHTML=thread;
 $("chapters").innerHTML=journey.length?journey.map((h,i)=>'<div class="chapter"><span class="chapter-age">'+h.age+'歳</span><div><strong>'+esc(h.title)+'</strong><p>'+esc(h.text)+'</p></div></div>').reverse().join(""):'<p class="empty">まだ最初の分岐を選んでいません。</p>';
 const last=s.choices[s.choices.length-1];
 $("roadFooter").textContent=s.age+"歳。"+(last?"あのとき選んだ「"+last.title+"」の先を歩いている。":"人生はまだ、どこへでも続いている。");
}
function renderBeat(index){
 const b=pending.beats[index],s=pending.snapshots[index];
 if(!b||!s)return;
 renderStats(s);renderJournal(s);
 $("travelKicker").textContent=b.age+"歳 — 人生の途中で";
 $("travelTitle").textContent=b.title;
 $("travelBody").textContent=b.text;
 $("latest").textContent=b.age+"歳。"+b.text;
 $("phaseLabel").textContent="時間が流れていく";
 $("stage").classList.add("moving");
 $("stage").classList.remove("forking");
 $("fork").classList.add("hidden");$("ending").classList.add("hidden");$("travel").classList.remove("hidden");
 phase="travel";
}
function renderFork(){
 if(!pending||pending.stage>=10){finish();return;}
 const s=pending.ready,node=pending.node;
 renderStats(s);renderJournal(s);
 $("stage").classList.remove("moving");$("stage").classList.add("forking");
 $("fork").classList.remove("hidden");$("travel").classList.add("hidden");$("ending").classList.add("hidden");
 $("phaseLabel").textContent="人生の分かれ道";
 $("forkHead").textContent=s.age+"歳 — "+node.title;
 $("forkQuestion").textContent=node.story;
 for(let i=0;i<2;i++){$("choiceTitle"+i).textContent=node.options[i].title;$("choiceSub"+i).textContent=node.options[i].desc;}
 $("latest").textContent=s.age+"歳。"+node.story;
 phase="choice";
}
function compareHtml(a,b){
 if(!a||!b)return "二つの人生を終えると、違いを比べられます。";
 const diff=a.net-b.net, connection=a.bond-b.bond;
 const sign=n=>n>0?"＋"+int(n):int(n);
 return '<div class="compare-names"><div><small>この人生</small><strong>'+esc(a.title)+'</strong></div><div><small>前の人生</small><strong>'+esc(b.title)+'</strong></div></div>'+
  '<div class="compare-values"><div><span>住んだ場所</span><b>'+esc(a.place)+' / '+esc(b.place)+'</b></div><div><span>家族の形</span><b>'+(a.partner?"同居":"一人暮らし")+' / '+(b.partner?"同居":"一人暮らし")+'</b></div><div><span>正味の貯え</span><b>'+sign(diff)+'万円</b></div><div><span>つながりの差</span><b>'+sign(connection)+'</b></div></div>';
}
function finish(){
 phase="ending";if(timer){clearTimeout(timer);timer=null;}
 const finalState=pending.ready,ending=summarize(finalState);
 const previous=saved.last&&saved.last!==path?saved.found[saved.last]:null;
 saved.found[path]=ending;
 saved.last=path;
 saved.plays=(saved.plays||0)+1;
 saved.best=previous||saved.best||null;
 store();
 renderStats(finalState);renderJournal(finalState);
 $("stage").classList.remove("moving","forking");
 $("travel").classList.add("hidden");$("fork").classList.add("hidden");$("ending").classList.remove("hidden");
 $("phaseLabel").textContent="この人生の終点";
 $("endingTitle").textContent=ending.title;
 $("endingText").textContent=finalState.age+"歳。"+ending.text;
 $("latest").textContent="10回の選択から、一つの人生ができました。別の道を試すこともできます。";
 $("compare").innerHTML=compareHtml(ending,previous||saved.best);
 $("compareBtn").classList.toggle("hidden",!(previous||saved.best));
}
function schedule(){
 if(timer)clearTimeout(timer);
 timer=setTimeout(()=>{
  timer=null;
  if(phase!=="travel")return;
  beatIndex++;
  if(beatIndex<pending.beats.length){renderBeat(beatIndex);schedule();}
  else if(path.length===10)finish();else renderFork();
 },fast?350:1100);
}
function travelToNext(){
 if(timer){clearTimeout(timer);timer=null;}
 pending=upcoming(path);
 beatIndex=0;
 if(!pending.beats.length){path.length===10?finish():renderFork();return;}
 renderBeat(0);schedule();
}
function select(bit){
 if(phase!=="choice"||path.length>=10)return;
 const s=pending.ready,node=pending.node,option=node.options[bit];
 path+=String(bit);
 saved.visited[path]=true;store();
 fromChoice=option;
 $("latest").textContent=s.age+"歳に「"+option.title+"」を選んだ。"+option.consequence;
 travelToNext();
}
function restart(prefix=""){
 if(timer){clearTimeout(timer);timer=null;}
 if(!/^[01]{0,9}$/.test(prefix))prefix="";
 path=prefix;store();travelToNext();
}
function rewind(prefix){
 if(!/^[01]{0,9}$/.test(prefix))return;
 restart(prefix);
}
$("choice0").addEventListener("click",()=>select(0));
$("choice1").addEventListener("click",()=>select(1));
$("skip").addEventListener("click",()=>{if(phase!=="travel")return;if(timer)clearTimeout(timer);timer=null;beatIndex=pending.beats.length;if(path.length===10)finish();else renderFork();});
$("speed").addEventListener("click",()=>{
 fast=!fast;$("speedLabel").textContent=fast?"早送り中":"通常の速度";$("speedSymbol").textContent=fast?"»":"◷";
 if(timer&&phase==="travel")schedule();
});
$("restart").addEventListener("click",()=>restart(""));
$("retry").addEventListener("click",()=>restart(""));
$("compareBtn").addEventListener("click",()=>{$("compare").scrollIntoView({behavior:"smooth",block:"center"});});
$("helpBtn").addEventListener("click",()=>$("helpDialog").showModal());
$("closeHelp").addEventListener("click",()=>$("helpDialog").close());
$("thread").addEventListener("click",e=>{const target=e.target.closest("[data-rewind]");if(target)rewind(target.getAttribute("data-rewind"));});
document.addEventListener("keydown",e=>{
 if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.metaKey||e.ctrlKey||e.altKey||$("helpDialog").open)return;
 if(phase==="choice"&&(e.key==="1"||e.key.toLowerCase()==="a"))select(0);
 else if(phase==="choice"&&(e.key==="2"||e.key.toLowerCase()==="b"))select(1);
 else if(phase==="travel"&&e.key===" "){e.preventDefault();$("skip").click();}
});
travelToNext();
window.LIFE_TEST={simulate,upcoming,summarize,start,ages:C.ages,getStatus:()=>({path,phase,beatIndex})};
})();