const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.LIFE_URL||'http://127.0.0.1:8765/games/one-of-1024/');
const pose=()=>page.locator('#walkerPawn').getAttribute('transform');
const first=await pose();await page.waitForTimeout(220);assert.notEqual(await pose(),first);
await page.click('#pause');const stopped=await pose();await page.waitForTimeout(260);assert.equal(await pose(),stopped);
await page.click('#skip');await page.click('#choice0');await page.waitForTimeout(240);
assert.equal(await page.evaluate(()=>LIFE_TEST.getStatus().path),'0');
const left=await pose();assert.ok(Number(left.match(/translate\(([^ ]+)/)[1])<300);
// Rewind during walking must invalidate the pending transition.
await page.click('#restart');await page.waitForTimeout(1100);assert.equal(await page.evaluate(()=>LIFE_TEST.getStatus().path),'');
await page.click('#skip');await page.click('#choice1');await page.waitForTimeout(240);
assert.ok(Number((await pose()).match(/translate\(([^ ]+)/)[1])>300);
await page.waitForTimeout(1100);assert.equal(await page.evaluate(()=>LIFE_TEST.getStatus().path),'1');
assert.equal(await page.locator('#walkerScene').getAttribute('data-age'),'9');
const sprites=await page.evaluate(()=>{
 const A=LIFE_AVATAR;
 const sample={age:31,arc:4,health:90};
 const assertDirections=[A.sprite(sample,0,'front'),A.sprite(sample,0,'back'),A.sprite(sample,0,'side')];
 if(new Set(assertDirections).size!==3)throw new Error('Three directional sprites required');
 const outfits=Array.from({length:8},(_,arc)=>A.sprite({age:31,arc,health:90},0));
 const ages=[6,15,20,31,56,78].map(age=>A.sprite({age,arc:6,college:true,health:90,retired:age>=67},0));
 return {outfits:new Set(outfits).size,ages:new Set(ages).size,old:A.appearance({age:78,arc:6,health:90}),unwell:A.appearance({age:78,arc:6,health:35})};
});assert.equal(sprites.outfits,8);assert.equal(sprites.ages,6);assert.equal(sprites.old.cane,false);assert.equal(sprites.unwell.cane,true);
// Inspect a full late-life branch with real Japanese text and the normal stylesheet.
await page.evaluate(()=>localStorage.setItem('life-1024-story-v3',JSON.stringify({current:'001001011',found:{},visited:{}})));
await page.reload();await page.click('#skip');await page.screenshot({path:'/tmp/life-walk-mobile.png',fullPage:true});
const boxes=await page.evaluate(()=>['walkerScene','forkQuestion','choice0'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {top:r.top,bottom:r.bottom}}));
assert.ok(boxes[0].bottom<=boxes[1].top);assert.ok(boxes[1].bottom<=boxes[2].top);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/life-walk-desktop.png',fullPage:true});
await page.evaluate(()=>{const A=LIFE_AVATAR;document.body.innerHTML='<main style="padding:30px;background:#eee7d5;display:grid;grid-template-columns:repeat(8,100px);gap:12px">'+Array.from({length:8},(_,arc)=>'<div><svg viewBox="0 -5 28 45" width="100" height="160" shape-rendering="crispEdges">'+A.sprite({age:31,arc,health:90},1)+'</svg><p>'+A.appearance({age:31,arc}).role+'</p></div>').join('')+[6,15,20,31,56,78].map(age=>'<div><svg viewBox="0 -5 28 45" width="100" height="160" shape-rendering="crispEdges">'+A.sprite({age,arc:6,college:true,retired:age>=67,health:90},0)+'</svg><p>'+age+'歳</p></div>').join('')+'</main>'});
await page.screenshot({path:'/tmp/life-sprites.png'});
assert.deepEqual(errors,[]);await browser.close();console.log(JSON.stringify({outfits:sprites.outfits,ageLooks:sprites.ages,walk:'left/right; pause; restart during transition',layout:'mobile/desktop no overlap',errors}));
})().catch(e=>{console.error(e);process.exit(1)});
