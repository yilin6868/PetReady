const test=require('node:test');
const assert=require('node:assert/strict');
const {questions}=require('../lib/data');
const {assess}=require('../lib/engine');

const defaults=Object.fromEntries(questions.map(q=>[q.id,q.options[Math.min(1,q.options.length-1)].value]));
test('returns a complete assessment for 18 answers',()=>{const result=assess({...defaults,familyConsent:'yes',housingPermission:'yes',budget:'high',emergencyFund:'yes',carePlan:'yes'});assert.equal(result.readiness.level,'ready');assert.ok(['cat','dog','both'].includes(result.direction.direction));assert.ok(result.recommended.length<=3);assert.equal(result.matches.length,20);});
test('hard blockers lead to delay',()=>{const result=assess({...defaults,familyConsent:'no',housingPermission:'no',budget:'none'});assert.equal(result.readiness.level,'delay');assert.equal(result.direction.direction,'neither');assert.equal(result.recommended.length,0);});
test('recommendations never include excluded breeds',()=>{const result=assess({...defaults,familyConsent:'yes',housingPermission:'yes',budget:'medium',emergencyFund:'yes',carePlan:'yes'});assert.ok(result.recommended.every(x=>x.status==='eligible'));});
