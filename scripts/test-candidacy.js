'use strict';
// Regression tests for exclusive Sumar/Frente Amplio cohorts without a fragile DOM mock.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'data/polls.json'),'utf8'));
const code=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
assert.equal(data.polls.length,data.metadata.totalPolls);
const front=data.polls.filter(p=>Number.isFinite(p.vote.FRENTE_AMPLIO));
const historic=data.polls.filter(p=>Number.isFinite(p.vote.SUMAR));
assert(front.length>0 && historic.length>0,'Both historical and current candidacies required');
assert.equal(front.length+historic.length,data.polls.length);
for(const p of data.polls){
  assert.equal(['SUMAR','FRENTE_AMPLIO'].filter(k=>Number.isFinite(p.vote?.[k])).length,1,'Mixed/missing vote cohort: '+p.id);
  assert(!('SUMAR' in (p.seats||{}) && 'FRENTE_AMPLIO' in (p.seats||{})),'Mixed seats: '+p.id);
  assert(p.vote.PP>=0&&p.vote.PSOE>=0&&p.vote.VOX>=0,'Invalid vote values: '+p.id);
}
const anchor="  if(document.readyState==='loading')";
assert(code.includes(anchor),'Application boot anchor not found');
const injected=code.replace(anchor,"  globalThis.__testHooks={inAverage,avgVotes,avgSeats,candidacyOf,visibleParties,state};\n"+anchor);
const nodes=new Map();
const element=id=>{
  if(!nodes.has(id)) nodes.set(id,{innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,
    style:{},setAttribute(){},removeAttribute(){},addEventListener(){},querySelector(){return null;},
    querySelectorAll(){return [];},classList:{toggle(){},add(){},remove(){}}});
  return nodes.get(id);
};
const context={window:{PULSO_DATA:data},document:{readyState:'loading',getElementById:element,addEventListener(){}},console};
vm.runInNewContext(injected,context,{filename:'app.js'});
const h=context.__testHooks;
assert(h,'Test hooks missing');
assert.equal(h.state.candidacy,'FRENTE_AMPLIO');
const latest=h.inAverage();
assert(latest.every(p=>h.candidacyOf(p)==='FRENTE_AMPLIO'));
assert.equal(latest.length,new Set(front.map(p=>p.pollster)).size);
const vote=h.avgVotes(latest);
const expected=latest.reduce((sum,p)=>sum+p.vote.FRENTE_AMPLIO,0)/latest.length;
assert(Math.abs(vote.FRENTE_AMPLIO-expected)<1e-10);
assert(!Object.hasOwn(vote,'SUMAR'));
assert(h.visibleParties().some(p=>p.key==='FRENTE_AMPLIO'));
assert(!h.visibleParties().some(p=>p.key==='SUMAR'));
const seats=h.avgSeats(latest);
if(seats)assert(!Object.hasOwn(seats.result,'SUMAR'));
h.state.candidacy='SUMAR';
const past=h.inAverage();
assert(past.length>0&&past.every(p=>h.candidacyOf(p)==='SUMAR'));
const oldVotes=h.avgVotes(past);
assert(!Object.hasOwn(oldVotes,'FRENTE_AMPLIO'));
assert(h.visibleParties().some(p=>p.key==='SUMAR'));
assert(!h.visibleParties().some(p=>p.key==='FRENTE_AMPLIO'));
assert(code.includes('transition-line')&&code.includes('Sumar · histórico'),'Timeline must label disconnected cohorts');
assert(code.includes('No comparable'),'Comparison must label non-comparable entries');
console.log('OK:',data.polls.length,'polls in two separate candidacy cohorts; current/historical snapshot and seat computation.');
