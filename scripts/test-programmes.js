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
