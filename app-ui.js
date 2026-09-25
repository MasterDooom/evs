const topics=window.EVS_TOPICS||[]; const questions=window.EVS_QUESTIONS||[];
const nav=document.getElementById('topicNav'),content=document.getElementById('content'),practice=document.getElementById('practice');
const done=JSON.parse(localStorage.getItem('evsDone')||'{}');
let currentIndex=-1;

function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function cardList(items){return '<ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'}
function flow(t){
  return '<div class="academic-flow">'+t.flow.map((x,j)=>'<div class="flow-node"><span>'+String(j+1).padStart(2,'0')+'</span><strong>'+esc(x)+'</strong></div>'+(j<t.flow.length-1?'<div class="flow-line"><i></i><b>↓</b></div>':'')).join('')+'</div>'
}
function table(t){
  if(!t.table)return '';
  return '<div class="table-wrap"><table class="study-table"><thead><tr>'+t.table[0].map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+t.table.slice(1).map(r=>'<tr>'+r.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'
}
function renderNav(filter=''){
  const groups=[...new Set(topics.map(t=>t.group))];
  nav.innerHTML=groups.map(g=>{
    const items=topics.map((t,i)=>({t,i})).filter(x=>x.t.group===g && (!filter||JSON.stringify(x.t).toLowerCase().includes(filter)));
    if(!items.length)return '';
    return '<div class="nav-group">'+esc(g)+'</div>'+items.map(({t,i})=>
      '<button class="topic-link '+(currentIndex===i?'active ':'')+(done[i]?'done':'')+'" data-id="'+i+'"><span class="topic-num">'+String(i+1).padStart(2,'0')+'</span><span class="topic-link-text">'+esc(t.title)+'</span><span class="topic-dot"></span></button>'
    ).join('');
  }).join('');
  nav.querySelectorAll('.topic-link').forEach(b=>b.onclick=()=>openTopic(Number(b.dataset.id)));
}
function updateProgress(){
  const n=Object.values(done).filter(Boolean).length;
  const pct=Math.round(n/topics.length*100);
  document.getElementById('progressCount').textContent=n+' / '+topics.length+' topics';
  document.getElementById('progressLabel').textContent=pct+'%';
  document.getElementById('progressBar').style.width=pct+'%';
}
function setMode(mode){
  document.querySelectorAll('.mode').forEach(x=>x.classList.remove('active'));
  const el=document.getElementById(mode+'Mode'); if(el)el.classList.add('active');
}
function openTopic(i){
  if(!topics[i])return;
  currentIndex=i;
  const t=topics[i];
  practice.classList.add('hidden'); content.classList.remove('hidden');
  setMode('notes');
  document.getElementById('crumbCurrent').textContent=t.title;
  document.getElementById('topicMeta').textContent='Topic '+String(i+1).padStart(2,'0')+' · '+t.group;
  renderNav(document.getElementById('sideSearch').value.toLowerCase().trim());
  content.innerHTML=topicMarkup(t,i);
  window.scrollTo({top:0,behavior:'smooth'});
  bindTopic();
  closeMobile();
}
function topicMarkup(t,i){
  const previous=i>0?topics[i-1]:null, next=i<topics.length-1?topics[i+1]:null;
  return '<article class="document">'+
    '<header class="document-head">'+
      '<div class="doc-number">'+String(i+1).padStart(2,'0')+'</div>'+
      '<div class="doc-title"><div class="doc-kicker">'+esc(t.group)+'</div><h1>'+esc(t.title)+'</h1><p>'+esc(t.sub)+'</p></div>'+
      '<div class="doc-tools"><span class="yield '+(t.p==='high'?'high':t.p==='med'?'med':'low')+'">'+(t.p==='high'?'HIGH YIELD':t.p==='med'?'MEDIUM':'QUICK SCAN')+'</span>'+
      '<button class="complete-btn '+(done[i]?'done':'')+'" id="completeBtn">'+(done[i]?'✓ Revised':'Mark revised')+'</button></div>'+
    '</header>'+
    '<div class="page-nav"><button class="page-arrow" '+(previous?'':'disabled')+' data-nav="'+(i-1)+'">←</button><span>PAGE <strong>'+String(i+1).padStart(2,'0')+'</strong> / '+String(topics.length).padStart(2,'0')+'</span><button class="page-arrow" '+(next?'':'disabled')+' data-nav="'+(i+1)+'">→</button></div>'+
    '<div class="document-grid">'+
      '<main class="document-body">'+
        '<section class="doc-section overview"><div class="section-label"><span>01</span> OVERVIEW</div><p>'+esc(t.must?.[0]||t.sub)+'</p></section>'+
        '<section class="doc-section concepts-section"><div class="section-label"><span>02</span> CORE CONCEPTS</div>'+cardList(t.must.slice(1))+'</section>'+
        '<section class="doc-section visual-section"><div class="section-label"><span>03</span> VISUAL MODEL</div><p class="section-hint">Use the sequence below to recall the structure without rereading the paragraph.</p>'+flow(t)+table(t)+'</section>'+
        '<section class="doc-section traps-section"><div class="section-label"><span>04</span> EXAM TRAPS</div><div class="trap-list">'+t.traps.map((x,j)=>'<div class="trap-row"><span>!</span><p>'+esc(x)+'</p></div>').join('')+'</div></section>'+
        '<section class="doc-section recall-section remember-section"><div class="section-label"><span>05</span> 30-SECOND RECALL</div><div class="recall-grid">'+t.must.slice(0,4).map((x,j)=>'<div><b>'+String(j+1).padStart(2,'0')+'</b><p>'+esc(x)+'</p></div>').join('')+'</div></section>'+
        '<div class="topic-pagination"><button '+(previous?'':'disabled')+' data-nav="'+(i-1)+'">← '+(previous?esc(previous.title):'Previous')+'</button><button '+(next?'':'disabled')+' data-nav="'+(i+1)+'">'+(next?esc(next.title):'Next')+' →</button></div>'+
      '</main>'+
      '<aside class="doc-rail">'+
        '<div class="rail-card"><div class="rail-title">ON THIS PAGE</div><button data-jump="overview">Overview</button><button data-jump="concepts">Core concepts</button><button data-jump="visual">Visual model</button><button data-jump="traps">Exam traps</button><button data-jump="recall">30-second recall</button></div>'+
        '<div class="rail-card recall-card"><div class="rail-title">QUICK RECALL</div><div class="mini-q">Can you explain this topic without looking?</div><button class="reveal-mini" id="revealMini">Show key points</button><div class="mini-answer hidden" id="miniAnswer">'+t.must.slice(0,3).map(x=>'• '+esc(x)).join('<br>')+'</div></div>'+
        '<div class="rail-card"><div class="rail-title">TOPIC</div><strong class="rail-big">'+String(i+1).padStart(2,'0')+' / '+String(topics.length).padStart(2,'0')+'</strong><div class="rail-muted">'+esc(t.group)+'</div></div>'+
      '</aside>'+
    '</div>'+
  '</article>';
}
function bindTopic(){
  const i=currentIndex;
  document.getElementById('completeBtn').onclick=()=>{done[i]=!done[i];localStorage.setItem('evsDone',JSON.stringify(done));openTopic(i);updateProgress()};
  content.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>openTopic(Number(b.dataset.nav)));
  const sections=['overview','concepts','visual','traps','recall'];
  content.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>document.querySelector('.doc-section.'+(b.dataset.jump==='overview'?'overview':b.dataset.jump+'-section'))?.scrollIntoView({behavior:'smooth',block:'start'}));
  document.getElementById('revealMini').onclick=()=>document.getElementById('miniAnswer').classList.toggle('hidden');
}
function showHome(){
  currentIndex=-1; setMode('notes');
  document.getElementById('crumbCurrent').textContent='Course overview';
  document.getElementById('topicMeta').textContent='26 topics · detailed revision notes';
  practice.classList.add('hidden');content.classList.remove('hidden');
  renderNav(document.getElementById('sideSearch').value.toLowerCase().trim());
  content.innerHTML='<section class="home">'+
    '<div class="home-heading"><div><div class="doc-kicker">ENVIRONMENTAL SCIENCE · CAT-II</div><h1>Study the material.<br><em>Actually remember it.</em></h1><p>A detailed revision workspace built around your supplied course notes — with academic diagrams, comparison tables, exam traps, recall and testing.</p></div><div class="home-actions"><button class="primary" id="continueBtn">'+(currentProgressTopic()!==null?'Continue revision →':'Start with Topic 01 →')+'</button><button class="outline" id="randomHome">Random topic</button></div></div>'+
    '<div class="home-stats"><div><strong>'+topics.length+'</strong><span>topics</span></div><div><strong>'+questions.length+'</strong><span>MCQs</span></div><div><strong>'+Object.values(done).filter(Boolean).length+'</strong><span>revised</span></div><div><strong>3</strong><span>study modes</span></div></div>'+
    '<div class="home-grid"><section><div class="home-section-title">COURSE MAP <span>26 topics</span></div>'+topics.map((t,i)=>'<button class="map-row" data-map="'+i+'"><span>'+String(i+1).padStart(2,'0')+'</span><div><strong>'+esc(t.title)+'</strong><small>'+esc(t.group)+'</small></div><i class="'+(done[i]?'is-done':'')+'">'+(done[i]?'✓':'→')+'</i></button>').join('')+'</section>'+
    '<aside><div class="home-section-title">HOW TO USE <span>3 steps</span></div><div class="method"><b>01</b><div><strong>Read</strong><p>Work through the expanded notes and visual model.</p></div></div><div class="method"><b>02</b><div><strong>Recall</strong><p>Use the quick recall rail and flashcards before checking.</p></div></div><div class="method"><b>03</b><div><strong>Test</strong><p>Finish with a 30-question MCQ test and review mistakes.</p></div></div><div class="home-note"><span>TIP</span> Mark topics revised only after you can explain the key points without looking.</div></aside></div>'+
    '</section>';
  document.getElementById('continueBtn').onclick=()=>openTopic(currentProgressTopic()??0);
  document.getElementById('randomHome').onclick=()=>openTopic(Math.floor(Math.random()*topics.length));
  content.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>openTopic(Number(b.dataset.map)));
  closeMobile();
}
function currentProgressTopic(){for(let i=0;i<topics.length;i++)if(!done[i])return i;return null}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function showPractice(){
  setMode('test');practice.classList.remove('hidden');content.classList.add('hidden');document.getElementById('crumbCurrent').textContent='30-question test';document.getElementById('topicMeta').textContent='Active recall · answer before checking';
  const selected=shuffle([...questions]).slice(0,30);
  practice.innerHTML='<div class="test-page"><div class="test-head"><div><div class="doc-kicker">ACTIVE RECALL</div><h1>30-question rapid test</h1><p>Commit to an answer before the correct option is revealed.</p></div><div class="test-score" id="score">0 <small>/ 30</small></div></div>'+selected.map((q,i)=>'<div class="test-q"><div class="q-meta"><span>QUESTION '+String(i+1).padStart(2,'0')+'</span></div><h3>'+esc(q[0])+'</h3><div class="options">'+q[1].map((o,j)=>'<button class="opt" data-q="'+i+'" data-a="'+j+'"><span>'+String.fromCharCode(65+j)+'</span>'+esc(o)+'</button>').join('')+'</div><div class="answer"></div></div>').join('')+'</div>';
  let score=0;
  practice.querySelectorAll('.test-q').forEach((box,i)=>box.querySelectorAll('.opt').forEach(btn=>btn.onclick=()=>{if(box.dataset.answered)return;box.dataset.answered='1';const c=selected[i][2],a=Number(btn.dataset.a);box.querySelectorAll('.opt').forEach((o,k)=>{if(k===c)o.classList.add('correct')});if(a===c){btn.classList.add('correct');score++}else btn.classList.add('wrong');box.querySelector('.answer').textContent=a===c?'Correct.':'Not quite — the highlighted option is correct.';document.getElementById('score').innerHTML=score+' <small>/ 30</small>'}));
  window.scrollTo({top:0,behavior:'smooth'});closeMobile();
}
function showFlashcards(){
  setMode('flash');practice.classList.remove('hidden');content.classList.add('hidden');document.getElementById('crumbCurrent').textContent='Flashcards';document.getElementById('topicMeta').textContent='Active recall · reveal only after thinking';
  const pool=topics.flatMap((t,ti)=>t.must.map((fact,fi)=>({topic:t.title,fact,ti,fi})));let index=0,known=0;
  function draw(){
    const c=pool[index];
    practice.innerHTML='<div class="flash-page"><div class="test-head"><div><div class="doc-kicker">ACTIVE RECALL</div><h1>Flashcards</h1><p>Think first. Reveal second. Mark it known only when you could reproduce it.</p></div><div class="flash-counter">'+String(index+1).padStart(2,'0')+' / '+String(pool.length).padStart(2,'0')+'</div></div><div class="flashcard"><div class="flash-meta">'+esc(c.topic)+'</div><div class="flash-question">Recall the key point</div><div class="flash-prompt">'+esc(c.fact)+'</div><button class="reveal-btn" id="reveal">Reveal</button><div class="flash-answer hidden" id="flashAnswer">This point comes directly from the supplied course notes.</div></div><div class="flash-controls"><button class="outline" id="prevCard">← Previous</button><button class="outline" id="skipCard">Skip</button><button class="primary" id="knowCard">✓ I know this</button></div><div class="flash-progress"><i style="width:'+((index+1)/pool.length*100)+'%"></i></div><div class="known-count">'+known+' cards marked known</div></div>';
    document.getElementById('reveal').onclick=()=>document.getElementById('flashAnswer').classList.toggle('hidden');
    document.getElementById('prevCard').onclick=()=>{index=(index-1+pool.length)%pool.length;draw()};
    document.getElementById('skipCard').onclick=()=>{index=(index+1)%pool.length;draw()};
    document.getElementById('knowCard').onclick=()=>{known++;index=(index+1)%pool.length;draw()};
  }
  draw();window.scrollTo({top:0,behavior:'smooth'});closeMobile();
}
function closeMobile(){if(innerWidth<900){document.getElementById('sidebar').classList.remove('open');document.getElementById('menuBtn').setAttribute('aria-expanded','false')}}
function navigate(delta){if(currentIndex<0){openTopic(delta>0?0:topics.length-1);return}openTopic(Math.max(0,Math.min(topics.length-1,currentIndex+delta)))}

