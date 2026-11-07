const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.LIFE_URL||'http://127.0.0.1:8770/games/one-of-1024/');
const checks=await page.evaluate(()=>{
 const results=[];
 for(let arc=0;arc<8;arc++){
  const path=arc.toString(2).padStart(3,'0'),u=LIFE_TEST.upcoming(path),C=LIFE_CONTENT;
  results.push({arc,unknownBeforeMeeting:C.castOf(u.snapshots[0])===null,meetingAge:u.beats[1].age,kind:u.beats[1].kind,name:C.castOf(u.snapshots[1]).name,knownIfSkipped:!!C.castOf(u.ready),noEarlyName:!u.beats[0].text.includes(C.characters[arc].name)});
 }
 return results;
});
for(const row of checks){assert.equal(row.unknownBeforeMeeting,true);assert.equal(row.meetingAge,22);assert.equal(row.kind,'meeting');assert.equal(row.knownIfSkipped,true);}
// Sequential reading must expose the meeting before a later conversation.
await page.evaluate(()=>localStorage.setItem('life-1024-story-v3',JSON.stringify({current:'100',found:{},visited:{}})));
await page.reload();await page.click('#pause');
assert.equal(await page.locator('#sideAge').textContent(),'20歳');assert.equal(await page.locator('#scenePerson').isVisible(),false);
await page.click('#nextBeat');assert.match(await page.locator('#travelTitle').textContent(),/澪/);assert.equal(await page.locator('#scenePerson').isVisible(),true);
await page.click('#scenePerson');assert.equal(await page.locator('#panel-people').isVisible(),true);assert.match(await page.locator('#castList').textContent(),/22歳.*学生映画の撮影現場/s);assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');
await page.screenshot({path:'/tmp/life-v4-meeting-mobile.png',fullPage:true});
await page.click('#prevBeat');assert.equal(await page.locator('#sideAge').textContent(),'20歳');assert.match(await page.locator('#castList').textContent(),/まだ/);
await page.click('#skip');assert.equal(await page.locator('#forkPerson').isVisible(),true);assert.match(await page.locator('#forkQuestion').textContent(),/22歳/);
// Tab keyboard interaction and compact mobile layout.
await page.click('#tab-current');await page.locator('#tab-current').press('ArrowRight');assert.equal(await page.locator('#tab-people').getAttribute('aria-selected'),'true');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/life-v4-desktop.png',fullPage:true});
const distinct=await page.evaluate(()=>new Set(Array.from({length:8},(_,arc)=>LIFE_AVATAR.sprite({age:31,arc,health:90},1))).size);assert.equal(distinct,8);
await page.evaluate(()=>{document.body.innerHTML='<main style="padding:25px;display:grid;grid-template-columns:repeat(8,110px);gap:15px">'+Array.from({length:8},(_,arc)=>'<div><svg viewBox="0 -6 29 49" width="100" height="160" shape-rendering="crispEdges">'+LIFE_AVATAR.sprite({age:31,arc,health:90},1)+'</svg><p>'+LIFE_AVATAR.appearance({age:31,arc}).role+'</p></div>').join('')+'</main>'});await page.screenshot({path:'/tmp/life-v4-sprites.png'});
assert.deepEqual(errors,[]);console.log(JSON.stringify({introductions:checks,reading:'next/back/skip/person card; keyboard tabs; pause',outfits:distinct,errors},null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
