const app=document.querySelector('#app');
const storeKey='pet-decision-assistant.quiz.v1';
const resultKey='pet-decision-assistant.result.v1';
const legacyStoreKey='petfit.quiz.v1';
const legacyResultKey='petfit.result.v1';
let model={questions:[],chapters:[],breeds:[],answers:{},current:0,result:null,compare:[]};

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nav=(path)=>{ history.pushState({},'',path); render(); scrollTo({top:0,behavior:'auto'}); };
const breedById=id=>model.breeds.find(b=>b.id===id);
const icon=`<svg viewBox="0 0 64 56" aria-hidden="true"><path fill="#064022" d="M6 19C6 8 18 2 28 7c6 3 8 10 7 16-6-5-12-7-18-5-2 1-3 4-2 7-5 0-9-2-9-6Z"/><path fill="#95deb0" d="M58 19C58 8 46 2 36 7c-6 3-8 10-7 16 6-5 12-7 18-5 2 1 3 4 2 7 5 0 9-2 9-6ZM16 27c5 0 10 3 16 11 6-8 11-11 16-11 6 0 10 5 8 11-3 8-14 14-24 18C22 52 11 46 8 38c-2-6 2-11 8-11Z"/><path fill="#f56e2d" d="M32 51c-8-4-12-7-12-12 0-4 5-6 8-3l4 4 4-4c3-3 8-1 8 3 0 5-4 8-12 12Z"/></svg>`;
const header=()=>`<header class="top"><button class="brand" data-nav="/" aria-label="返回养宠决策助手首页">${icon}<span>养宠决策助手</span></button><span class="local">本地计算 · 不收集身份信息</span></header>`;
const back=(fallback,label)=>`<button class="back" data-back="${fallback}">${label}</button>`;
const save=()=>localStorage.setItem(storeKey,JSON.stringify({version:1,answers:model.answers,current:model.current,updatedAt:new Date().toISOString()}));
const load=()=>{ try{ const raw=localStorage.getItem(storeKey)||localStorage.getItem(legacyStoreKey); const x=JSON.parse(raw||'null'); if(x?.version===1){model.answers=x.answers||{};model.current=Math.min(x.current||0,17);save();} }catch{} };
const breedImage=b=>`<div class="breed-img"><img src="${b.image}" alt="${esc(b.nameZh)}" onerror="this.style.display='none';this.parentElement.classList.add('failed')"></div>`;

function home(){
  const done=Object.keys(model.answers).length;
  app.innerHTML=`<div class="home">${header()}<main class="poster">
    <img class="poster-art" src="/images/brand/living-room.png" alt="温暖客厅中的金色犬和虎斑猫">
    <div class="poster-copy"><b>养宠前，先看看生活是否准备好</b><h1>喜欢是一瞬间，<br>适合是一种生活。</h1><p>18 个生活问题，判断准备度、猫狗方向与现实取舍。</p></div>
    <div class="start-panel"><button class="cta" data-start><span>${done&&done<18?'继续上次评估':'进入我的生活评估'}</span><i>→</i></button>
      ${done&&done<18?`<p class="saved">已完成 ${done} / 18，进度保存在本机</p>`:''}
      <p class="trust">约 3–5 分钟　·　无需登录　·　本地保存</p>
      <div class="path"><span>生活条件</span><b>→</b><span>匹配方向</span><b>→</b><span>行动计划</span></div>
    </div></main></div>`;
  app.querySelector('[data-start]').onclick=()=>{ if(!(done&&done<18)){model.answers={};model.current=0;save();} nav('/quiz'); };
}

