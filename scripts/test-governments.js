'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const d=JSON.parse(fs.readFileSync('data/governments.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const code=fs.readFileSync('governments.js','utf8');
assert.equal(d.terms.length,8);
assert.equal(Object.keys(d.series).length,26);
assert.equal(new Set(d.terms.map(t=>t.id)).size,d.terms.length);
assert(d.terms.some(t=>t.leader==='aznar'&&t.from===2000));
assert(d.terms.some(t=>t.leader==='sanchez'&&t.to===2025));
for(const t of d.terms){assert(t.to>=t.from);assert(d.leaders[t.leader]);assert(d.series[t.from]&&d.series[t.to]);}
for(const x of d.judicial){assert(d.terms.some(t=>t.id===x.periodId));assert(x.source.startsWith('https://'));}
for(const id of ['gobiernos','governmentComparison','govPeriodA','govPeriodB','govViewTitle','govSeries','govPartySummary','govSources','govDialog'])assert(html.includes('id="'+id+'"'),'missing '+id);
assert(html.includes('data-nav="gobiernos"'));assert(html.includes('data/governments.js'));assert(html.includes('governments.js'));
assert(!html.includes('Gobiernos a examen <small>(Próximamente)</small>'));
assert(!/AFFINITY_BANK|submit_affinity_vote|supabase/.test(code));
console.log('OK: 8 administrations, 26 verified annual series, source links and no affinity quiz');
