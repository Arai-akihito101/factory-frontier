/* A complete ten-level binary tree, followed by the actual ten decisions. */
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(state,upcoming){
 const host=document.getElementById('lifeReview');if(!host)return;
 const route=state.path;if(!/^[01]{10}$/.test(route)){host.innerHTML='';return;}
 const number=parseInt(route,2)+1,edges=[],chosen=[],points=[];
 const xy=(level,index)=>({x:(index+.5)*1024/(2**level),y:16+level*23});
 for(let level=1;level<=10;level++)for(let n=0;n<2**level;n++){
  const a=xy(level-1,Math.floor(n/2)),b=xy(level,n);
  edges.push(`M${a.x} ${a.y}L${b.x} ${b.y}`);
 }
 let n=0;
 for(let i=0;i<10;i++){const a=xy(i,n);n=n*2+Number(route[i]);const b=xy(i+1,n);chosen.push(`M${a.x} ${a.y}L${b.x} ${b.y}`);points.push(`<circle cx="${b.x}" cy="${b.y}" r="${i===9?4:2.5}"/>`);}
 const leaf=xy(10,n);
 const cards=state.choices.map((choice,i)=>{
  const node=upcoming(route.slice(0,i)).node,bit=Number(route[i]),other=node.options[1-bit];
  const nextAge=state.choices[i+1]?.age??state.age;
  const memories=state.happenings.filter(h=>h.age>choice.age&&h.age<=nextAge&&h.kind!=='result'&&h.text!==choice.text).slice(0,2);
  const branch=`<svg class="review-branch" viewBox="0 0 80 60" aria-hidden="true"><path d="M40 0V16L12 40V60M40 16L68 40V60" fill="none" stroke="#d5d9c7" stroke-width="3"/><path d="M40 0V16L${bit?68:12} 40V60" fill="none" stroke="#ad754e" stroke-width="4"/><circle cx="${bit?68:12}" cy="40" r="5" fill="#ad754e"/></svg>`;
  return `<details class="review-turn" id="review-turn-${i}" ${i===0?'open':''}><summary>${branch}<span class="review-turn-copy"><small>分かれ道 ${i+1} · ${choice.age}歳 · ${bit?'B':'A'}</small><strong>${esc(choice.title)}</strong></span><span class="review-expand" aria-hidden="true">＋</span></summary><div class="review-memory"><p class="review-question">${esc(node.story)}</p><div class="review-options"><div class="review-picked"><small>歩いた道 · ${bit?'B':'A'}</small><strong>${esc(choice.title)}</strong></div><div><small>選ばなかった道 · ${bit?'A':'B'}</small><strong>${esc(other.title)}</strong></div></div><p>${esc(choice.text)}</p>${memories.length?'<div class="review-days"><small>その先の日々</small>'+memories.map(h=>`<p><b>${h.age}歳 · ${esc(h.title)}</b><br>${esc(h.text)}</p>`).join('')+'</div>':''}</div></details>`;
 }).join('');
 host.innerHTML=`<header class="review-heading"><span class="review-kicker">THE ROAD YOU TOOK</span><h3>1,024通りの中の、あなたの道。</h3><p>二つの選択を、10回。<strong>2<sup>10</sup> = 1,024</strong>通りの選択の組み合わせから、この人生を歩いてきました。</p></header><figure class="review-tree"><svg viewBox="0 0 1024 268" preserveAspectRatio="none" role="img" aria-label="10回分岐して1024の終点に広がる人生の木。あなたが選んだルートを茶色で表示。"><path d="${edges.join('')}" fill="none" stroke="#a8b8a0" stroke-width=".7" opacity=".5"/><path class="review-tree-selected" d="${chosen.join('')}" fill="none" stroke="#a9693f" stroke-width="3"/><g fill="#a9693f">${points.join('')}</g><path d="M${leaf.x} 251v10" stroke="#a9693f" stroke-width="2"/></svg><figcaption><span><i></i>あなたが通った道</span><strong>LIFE ${String(number).padStart(4,'0')} / 1024</strong></figcaption></figure><nav class="review-jumps" aria-label="十の分かれ道を振り返る">${state.choices.map((c,i)=>`<button type="button" data-review-step="${i}" aria-label="${c.age}歳の選択を振り返る"><small>${c.age}歳</small><b>${route[i]==='0'?'A':'B'}</b></button>`).join('')}</nav><p class="review-instruction">分かれ道を開くと、当時の場面と、その後の日々を読み返せます。</p><div class="review-turns">${cards}</div><p class="review-last">十の選択と、その間にあった日々。<br>それが、今回あなたが歩いた人生です。</p>`;
 host.querySelectorAll('[data-review-step]').forEach(button=>button.addEventListener('click',()=>{const detail=host.querySelector('#review-turn-'+button.dataset.reviewStep);detail.open=true;detail.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});detail.querySelector('summary').focus({preventScroll:true});}));
}
window.LIFE_REVIEW={render};
})();