function quiz(){
  const q=model.questions[model.current], ch=model.chapters.find(c=>c.id===q.chapter), chapterQs=model.questions.filter(x=>x.chapter===q.chapter), within=chapterQs.findIndex(x=>x.id===q.id)+1, selected=model.answers[q.id];
  app.innerHTML=`${header()}<main class="quiz">${back('/','返回首页')}
    <div class="chapter"><span>${ch.number} ${ch.title}</span><strong>${model.current+1} / 18</strong></div>
    <div class="progress"><i style="width:${(model.current+1)/18*100}%"></i></div>
    <section class="question"><b class="eyebrow">本章 ${within} / ${chapterQs.length}</b><h1>${q.title}</h1>${q.help?`<p class="help">${q.help}</p>`:''}
      <div class="options">${q.options.map(o=>`<button class="option ${selected===o.value?'selected':''}" data-value="${o.value}"><strong>${o.label}</strong><i>${selected===o.value?'✓':''}</i></button>`).join('')}</div>
      <div class="quiz-actions"><button class="ghost" data-prev ${model.current===0?'disabled':''}>上一题</button><button class="next" data-next ${selected?'':'disabled'}>${model.current===17?'查看我的结果':'下一题'} →</button></div>
    </section><p class="privacy">已保存到本机 · 不需登录</p></main>`;
  app.querySelectorAll('[data-value]').forEach(el=>el.onclick=()=>{model.answers[q.id]=el.dataset.value;save();quiz();});
  app.querySelector('[data-prev]').onclick=()=>{if(model.current){model.current--;save();quiz();scrollTo(0,0)}};
  app.querySelector('[data-next]').onclick=async()=>{if(!model.answers[q.id])return;if(model.current<17){model.current++;save();quiz();scrollTo(0,0);return;} app.innerHTML=`${header()}<main class="loading"><span>正在整理生活线索</span><h1>正在把你的生活线索整理成判断</h1><p>先看准备度，再判断猫狗方向。</p><div class="dots"><i></i><i></i><i></i></div></main>`; try{const r=await fetch('/api/assess',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({answers:model.answers})});model.result=await r.json();localStorage.setItem(resultKey,JSON.stringify(model.result));setTimeout(()=>nav('/result'),420);}catch{setTimeout(()=>{app.innerHTML=`${header()}<main class="empty"><h1>暂时无法生成结果</h1><p>请稍后重试。</p>${back('/quiz','返回问卷')}</main>`},420)}};
  bindGlobal();
}

const levelText={high:'高匹配',medium:'中等匹配',caution:'需要谨慎',not_recommended:'不建议'};
function breedCard(m,negative=false){ const b=breedById(m.breedId); return `<article class="breed-card ${negative?'negative':''}">${breedImage(b)}<div><span class="badge ${m.level}">${levelText[m.level]}</span><h3>${b.nameZh}<small>${b.nameEn}</small></h3>${negative?`<b>与当前条件的冲突</b><ul>${m.conflictReasons.slice(0,2).map(x=>`<li>${x}</li>`).join('')}</ul>`:`<ul>${m.matchReasons.map(x=>`<li>${x}</li>`).join('')}</ul><p><b>需要注意：</b>${m.tradeoffs[0]}</p><div class="meta"><span>每日 ${b.dailyMinutes[0]}～${b.dailyMinutes[1]} 分钟</span><span>每月 ¥${b.monthlyCost[0]}～${b.monthlyCost[1]}</span></div>`}<div class="card-actions"><button data-breed="${b.id}">查看详情</button>${negative?'':`<button data-compare="${b.id}">${model.compare.includes(b.id)?'移出对比':'加入对比'}</button>`}</div></div></article>`; }