document.getElementById('homeBtn').onclick=showHome;document.getElementById('brandHome').onclick=showHome;
document.getElementById('practiceBtn').onclick=showPractice;
document.getElementById('testMode').onclick=showPractice;
document.getElementById('flashBtn').onclick=showFlashcards;
document.getElementById('flashMode').onclick=showFlashcards;
document.getElementById('notesMode').onclick=()=>currentIndex>=0?openTopic(currentIndex):showHome();
document.getElementById('prevBtn').onclick=()=>navigate(-1);
document.getElementById('nextBtn').onclick=()=>navigate(1);
document.getElementById('focusBtn').onclick=()=>document.body.classList.toggle('focus-mode');
document.getElementById('menuBtn').onclick=()=>{const s=document.getElementById('sidebar'),open=!s.classList.contains('open');s.classList.toggle('open',open);document.getElementById('menuBtn').setAttribute('aria-expanded',String(open))};
document.getElementById('search').addEventListener('input',e=>{const q=e.target.value.toLowerCase().trim();if(!q){showHome();return}const match=topics.findIndex(t=>JSON.stringify(t).toLowerCase().includes(q));if(match>=0)openTopic(match)});
document.getElementById('sideSearch').addEventListener('input',e=>renderNav(e.target.value.toLowerCase().trim()));
window.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.getElementById('search').focus();return}
  if(currentIndex>=0 && !e.ctrlKey && !e.metaKey && !e.altKey && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){
    if(e.key==='ArrowLeft') navigate(-1);
    if(e.key==='ArrowRight') navigate(1);
  }
});
renderNav();updateProgress();showHome();