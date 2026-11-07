/* 1/2^10 — deterministic state-based branching engine, no server */
(function(){
"use strict";
const D=window.LIFE_DATA, $=id=>document.getElementById(id);
const STORAGE="one-of-1024-v11", totalEdges=2046;
let store={edges:{},endings:{},previous:null,current:"",totalChoices:0};
try{const raw=localStorage.getItem(STORAGE);if(raw){const v=JSON.parse(raw);if(v&&typeof v==="object")store=Object.assign(store,v);}}catch(_){}
let path=/^[01]{0,10}$/.test(store.current||"")?store.current:"";
let priorPath=null, toast="";
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const fmt=n=>(n<0?"−":"")+Math.abs(Math.round(n)).toLocaleString("ja-JP");
const signed=n=>(n>0?"+":"")+Math.round(n).toLocaleString("ja-JP");
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function save(){try{store.current=path;localStorage.setItem(STORAGE,JSON.stringify(store));}catch(_){}}
function initial(){return {age:9,wealth:0,debt:0,skill:13,bond:48,health:92,freedom:46,pressure:6,reputation:10,
  job:"小学生",city:"潮見町",mentor:"小学校の担任",income:0,world:"子ども時代",project:"まだ決まっていない未来",track:"",
  history:[],milestones:["9歳。潮見町の小学校に通っている。"]};}
function capStats(s){["skill","bond","health","freedom","pressure","reputation"].forEach(k=>s[k]=clamp(Math.round(s[k]),0,100));s.wealth=Math.round(s.wealth);s.debt=Math.max(0,Math.round(s.debt));if(s.wealth<0){s.debt+=-s.wealth;s.wealth=0;}}
function yearsPass(s,step){
 if(step>=9)return;
 const start=D.ages[step],next=D.ages[step+1],yrs=next-start;
 const rate=start<18?0:start>=69?-8:start>=61?(s.income-400)*.10:(s.income-360)*.18;
 const earned=Math.round(rate*yrs);
 const interest=Math.round(s.debt*.012*yrs);
 s.wealth+=earned-interest;
 s.health-=Math.round(yrs*(start>=58?1.5:start>=43?.65:.3));
 s.pressure+=Math.round(yrs*(s.pressure>63?-.1:.2));
 s.age=next;s.lastPassage={earned,interest,years:yrs};
 if(step===2&&s.adultJob){s.job=s.adultJob;s.income=s.adultIncome;s.city=s.adultCity;s.milestones.push(next+"歳： "+s.job+"として働き始めた。");}
 capStats(s);
}
function effectText(delta,s){
 const list=[];
 for(const [key,label] of [["wealth","貯金"],["debt","借入"],["skill","技術"],["bond","つながり"],["health","健康"],["freedom","自由度"],["pressure","負担"],["reputation","信頼"]]){
   if(delta[key])list.push(label+" "+signed(delta[key])+(key==="wealth"||key==="debt"?"万円":""));
 }
 return list.slice(0,5).join(" / ");
}
function apply(s,node,i,step,prefix){
 const o=node.options[i],before=Object.assign({},s);
 for(const [key,v] of Object.entries(o.delta||{})){if(typeof s[key]==="number")s[key]+=v;}
 Object.assign(s,o.set||{});
 capStats(s);
 s.history.push({step:step+1,age:D.ages[step],title:node.title,choice:o.label,result:o.result,
   branch:prefix+i,delta:effectText(Object.fromEntries(Object.keys(o.delta||{}).map(k=>[k,(s[k]||0)-(before[k]||0)])),s),
   city:s.city,job:s.job,wealth:s.wealth,debt:s.debt,bond:s.bond,skill:s.skill});
 s.milestones.push(D.ages[step]+"歳： "+o.result);
 if(s.milestones.length>13)s.milestones.shift();
 yearsPass(s,step);
}
function consequences(label,option,st){
 let delta=option===0?{wealth:-75,skill:8,freedom:8,pressure:12,reputation:6}:{wealth:85,bond:8,pressure:-6,freedom:-4};
 let set={}; let clauses=[];
 const add=(mods,words)=>{Object.entries(mods).forEach(([k,n])=>delta[k]=(delta[k]||0)+n);clauses.push(words);};
 if(/投資|出資|借金|資金を出す|自腹|支援金/.test(label))add({wealth:-190,debt:65,freedom:7},"資金を投入し、次の機会をつかんだ一方、手元のお金に余裕がなくなった");
 if(/売却|大型契約|大口注文|拡大|全国展開/.test(label))add({wealth:185,reputation:9,pressure:8},"仕事の規模が大きくなり、責任と収入が一緒に増えた");
 if(/公開|公表|訴訟|立候補|記録を外部/.test(label))add({reputation:18,pressure:17,bond:-3},"立場を公にしたことで賛同者と反対者の両方が生まれた");
 if(/地元|帰国|介護|農家|社員|家族|現場|若手/.test(label))add({bond:20,wealth:-45,freedom:-3},"身近な人との関係を守ったが、別の仕事のチャンスを逃した");
 if(/海外|移籍|国際|新製品|新技術|独立|工場を建て/.test(label))add({skill:13,wealth:-55,freedom:12,pressure:6},"新しい場所で経験を積み、安定と引き換えに選択肢が増えた");
 if(/返済|控え|維持|優先|そのまま|続ける|委託/.test(label))add({wealth:65,pressure:-8,freedom:-5},"大きな損失を避けたが、挑戦しなかった可能性が残った");
 if(/技術|研究|教育|講師|学会|調査|規格/.test(label))add({skill:11,reputation:6},"積み重ねた知識が次の仕事につながった");
 if(/経営|代表|社長|役員|委員|議会/.test(label))add({pressure:12,freedom:6,reputation:7},"周囲に決定を委ねられる立場になった");
 if(/帰国/.test(label))set.city="潮見町";
 if(/講師/.test(label))set.job="技術学校の講師";
 if(/立候補/.test(label))set.job="町議会議員";
 if(/独立|共同事業を始め/.test(label))set.job="独立事業者";
 if(/委員会に参加/.test(label))set.job="国際委員";
 if(/役員として/.test(label))set.job="経営役員";
 if(/地元/.test(label))set.city="潮見町";
 if(!clauses.length)clauses.push(option===0?"思い切った決断が新しい人を呼び込んだが、予想外の負担も増えた":"慎重な判断で生活を守った。反面、失った機会について時折考える");
 const result="『"+label+"』を実行した。"+clauses[0]+"。"+(clauses[1]?"さらに、"+clauses[1]+"。":"");
 return D.O(label,result,delta,set);
}
const late=[
[
["{mentor}から届いた知らせ","{city}で暮らす間に、{mentor}が長期の療養を始めた。{project}の仕事も今が正念場だ。","仕事を減らし、そばで支える","仕事を続け、金銭面から支える"],
["町からの依頼","{city}で培った経験を生かし、故郷の暮らしを変える計画に加わってほしいと言われた。","仕事を離れて故郷に戻る","遠隔で協力し、今の仕事を守る"],
["住まいをどうするか","長年暮らした{city}に家を買う機会が訪れた。一方、{project}には予想外の費用が必要だ。","資金を住宅購入に使う","事業を優先して賃貸を続ける"],
["かつての同僚からの依頼","昔の仲間が危機に陥り、あなたの経験と資金を借りたいと言っている。","自腹で支え、共同で再建する","資金は出さず、助言だけにする"],
["若手が新しい方法を提案","若い人が{project}を一から作り直したいと言う。成果は未知数だ。","若手に主導権を渡す","自分のやり方を守り続ける"],
["突然の経済危機","景気の悪化で{project}の予算が半減した。守るのは仲間の生活か、事業の規模か。","自分の報酬を削って仲間を守る","事業を縮小して財務を立て直す"],
["別の街からの誘い","{job}として積み重ねた経験を評価され、別の土地で新しい職を任せたいと声がかかった。","転居して次の挑戦を選ぶ","{city}で築いた生活を守る"],
["過去の決断が新聞に","{project}に関する過去の判断が取材された。取材を受ければ、これまでの弱点も明らかになる。","失敗も含めて取材に応じる","報道を断り、仕事を優先する"]
],
[
["後継者を決める年","{job}の仕事を継ぎたいと言う二人が現れた。信頼してきた仲間と、実績ある外部の人だ。","古くからの仲間に引き継ぐ","実績のある外部人材に任せる"],
["{mentor}と交わした約束","若い頃に{mentor}と話した約束を、今になって実現できる機会が訪れた。ただし費用は大きい。","貯金を使って約束を果たす","老後の生活を優先して見送る"],
["仕事を休めという診断","身体の負担が蓄積している。医師は、今の働き方を変えるよう勧めた。","仕事を大幅に減らす","仕事の量は維持し、補助者を雇う"],
["新世代の技術が登場","{project}を変える新技術が普及した。取り入れれば費用がかかるが、何もしなければ遅れるかもしれない。","資金を投じて新技術に転換する","今まで築いた技術を磨き続ける"],
["老後資金の再点検","これから必要な生活費を計算すると、思っていたほど余裕はない。投資を続けるか、現金を厚くするか。","貯金を守って支出を減らす","経験を生かした投資に挑む"],
["故郷の災害","潮見町に大きな台風が来た。かつての知人たちが復旧の人手を求めている。","現地に戻って復旧を手伝う","{city}から資金と物資を送る"],
["社内での対立","{job}としての方針をめぐり、次の世代の人々と意見が割れた。","後進の考えに合わせる","経験を信じて自分の案を貫く"],
["新しい研究と出会う","昔から抱いていた疑問に、若い研究者が全く違う答えを示した。","共同研究に参加する","自分の記録を整理して託す"]
],
[
["67歳。仕事から離れる日","{city}での仕事は一区切りついた。まだ働き続ける道もあるが、残された時間の使い方を考えている。","仕事を引退して生活を変える","後進を育てながら仕事を続ける"],
["67歳。知人の孫が相談に来た","{mentor}にゆかりのある若者が、あなたと似た進路のことで悩んでいる。","資金を出し、挑戦を支える","失敗談も含めて教える"],
["67歳。古い記録の整理","{project}の時代に残した資料が大量に見つかった。公開するには費用と時間がかかる。","資料館を作って公開する","必要な人にだけ記録を託す"],
["67歳。住み慣れた町か故郷か","{city}で暮らし続けるか、若い頃を過ごした潮見町に戻るか。","潮見町に帰って新しく暮らす","{city}のつながりを大切にする"],
["67歳。家族からのお願い","大切な人が一緒に過ごす時間を増やしてほしいと言った。{project}の責任はまだ残っている。","責任を引き継ぎ、家庭を優先する","仕事を手放さず、働き方を変える"],
["67歳。思いがけない寄付","支援者がまとまった資金を預けたいと言う。活用方法はあなたに委ねられた。","若者の育成基金を作る","地域の生活支援に使う"],
["67歳。昔の対立相手と再会","{project}をめぐって争った相手から、もう一度話したいと連絡が来た。","会って過去の誤解を解く","手紙だけ送り、距離を置く"],
["67歳。新しい故郷を選ぶ","仕事はひと段落した。生活費を抑えるため、小さな町への移住を勧められた。","小さな町で暮らし直す","長年の街で生活を続ける"]
],
[
["78歳。人生を誰に伝えるか","子どもたちや若い仲間は、{job}として過ごした年月について知りたがっている。","成功も失敗も書き残す","話せる相手に直接伝える"],
["78歳。最後の大きな寄付","貯金の一部を社会に役立てたい。{project}に関連する団体から相談が来た。","後進への奨学金を設立する","身近な人の暮らしを助ける"],
["78歳。二つのアルバム","手元には仕事の記録と、家族・友人の写真がある。展示会の中心をどちらにするか。","仕事の歴史を展示する","人との出会いを中心に展示する"],
["78歳。再び潮見町へ","故郷の小学校があなたの話を聞きたいと言う。旅には体力が必要だ。","故郷に出向いて話をする","手紙と記録を送る"],
["78歳。名前を残すか","{project}に関わる施設へ、あなたの名前を付ける提案が届いた。","提案を受けて名を残す","無名の支援者として関わる"],
["78歳。家族の新しい挑戦","身近な若者が未知の仕事へ踏み出したいと言う。成功の保証はない。","貯金を使って挑戦を後押しする","資金は渡さず経験を伝える"],
["78歳。かつての仲間との再会","長い歳月を経て、昔の仲間とまた同じ食卓を囲む機会が訪れた。","旅に出て仲間と再会する","地元に招いて静かに語り合う"],
["78歳。残すものを選ぶ","長く育てた{project}を次の世代にどう渡すか、最後の大きな判断が求められた。","組織として未来に残す","信頼する一人に託す"]
]
];
function interpolate(txt,s){return txt.replace(/\{(.*?)\}/g,(_,k)=>s[k]||"");}
function sceneFor(prefix,s){
 const depth=prefix.length;
 if(depth<3)return D.early[prefix];
 const t=D.tracks[prefix.slice(0,3)];
 if(depth===3)return t.q4;
 if(depth===4)return t.q5[Number(prefix[3])];
 if(depth===5){
   const a=t.q6[parseInt(prefix.slice(3,5),2)];
   return D.N(a[0],a[1],consequences(a[2],0,s),consequences(a[3],1,s));
 }
 const stage=depth-6,arc=D.late[prefix.slice(0,3)][stage];
 const last=s.history[s.history.length-1],first=s.history[0];
 const memory=(last?" 前回『"+last.choice+"』を決めた。その結果、"+last.result+" ":"")+
 (stage===0&&first?"9歳の日に『"+first.choice+"』と決めたことから続く人生だ。":"");
 const burden=s.debt>400?" 借入は"+s.debt+"万円にのぼり、次の決断も自由ではない。":"";
 return D.N(arc.title,arc.story+memory+burden,arc.options[0],arc.options[1]);
}
function evaluate(prefix){
 const s=initial();let p="";
 for(let i=0;i<prefix.length;i++){const node=sceneFor(p,s);apply(s,node,Number(prefix[i]),i,p);p+=prefix[i];}
 return s;
}
function runStats(){
 const s=evaluate(path);return {s,node:path.length<10?sceneFor(path,s):null};
}
function endingTitle(s){
 const t=D.tracks[s.track]||{name:"変化の人生"};
 const parts=[];
 parts.push(s.freedom>=65?"自分の意志を貫いた":s.bond>=75?"仲間を守った":s.reputation>=65?"信頼を積み重ねた":s.skill>=70?"技術を磨き続けた":"選択を重ねた");
 parts.push(t.name+"の人生");
 return parts.join("・");
}
function recordEnd(s){
 if(path.length!==10)return;
 store.endings[path]={title:endingTitle(s),wealth:s.wealth,debt:s.debt,bond:s.bond,health:s.health,job:s.job,city:s.city,
 history:s.history.map(h=>h.choice)};
 if(store.previous && store.previous!==path)store.comparedTo=store.previous;
 store.previous=path;
 store.plays=(store.plays||0)+1;
 save();
}
function choose(bit){
 if(path.length>=10)return;
 const prefix=path,old=evaluate(path),scene=sceneFor(path,old),option=scene.options[bit];
 path+=String(bit);store.edges[prefix+bit]=true;store.totalChoices=(store.totalChoices||0)+1;
 toast=option.result;
 const after=evaluate(path);
 if(path.length===10)recordEnd(after);
 save();render();
 
}
function replay(prefix){
 if(!/^[01]{0,9}$/.test(prefix))return;
 path=prefix;toast="この分岐点からやり直せます。過去に見つけた人生の記録は残ります。";save();render();
}
function replayStart(){replay("");}
const statDefs=[
 ["wealth","貯金","万円","money"],["debt","借入","万円","debt"],["skill","技術","/ 100","skill"],
 ["bond","つながり","/ 100","bond"],["health","健康","/ 100","health"],["freedom","自由","/ 100","freedom"]
];
function renderStats(s){
 $("statGrid").innerHTML=statDefs.map(([key,label,unit,cls])=>{
   const value=s[key],money=(key==="wealth"||key==="debt");
   const percent=money?clamp((key==="wealth"?value/15:value/10),0,100):value;
   return '<div class="metric '+cls+'"><div class="metric-head"><span>'+label+'</span><b>'+fmt(value)+'<small>'+unit+'</small></b></div>'+
   (money?'':'<div class="meter"><i style="width:'+percent+'%"></i></div>')+'</div>';
 }).join("");
 $("jobVal").textContent=s.job;$("cityVal").textContent=s.city;$("mentorVal").textContent=s.mentor;$("projectVal").textContent=s.project;
 $("ageVal").textContent=s.age+"歳";
}
function renderSteps(){
 const count=path.length;
 $("stepDots").innerHTML=D.ages.map((a,i)=>'<button type="button" class="step-dot '+(i<count?"done ":i===count?"active ":"")+'" '+(i<=count&&i<10?'data-rewind="'+path.slice(0,i)+'" title="'+a+'歳へ戻る"':'disabled')+'><span>'+(i+1)+'</span><small>'+a+'歳</small></button>').join("");
 $("stepProgress").style.width=(count*10)+"%";
 $("turnCount").textContent=(count<10?"第"+(count+1)+"の選択":"完走");
 $("currentRoute").textContent=path.split("").map(c=>c==="0"?"A":"B").join(" · ")||"未選択";
}
function renderHistory(s){
 $("history").innerHTML=s.history.length?s.history.map((h,i)=>
 '<div class="history-item"><div class="history-rail"><span class="history-dot"></span></div>'+
 '<div class="history-body"><div class="history-kicker">'+h.age+'歳 · 選択 '+(i+1)+'</div>'+
 '<div class="history-choice">'+escapeHtml(h.choice)+'</div>'+
 '<p>'+escapeHtml(h.result)+'</p>'+
 '<div class="history-foot">'+escapeHtml(h.job)+' · '+escapeHtml(h.city)+'</div>'+
 '<button class="rewind-inline" data-rewind="'+path.slice(0,i)+'">この分岐の前へ戻る</button></div></div>').join("")
 :'<div class="empty-history">まだ決断はありません。最初の二択から、あなただけの人生を作ってください。</div>';
 const covered=Object.keys(store.endings||{}).length,edges=Object.keys(store.edges||{}).length;
 $("endCount").textContent=covered.toLocaleString()+" / 1,024";
 $("edgeCount").textContent=edges.toLocaleString()+" / "+totalEdges.toLocaleString();
 $("endFill").style.width=(covered/1024*100)+"%";
 $("edgeFill").style.width=(edges/totalEdges*100)+"%";
 $("step6Note").textContent="第6の選択には32の異なる場面と64の選択肢があります。現在の発見数："+Object.keys(store.edges||{}).filter(k=>k.length===6).length+" / 64";
}
function renderScene(s,node){
 const t=D.tracks[s.track]||{name:s.world,color:"#9e7965",symbol:"↗"};
 $("scene").style.setProperty("--theme",t.color);
 $("scene").dataset.zone=path.length<2?"coast":path.length<3?"youth":s.track||"coast";
 $("scene").classList.toggle("is-ending",path.length===10);
 const direction=path.slice(-1);
 $("roadChoiceA").classList.toggle("taken",direction==="0");
 $("roadChoiceB").classList.toggle("taken",direction==="1");
 $("roadJourney").textContent=path.length?path.split("").map((v,i)=>D.ages[i]+"歳 "+(v==="0"?"左":"右")).slice(-4).join("　›　"):"まだ歩いていない道";
 $("sceneSymbol").textContent=t.symbol;
 $("scenePlace").textContent=s.city;
 $("sceneTrack").textContent=t.name;
 $("sceneJob").textContent=s.job;
 $("sceneYears").textContent=s.age+"歳";
 $("sceneLog").textContent=s.history.length?s.history[s.history.length-1].choice:"ここから始まる";
 if(path.length<10){
   $("ending").classList.add("hidden");$("decisions").classList.remove("hidden");$("sceneTitle").textContent=node.title;
   $("sceneStory").textContent=node.story;
   $("decisionNumber").textContent="DECISION "+String(path.length+1).padStart(2,"0")+" / 10";
   ["0","1"].forEach((k,i)=>{
     const opt=node.options[i],card=$("option"+k);
     card.querySelector(".choice-headline").textContent=opt.label;
     card.querySelector(".choice-details").textContent=opt.set && (opt.set.job||opt.set.city) ? "この先の生活： "+[opt.set.job,opt.set.city].filter(Boolean).join(" / ") : "結果は、選んだあとに明らかになります。";
     const effects=Object.entries(opt.delta||{}).filter(([key,v])=>v!==0).slice(0,3).map(([key,v])=>{
       const label={wealth:"貯金",debt:"借入",skill:"技術",bond:"つながり",health:"健康",freedom:"自由",pressure:"負担",reputation:"信頼"}[key]||key;
       return label+" "+signed(v)+(key==="wealth"||key==="debt"?"万円":"");
     });
     card.querySelector(".choice-effects").textContent=effects.join("  /  ");
   });
   $("decisionHint").textContent="道の左側がA、右側がB。選んだ道の先では、仕事も出会いも変わっていきます。";
 }else{
   $("decisions").classList.add("hidden");$("ending").classList.remove("hidden");$("sceneTitle").textContent="あなたが生きた、一つの人生";
   $("sceneStory").textContent="10の決断を経て、あなたの人生はここにたどり着きました。別の選択なら、出会いも仕事も結末も変わっていたかもしれません。";
   $("endingTitle").textContent=endingTitle(s);
   $("endingCode").textContent="LIFE #"+path.replaceAll("0","A").replaceAll("1","B");
   $("endingBody").textContent=s.age+"歳。"+s.city+"で、"+s.job+"として暮らしている。"+s.history.slice(-2).map(h=>h.result).join(" ");
   $("endSnapshot").innerHTML=[
     ["最後の仕事",s.job],["暮らした土地",s.city],["貯金",fmt(s.wealth)+"万円"],
     ["借入",fmt(s.debt)+"万円"],["大切な人",s.mentor],["選んだ道",s.project]
   ].map(x=>'<div><small>'+escapeHtml(x[0])+'</small><strong>'+escapeHtml(x[1])+'</strong></div>').join("");
   const prev=store.comparedTo&&store.comparedTo!==path?store.endings[store.comparedTo]:null;
   $("comparison").innerHTML=prev?"<h3>前の人生との違い</h3><p>"+escapeHtml(prev.title)+" と比べて</p>"+
    '<div class="compare-grid"><div>貯金 <b>'+signed(s.wealth-prev.wealth)+'万円</b></div><div>つながり <b>'+signed(s.bond-prev.bond)+'</b></div></div>':
    "<p>別の分岐を試すと、前の人生と比較できます。</p>";
 }
}
function render(){
 const {s,node}=runStats();
 renderStats(s);renderSteps();renderHistory(s);renderScene(s,node);
 $("notice").textContent=toast;$("notice").classList.toggle("hidden",!toast);
 $("resume").classList.toggle("hidden",path.length===0);
 document.title=(path.length<10?"第"+(path.length+1)+"の決断":"人生の記録")+" | 1/2¹⁰";
}
$("option0").addEventListener("click",()=>choose(0));
$("option1").addEventListener("click",()=>choose(1));
$("startButton").addEventListener("click",()=>{$("welcome").classList.add("hidden");$("gameContent").classList.remove("hidden");render();});
$("resume").addEventListener("click",()=>{$("welcome").classList.add("hidden");$("gameContent").classList.remove("hidden");render();});
$("reset").addEventListener("click",()=>{replayStart();$("welcome").classList.add("hidden");$("gameContent").classList.remove("hidden");});
$("playAgain").addEventListener("click",()=>{replayStart();$("story").scrollIntoView({behavior:"smooth",block:"start"});});
$("compareBtn").addEventListener("click",()=>{$("history").scrollIntoView({behavior:"smooth"});});
document.body.addEventListener("click",e=>{const el=e.target.closest("[data-rewind]");if(el){const prefix=el.getAttribute("data-rewind");replay(prefix);$("welcome").classList.add("hidden");$("gameContent").classList.remove("hidden");}});
document.addEventListener("keydown",e=>{if($("gameContent").classList.contains("hidden"))return;if(e.target.tagName==="INPUT"||e.altKey||e.metaKey||e.ctrlKey)return;if(e.key==="1"||e.key.toLowerCase()==="a")choose(0);if(e.key==="2"||e.key.toLowerCase()==="b")choose(1);});
$("help").addEventListener("click",()=>{$("helpDialog").showModal();});
$("helpClose").addEventListener("click",()=>$("helpDialog").close());
$("welcome").classList.remove("hidden");
$("gameContent").classList.add("hidden");
render();
/* Developer-test API: deterministic 2^10 leaves, one distinct binary prefix per situation. */
window.LIFE_TEST={evaluate,sceneFor,initial,statDefs,ages:D.ages,branchCount:depth=>2**depth,choiceCount:depth=>2**depth};
})();