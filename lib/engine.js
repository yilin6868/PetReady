const { breeds } = require('./data');

function readiness(a) {
  const hard = [], soft = [], good = [];
  a.familyConsent === 'no' ? hard.push('同住成员中有人明确反对') : a.familyConsent === 'uncertain' ? soft.push('需要与同住成员达成明确共识') : good.push('同住成员已经达成共识');
  a.housingPermission === 'no' ? hard.push('当前住所明确禁止养宠') : ['unknown','limited'].includes(a.housingPermission) ? soft.push('需要确认住所与具体宠物类型限制') : good.push('已确认住所允许养宠');
  a.budget === 'none' ? hard.push('目前无法稳定承担日常支出') : good.push('具备稳定日常预算');
  if (a.travel === 'often' && a.carePlan === 'no') hard.push('经常离家且暂无可靠照护方案'); else if (a.carePlan === 'no') soft.push('需要建立离家期间的照护方案');
  a.emergencyFund === 'no' ? soft.push('需要逐步建立突发医疗备用金') : good.push('有建立医疗备用金的能力');
  if (hard.length) return { level:'delay', title:'建议暂缓养宠', reasons:[...hard,...soft].slice(0,4), actions:hard.map(x=>`先解决：${x}`).concat(soft).slice(0,4) };
  if (soft.length >= 2) return { level:'conditional', title:'有条件适合', reasons:[...good,...soft].slice(0,4), actions:soft };
  return { level:'ready', title:'适合开始准备', reasons:[...good,'已具备继续了解具体宠物的基础条件'].slice(0,4), actions:soft.length ? soft : ['线下接触候选宠物并验证个体差异','持续预留日常与医疗支出'] };
}

function direction(a, ready = readiness(a)) {
  if (ready.level === 'delay') return { direction:'neither', title:'当前猫狗均不建议', reasons:ready.reasons.slice(0,3) };
  let cat=0, dog=0; const reasons=[];
  if (a.exercise === 'low') { cat+=3; dog-=3; reasons.push('可提供的户外运动时间更贴近多数室内猫的日常方式'); }
  if (a.exercise === 'high') { dog+=3; reasons.push('充足的户外运动时间为养犬提供了基础'); }
  if (a.aloneHours === 'long') { cat+=1; dog-=2; reasons.push('较长独处时段更需要重视独处耐受倾向'); }
  if (a.interaction === 'high') { dog+=2; reasons.push('愿意投入较多互动和训练时间'); }
  if (a.noise === 'low') { cat+=1; dog-=1; reasons.push('对安静环境的需求会缩小犬种选择范围'); }
  if (a.preference === 'cat') cat+=1; if (a.preference === 'dog') dog+=1;
  const d = Math.abs(cat-dog)<=1 ? 'both' : cat>dog ? 'cat' : 'dog';
  return { direction:d, title:d==='both'?'猫狗均可':d==='cat'?'更适合猫':'更适合狗', reasons:(reasons.length?reasons:['当前时间与居住条件对猫狗没有明显单向限制']).slice(0,4) };
}

const levelNum={low:1,medium:2,high:3};
function matchBreed(a,b,d=direction(a)) {
  const hard=[], conflicts=[], matches=[]; let score=60;
  if (d.direction==='neither') hard.push('当前养宠前置条件尚未满足');
  if (a.housingPermission==='limited'&&b.species==='dog'&&b.size==='large') hard.push('住所限制与大型犬存在明确冲突');
  if (a.space==='small'&&b.species==='dog'&&b.size==='large') { conflicts.push('小户型会增加大型犬活动与动线安排压力'); score-=20; }
  if (a.exercise==='low'&&b.activity==='high') hard.push('可提供运动时间无法满足高活动量品种的基本需要');
  else { const ok=levelNum[a.exercise]>=levelNum[b.activity]; score+=ok?12:-12; (ok?matches:conflicts).push(ok?'你的运动投入能够覆盖该品种的常见活动需求':'运动投入与该品种的常见需求存在差距'); }
  if (a.aloneHours==='long'&&b.aloneTolerance==='low') { conflicts.push('长时间独处与该品种的陪伴需求存在冲突'); score-=18; } else matches.push('独处安排与该品种倾向没有明显冲突');
  if (a.shedding==='low'&&b.shedding==='high') { conflicts.push('你很难接受掉毛，而该品种通常掉毛较多'); score-=18; } else matches.push('掉毛接受度与日常清理需求较匹配');
  if (a.noise==='low'&&b.vocal==='high') { conflicts.push('对安静环境的要求与较高叫声倾向冲突'); score-=15; }
  if (a.grooming==='low'&&b.grooming==='high') { conflicts.push('可投入的护理精力可能不足'); score-=15; } else matches.push('可投入的护理精力基本适配');
  const max={none:0,low:500,medium:1200,high:9999}[a.budget]||0;
  if (b.monthlyCost[0]>max) { conflicts.push('稳定预算低于该品种日常费用区间'); score-=20; }
  if (!['both','neither',b.species].includes(d.direction)) { score-=12; conflicts.push('该物种方向与当前综合判断不一致'); } else matches.push('符合当前猫狗方向判断');
  score=Math.max(0,Math.min(100,score)); const status=hard.length?'excluded':conflicts.length>=2||score<55?'caution':'eligible';
  return { breedId:b.id, status, score, level:hard.length?'not_recommended':status==='caution'?'caution':score>=75?'high':'medium', matchReasons:[...new Set(matches)].slice(0,3), conflictReasons:[...hard,...conflicts], tradeoffs:conflicts.length?conflicts.slice(0,2):[b.unsuitableFor[0]] };
}

function assess(answers) {
  const r=readiness(answers), d=direction(answers,r), all=breeds.map(b=>matchBreed(answers,b,d)).sort((a,b)=>b.score-a.score||a.breedId.localeCompare(b.breedId));
  let recommended=all.filter(x=>x.status==='eligible'&&x.matchReasons.length>=2);
  if (d.direction==='both') { const c=recommended.find(x=>breeds.find(b=>b.id===x.breedId).species==='cat'), g=recommended.find(x=>breeds.find(b=>b.id===x.breedId).species==='dog'); if(c&&g){ const lead=answers.preference==='dog'?[g,c]:answers.preference==='cat'?[c,g]:[c,g]; recommended=[...lead,...recommended.filter(x=>!lead.includes(x))]; } }
  recommended=recommended.slice(0,3);
  let negative=all.filter(x=>x.status==='excluded').sort((a,b)=>a.score-b.score).slice(0,3); if(negative.length<2) negative=[...negative,...all.filter(x=>x.status==='caution'&&!negative.includes(x)).sort((a,b)=>a.score-b.score).slice(0,3-negative.length)];
  const actions=[...r.actions];
  if(answers.familyConsent!=='yes') actions.push('与所有同住成员明确照护分工和底线');
  if(answers.housingPermission!=='yes') actions.push('向房东或物业书面确认允许范围');
  if(answers.emergencyFund!=='yes') actions.push('建立独立的突发医疗备用金');
  if(answers.carePlan!=='yes'||answers.travel==='often') actions.push('落实出差、旅行期间的可靠照护方案');
  r.level==='delay'?actions.push('条件改善后重新完成评估'):(actions.push('线下接触候选品种或经评估的成年个体'),actions.push('了解领养或繁育机构的健康、来源与合同核验要点'));
  return { readiness:r, direction:d, matches:all, recommended, negative, actions:[...new Set(actions)].slice(0,7) };
}

module.exports={ readiness, direction, matchBreed, assess };
