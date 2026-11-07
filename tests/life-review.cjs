const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.LIFE_URL);
for(const route of ['0000000000','1111111111','0101010101']){
 await p.evaluate(route=>localStorage.setItem('life-1024-story-v3',JSON.stringify({current:route,found:{},visited:{}})),route);await p.reload();await p.click('#skip');
 assert.equal(await p.locator('.review-turn').count(),10);assert.equal(await p.locator('.review-jumps button').count(),10);
 const summary=await p.evaluate(()=>{const svg=document.querySelector('.review-tree svg');return {all:svg.querySelector('path').getAttribute('d').split('M').length-1,selected:svg.querySelector('.review-tree-selected').getAttribute('d').split('M').length-1,leaf:svg.querySelector('circle:last-child').getAttribute('cx')};});
 assert.equal(summary.all,2046);assert.equal(summary.selected,10);assert.equal(+summary.leaf,parseInt(route,2)+.5);
 await p.locator('[data-review-step="9"]').click();assert.equal(await p.locator('#review-turn-9').evaluate(e=>e.open),true);
 const matches=await p.evaluate(route=>{const s=LIFE_TEST.simulate(route);return s.choices.every((c,i)=>document.querySelector('#review-turn-'+i+' summary strong').textContent===c.title);},route);assert.ok(matches);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
}
await p.locator('#lifeReview').screenshot({path:'/tmp/life-review-mobile.png'});await p.setViewportSize({width:1440,height:1000});await p.locator('#lifeReview').screenshot({path:'/tmp/life-review-desktop.png'});assert.deepEqual(errors,[]);console.log('Three routes: full 2046-edge tree, 10 selected edges, correct endpoint, actual choices, accessible review navigation, mobile layout passed');await b.close();})().catch(e=>{console.error(e);process.exit(1)});
