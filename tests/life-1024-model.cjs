const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const elements=new Map();
const el=id=>{if(!elements.has(id))elements.set(id,{textContent:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){}});return elements.get(id)};
const ctx={console,localStorage:{getItem(){return null},setItem(){}},document:{getElementById:el,addEventListener(){}},setTimeout(){},clearTimeout(){}};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['life-v2-data.js','life-v3-stories.js','life-v2.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../games/one-of-1024',f),'utf8'),ctx);
const T=ctx.LIFE_TEST, endings=new Set(),nodes=new Map(),arcs={};
for(let n=0;n<1024;n++){
 const p=n.toString(2).padStart(10,'0'),s=T.upcoming(p).ready,e=T.summarize(s);
 assert.equal(s.choices.length,10);assert.equal(s.path,p);assert.ok(!/undefined|NaN/.test(e.text));
 s.story.forEach((x,i)=>assert.ok(!i||x.age>=s.story[i-1].age,p+' ages'));
 for(const k of ['savings','debt','income','joy','bond','health'])assert.ok(Number.isFinite(s[k]));
 for(const h of s.choices.slice(3))assert.ok(e.text.includes(h.text));
 endings.add(e.text);arcs[s.arc]=(arcs[s.arc]||0)+1;
 for(let d=0;d<10;d++){const prefix=p.slice(0,d);if(nodes.has(prefix))continue;const u=T.upcoming(prefix);assert.equal(u.node.options.length,2);nodes.set(prefix,JSON.stringify(u.node));assert.equal(JSON.stringify(T.upcoming(prefix)),JSON.stringify(u));}
}
assert.equal(endings.size,1024);assert.equal(nodes.size,1023);
console.log(JSON.stringify({endings:endings.size,nodes:nodes.size,distinctDecisionPresentations:new Set(nodes.values()).size,arcs,checks:'10 choices; all branches reachable; deterministic replay; chronological ages; finite state; seven adult consequences retained'},null,2));
