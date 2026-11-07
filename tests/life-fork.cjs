const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.LIFE_URL);
for(const bit of [0,1]){
 await p.click('#restart');await p.click('#skip');
 assert.equal(await p.locator('#forkLandscape').isVisible(),true);
 assert.equal(await p.locator('#walkerPawn').getAttribute('transform'),'translate(260 184)');
 await p.locator('#walkerScene').screenshot({path:`/tmp/life-fork-${bit}-before.png`});
 await p.click('#choice'+bit);await p.waitForTimeout(850);
 const pt=await p.evaluate(()=>{const m=document.getElementById('walkerPawn').getAttribute('transform').match(/translate\(([^ ]+) ([^)]+)\)/);return {x:+m[1],y:+m[2]};});
 assert.ok(pt.x>260);assert.ok(bit===0?pt.y<184:pt.y>184);
 await p.locator('#walkerScene').screenshot({path:`/tmp/life-fork-${bit}-walking.png`});
 await p.waitForTimeout(1300);
 assert.equal(await p.evaluate(()=>LIFE_TEST.getStatus().path),String(bit));
 assert.equal(await p.locator('#forkLandscape').isVisible(),false);
 assert.match(await p.locator('#routeHint').textContent(),/選んだ道/);
 assert.equal(await p.locator('.walker-road').evaluate(e=>getComputedStyle(e).opacity),'1');
}
assert.deepEqual(errors,[]);console.log('Fork A/B: distinct road geometry, forward movement, arrival, and fade restoration passed');await b.close();})().catch(e=>{console.error(e);process.exit(1)});
