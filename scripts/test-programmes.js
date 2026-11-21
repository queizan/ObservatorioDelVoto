'use strict';
const assert=require('assert'),fs=require('fs');
const d=JSON.parse(fs.readFileSync('data/programmes.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('program-documents.js','utf8');
assert(d.parties.length>=11&&d.topics.length>=12);
assert(d.parties.some(p=>p.key==='FRENTE_AMPLIO'));
assert(d.parties.some(p=>p.key==='BILDU'&&p.year===2026));
const ids=new Set(d.parties.map(p=>p.key));assert.equal(ids.size,d.parties.length);
for(const p of d.parties){assert.equal(Object.keys(d.positions[p.key]).length,d.topics.length);assert(p.url.startsWith('https://'));}
const total=Object.values(d.positions).flatMap(row=>Object.values(row)).filter(Boolean).length;assert(total>=80);
assert(html.includes('id="programmeCompareView"')&&html.includes('id="programmeLibraryView"'));
assert(html.includes('src="data/programmes.js')&&html.includes('src="program-documents.js'));
assert(!html.includes('id="afinidad"')&&!html.includes('affinity.js')&&!html.includes('supabase')&&!html.includes('Tu afinidad'));
assert(!html.includes('id="affinityApp"')&&!html.includes('30 preguntas'));
assert(!js.includes('AFFINITY_BANK')&&!js.includes('submit_affinity_vote')&&!js.includes('supabase'));
console.log('OK: programme comparison + library, 11 parties, 15 topics, no questionnaire. Documented cells:',total);

/* UI regression: 11 formations must be shown without clicking a hidden control. */
const vm=require('vm');
const elements=new Map();
function domEl(id){
  if(!elements.has(id)){
    elements.set(id,{id,value:'',textContent:'',innerHTML:'',hidden:false,attributes:{},listeners:{},
      children:[],classList:{toggle(){},add(){},remove(){}},
      setAttribute(key,val){this.attributes[key]=String(val);},
      addEventListener(event,callback){this.listeners[event]=callback;},
      appendChild(child){this.children.push(child);return child;}});
  }
  return elements.get(id);
}
const tabButtons=['compare','library'].map(tab=>({...domEl('tab-'+tab),dataset:{programmeTab:tab}}));
const document={
  readyState:'complete',
  getElementById:domEl,
  createElement(tag){return domEl(tag+'-'+Math.random());},
  querySelectorAll(selector){return selector==='[data-programme-tab]'?tabButtons:[];}
};
vm.runInNewContext(js,{window:{PROGRAMMES_DATA:d},document,console,URL},{filename:'program-documents.js'});
const initial=domEl('programmeComparison').innerHTML;
const cardCount=(initial.match(/<article class="programme-position"/g)||[]).length;
assert.equal(domEl('compareProgrammeTopic').value,'vivienda','Default to a meaningful topic');
assert.equal(cardCount,d.parties.length,'Initially show EVERY party, not only PP and PSOE');
assert.equal(domEl('comparisonPair').hidden,true,'Pair controls must be hidden in all-party view');
for(const p of d.parties)assert(initial.includes(p.label),p.key+' missing from initial comparison');
assert(domEl('comparisonResultCount').textContent.includes('11 formaciones'));
domEl('compareProgrammeTopic').value='all';
domEl('compareProgrammeTopic').listeners.change();
const allCount=(domEl('programmeComparison').innerHTML.match(/<article class="programme-position"/g)||[]).length;
assert.equal(allCount,d.parties.length*d.topics.length,'All-topic comparison should show all 165 cells');
domEl('programmeShowAll').listeners.click();
assert.equal(domEl('comparisonPair').hidden,false,'Pair controls visible when requested');
const pairCount=(domEl('programmeComparison').innerHTML.match(/<article class="programme-position"/g)||[]).length;
assert.equal(pairCount,2*d.topics.length,'Two-party view remains available');
console.log('OK: default all '+d.parties.length+' parties; '+d.topics.length+' themes; optional two-party mode.');
