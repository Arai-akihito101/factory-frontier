const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:["--no-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.LIFE_URL||'http://127.0.0.1:8765/games/one-of-1024/');
 const result=await page.evaluate(()=>{
 const T=LIFE_TEST, ends=new Set(),nodes=new Map(),arcs={}, failures=[];
 for(let n=0;n<1024;n++){
  const p=n.toString(2).padStart(10,'0');
  const u=T.upcoming(p),s=u.ready,summary=T.summarize(s);
  if(s.choices.length!==10||s.path!==p)failures.push(p+': choices');
  if(s.story.some((e,i)=>i&&e.age<s.story[i-1].age))failures.push(p+': age reversal');
  if(['savings','debt','income','joy','bond','health'].some(k=>!Number.isFinite(s[k])))failures.push(p+': nonfinite');
  if(/undefined|NaN/.test(summary.text))failures.push(p+': invalid text');
  for(const h of s.choices.slice(3))if(!summary.text.includes(h.text))failures.push(p+': lost consequence');
  ends.add(summary.text);arcs[s.arc]=(arcs[s.arc]||0)+1;
  for(let d=0;d<10;d++){
   const prefix=p.slice(0,d);if(nodes.has(prefix))continue;
   const next=T.upcoming(prefix);if(next.node.options.length!==2)failures.push(prefix+': options');
   nodes.set(prefix,JSON.stringify(next.node));
  }
 }
 return {endings:ends.size,nodes:nodes.size,distinctNodes:new Set(nodes.values()).size,arcs,failures};
 });
 assert.equal(result.endings,1024);assert.equal(result.nodes,1023);assert.deepEqual(result.failures,[]);
 // Replay, rewind and reload with actual UI handlers.
 for(const p of ['0000000000','1111111111','0101010101','1010101010']){
  await page.click('#restart');
  for(const bit of p){await page.click('#skip');await page.click('#choice'+bit);}
  await page.click('#skip');
  assert.equal(await page.evaluate(()=>LIFE_TEST.getStatus().phase),'ending');
  assert.equal(await page.locator('#ending').isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.reload();assert.equal(await page.evaluate(()=>LIFE_TEST.getStatus().path),p);
  await page.click('#skip');
  await page.locator('[data-rewind]').nth(4).click();
  assert.equal((await page.evaluate(()=>LIFE_TEST.getStatus().path)).length,4);
 }
 await page.click('#skip');
 await page.screenshot({path:'/tmp/life-mobile.png',fullPage:true});
 const rects=await page.evaluate(()=>['forkQuestion','choice0','choice1'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));
 assert.ok(rects[0].bottom<=rects[1].top);assert.ok(rects[0].bottom<=rects[2].top);
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/life-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({...result,browserErrors:errors,ui:'mobile + desktop, 4 completed routes, rewind + reload passed'},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