function result(){
  if(!model.result){try{model.result=JSON.parse(localStorage.getItem(resultKey)||localStorage.getItem(legacyResultKey)||'null');if(model.result)localStorage.setItem(resultKey,JSON.stringify(model.result));}catch{}} if(!model.result){nav('/quiz');return;}
  const r=model.result, delayed=r.readiness.level==='delay';
  const firstYear=(()=>{const bs=r.recommended.map(x=>breedById(x.breedId));if(!bs.length)return null;const min=Math.min(...bs.map(b=>b.monthlyCost[0])),max=Math.max(...bs.map(b=>b.monthlyCost[1]));return {monthly:[min,max],year:[(bs.some(b=>b.species==='dog')?1200:800)+min*12,(bs.some(b=>b.size==='large')?5000:3500)+max*12]}})();
  app.innerHTML=`${header()}<main class="result">${back('/quiz','返回问卷')}
    <section class="result-hero"><img src="/images/brand/living-room.png" alt=""><div class="paper"><b class="orange">你的生活评估</b><span class="status">${r.readiness.title}</span><h1>${delayed?'房间还需要一点准备，再迎接新的家人':r.readiness.level==='ready'?'你的生活，已经为陪伴留出了位置':'你已经走在准备路上，还有几件事值得先确认'}</h1><div class="direction"><span>${r.direction.direction==='both'?'可继续了解的方向':'更适合先了解'}</span><strong>${r.direction.title}</strong></div><p>${delayed?'这不是否定。先补齐稳定照护所需的条件，再重新评估，会让未来的相处更安心。':'这份结论来自你的时间、住所、预算和照护安排，而不是外貌或流行度。'}</p><button data-nav="/quiz" class="text-link">修改本次答案</button></div></section>
    <section><span class="eyebrow">${delayed?'房间还缺什么':'现实依据'}</span><h2>${delayed?'为什么现在建议先准备':'哪些生活条件决定了结论'}</h2><ol class="evidence">${[...new Set([...r.readiness.reasons,...r.direction.reasons])].slice(0,4).map((x,i)=>`<li><span>0${i+1}</span><p>${x}</p></li>`).join('')}</ol></section>
    ${delayed?`<section><span class="eyebrow">先准备什么</span><h2>把缺的条件，一件件放回房间</h2><ol class="actions-list">${r.actions.map(x=>`<li>${x.replace(/^先解决：/,'')}</li>`).join('')}</ol></section>`:`<section><span class="eyebrow">相对适合</span><h2>可以先认识的候选伙伴</h2><p>最多展示 3 个没有触发硬性冲突、且理由充分的候选。</p><div class="breed-list">${r.recommended.map(x=>breedCard(x)).join('')||'<p>当前条件下暂未找到合适品种，我们不会用低匹配品种补足数量。</p>'}</div>${r.recommended.length>=2?'<button class="wide ghost" data-nav="/compare">打开品种对比</button>':''}</section>`}
    <section><span class="eyebrow warning">现实冲突</span><h2>${delayed?'这些品种现在还不适合住进你的生活':'喜欢之前，也看看这些取舍'}</h2><div class="breed-list">${r.negative.slice(0,delayed?2:3).map(x=>breedCard(x,true)).join('')}</div></section>
    ${!delayed?`<section><span class="eyebrow">行动计划</span><h2>让未来的日常更从容</h2><ol class="actions-list">${r.actions.slice(0,5).map(x=>`<li>${x}</li>`).join('')}</ol></section>${firstYear?`<section class="cost"><span class="eyebrow">投入范围</span><h2>首年约 ¥${firstYear.year[0].toLocaleString()}～${firstYear.year[1].toLocaleString()}</h2><p>稳定期每月约 ¥${firstYear.monthly[0]}～${firstYear.monthly[1]}</p><small>费用为候选范围估算，不含宠物购买价格；城市和个体情况会改变区间。</small></section>`:''}`:''}
    <p class="disclaimer">本测试根据常见品种倾向和你提供的生活条件生成决策参考。品种不能决定具体个体的性格、健康和行为。</p></main>`;
  bindCards(); bindGlobal();
}

function breedDetail(id){const b=breedById(id), m=model.result?.matches.find(x=>x.breedId===id);if(!b){nav('/result');return;}const labels={low:'较低',medium:'中等',high:'较高'};app.innerHTML=`${header()}<main class="detail">${back('/result','返回评估结果')}<section class="detail-hero">${breedImage(b)}<div><span class="eyebrow">${b.species==='cat'?'猫':'狗'} · ${b.size==='small'?'小型':b.size==='large'?'大型':'中型'}</span><h1>${b.nameZh}</h1><p class="english">${b.nameEn}</p><p>常用称呼：${b.aliases.join('、')||'—'}</p>${m?`<span class="badge ${m.level}">与你的当前条件：${levelText[m.level]}</span>`:''}</div></section>${m?`<section><h2>为什么与你匹配，以及需要取舍什么</h2><div class="two"><article><h3>相对匹配</h3><ul>${m.matchReasons.map(x=>`<li>${x}</li>`).join('')}</ul></article><article><h3>冲突与取舍</h3><ul>${(m.conflictReasons.length?m.conflictReasons:m.tradeoffs).map(x=>`<li>${x}</li>`).join('')}</ul></article></div></section>`:''}<section><h2>作决定前需要了解</h2><div class="facts">${[['活动量',b.activity],['独处耐受',b.aloneTolerance],['叫声倾向',b.vocal],['掉毛倾向',b.shedding],['护理投入',b.grooming],['训练难度',b.training]].map(([k,v])=>`<article><span>${k}</span><strong>${labels[v]}</strong></article>`).join('')}</div></section><section class="two"><article><h2>可能更适合这样的生活</h2><ul>${b.suitableFor.map(x=>`<li>${x}</li>`).join('')}</ul></article><article><h2>可能不适合这样的生活</h2><ul>${b.unsuitableFor.map(x=>`<li>${x}</li>`).join('')}</ul></article></section><section class="cost"><h2>时间与费用范围</h2><p><b>每日投入：</b>${b.dailyMinutes[0]}～${b.dailyMinutes[1]} 分钟</p><p><b>稳定期月费：</b>¥${b.monthlyCost[0]}～${b.monthlyCost[1]}</p><small>${b.healthRisks[0]}</small></section></main>`;}

function compare(){const items=model.compare.map(breedById).filter(Boolean);const dims=[['体型',b=>({small:'小型',medium:'中型',large:'大型'}[b.size])],['每日投入',b=>`${b.dailyMinutes[0]}～${b.dailyMinutes[1]} 分钟`],['活动量',b=>b.activity],['独处耐受',b=>b.aloneTolerance],['掉毛',b=>b.shedding],['叫声',b=>b.vocal],['美容护理',b=>b.grooming],['每月费用',b=>`¥${b.monthlyCost[0]}～${b.monthlyCost[1]}`]];app.innerHTML=`${header()}<main class="compare">${back('/result','返回评估结果')}<span class="eyebrow">逐维度比较</span><h1>候选品种对比</h1><p>仅比较当前结果中的推荐候选，不做绝对优劣排名。</p>${items.length<2?`<div class="empty-card"><h2>${items.length?'还需选择 1 个推荐候选':'至少选择 2 个推荐候选'}</h2><p>请从结果页加入，最多同时比较 3 个。</p><button data-nav="/result">返回选择候选</button></div>`:`<div class="compare-table"><div class="compare-head"><b>候选</b>${items.map(b=>`<article>${breedImage(b)}<strong>${b.nameZh}</strong><button data-remove="${b.id}">移除</button></article>`).join('')}</div>${dims.map(([n,fn])=>`<div class="compare-row"><b>${n}</b>${items.map(b=>`<span>${fn(b)}</span>`).join('')}</div>`).join('')}</div>`}</main>`;app.querySelectorAll('[data-remove]').forEach(x=>x.onclick=()=>{model.compare=model.compare.filter(id=>id!==x.dataset.remove);compare();});bindGlobal();}

function bindCards(){app.querySelectorAll('[data-breed]').forEach(x=>x.onclick=()=>nav(`/breeds/${x.dataset.breed}`));app.querySelectorAll('[data-compare]').forEach(x=>x.onclick=()=>{const id=x.dataset.compare;if(model.compare.includes(id))model.compare=model.compare.filter(v=>v!==id);else if(model.compare.length<3)model.compare.push(id);render();});}
function bindGlobal(){app.querySelectorAll('[data-nav]').forEach(x=>x.onclick=()=>nav(x.dataset.nav));app.querySelectorAll('[data-back]').forEach(x=>x.onclick=()=>history.length>1?history.back():nav(x.dataset.back));}
function render(){const p=location.pathname;if(p==='/quiz')quiz();else if(p==='/result')result();else if(p==='/compare')compare();else if(p.startsWith('/breeds/'))breedDetail(p.split('/').pop());else home();bindGlobal();}

async function boot(){try{const [q,b]=await Promise.all([fetch('/api/questions').then(r=>r.json()),fetch('/api/breeds').then(r=>r.json())]);model.questions=q.questions;model.chapters=q.chapters;model.breeds=b.breeds;load();window.onpopstate=render;render();}catch{app.innerHTML='<main class="empty"><h1>养宠决策助手暂时无法启动</h1><p>请稍后刷新重试。</p></main>';}}
boot();
