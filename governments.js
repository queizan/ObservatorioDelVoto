'use strict';
/* Gobiernos a examen: análisis local sin registro de preferencias políticas. */
(function(){function ready(){(function govtExam(){
'use strict';
const D=window.GOVERNMENTS_DATA, el=id=>document.getElementById(id);
if(!D||!el('governmentComparison'))return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,d=1)=>Number(v).toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
const series=y=>D.series[String(y)]||{};
const leaders=D.leaders, byId=Object.fromEntries(D.terms.map(t=>[t.id,t]));
const A=el('govPeriodA'),B=el('govPeriodB'),M=el('govIndicator');
let tab='indicadores';
const href=(url,text)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>`;
function num(v,m){return Number.isFinite(v)?fmt(v,m.id==='balanceMEUR'?0:1)+' '+m.unit:'N/D';}
function delta(t,m){let a=series(t.from)[m.id],b=series(t.to)[m.id];return Number.isFinite(a)&&Number.isFinite(b)?b-a:null;}
function diff(d,m){return d===null?'N/D':(d>0?'+':'')+fmt(d,m.unit==='M€'?0:1)+(m.unit==='M€'?' M€':' pp');}
function head(t){const p=leaders[t.leader];return `<div class="gov-person"><span class="gov-person-icon" style="--gov-color:${p.color}">${esc(p.name.split(' ').map(x=>x[0]).slice(-2).join(''))}</span><div><span class="gov-party-label" style="--gov-color:${p.color}">${esc(p.party)}</span><small>${t.from}–${t.to}</small><h3>${esc(p.name)}</h3><p>${esc(t.period)}</p></div></div>`;}
function score(){return '<div class="gov-unrated"><strong>Nota global: N/D</strong><p>Pendiente de una evaluación homogénea de promesas, impacto y gasto sectorial. El cambio de un indicador no demuestra causalidad.</p></div>';}
function panel(t){let body='';
if(tab==='indicadores'){body=`<p class="gov-context">${esc(t.context)}</p><div class="gov-indicators">${D.indicatorDefs.map(m=>{
 const a=series(t.from)[m.id],b=series(t.to)[m.id],d=delta(t,m);return `<article class="gov-metric"><header><strong>${esc(m.title)}</strong><b>${esc(diff(d,m))}</b></header><p><span>${t.from}<strong>${num(a,m)}</strong></span><span aria-hidden="true">→</span><span>${t.to}<strong>${num(b,m)}</strong></span></p><button data-gov-metric="${m.id}" data-term="${t.id}">Desglose y metodología ↗</button></article>`;}).join('')}</div>${score()}`;}
else if(tab==='medidas'){body=`<h4>Actuaciones documentadas y contraste de promesas</h4><div class="gov-actions">${t.events.length?t.events.map((x,i)=>`<article><small>${esc(x.year)} · ${esc(x.type)}${x.referenceOnly?' · antecedente':''}</small><h5>${esc(x.title)}</h5><p>${esc(x.action)}</p><button data-gov-action="${i}" data-term="${t.id}">Objetivo, actuación, resultado y nota ↗</button></article>`).join(''):'<p class="gov-muted">N/D · Medidas históricas pendientes de revisión documental. No implica que el gobierno no aprobara reformas.</p>'}</div><p class="gov-muted"><b>Promesas y cumplimiento: N/D.</b> Faltan programas originales cotejados y una matriz de compromisos medibles para cada legislatura.</p>${score()}`;}
else {const cases=D.judicial.filter(x=>x.periodId===t.id);body=`<h4>Contexto y crisis</h4><p class="gov-context">${esc(t.context)}</p><h4>Justicia y corrupción</h4>${cases.length?cases.map(c=>`<div class="gov-judicial"><small>${esc(c.date)} · ${esc(c.status)}</small><h5>${esc(c.title)}</h5><p>${esc(c.summary)}</p><p><em>${esc(c.classification)}</em></p>${href(c.source,'Ver fuente judicial / documental')}</div>`).join(''):'<p class="gov-muted">No hay casos incluidos en esta revisión parcial. Esto no equivale a ausencia de procedimientos.</p>'}<p class="gov-muted">Perjuicio económico probado, restitución y beneficio ilícito: <b>N/D</b> sin importes y resoluciones contrastados. Las investigaciones no se puntúan como condenas.</p>${score()}`;}
return `<article class="panel gov-panel">${head(t)}${body}</article>`;
}
function dialog(title,fields,url){el('govDialogTitle').textContent=title;el('govDialogContent').innerHTML=fields.map(([label,text])=>`<div class="gov-modal-row"><strong>${esc(label)}</strong><p>${esc(text)}</p></div>`).join('')+(url?`<p>${href(url,'Consultar fuente')}</p>`:'');if(typeof el('govDialog').showModal==='function')el('govDialog').showModal();}
function details(){el('governmentComparison').querySelectorAll('[data-gov-metric]').forEach(b=>b.addEventListener('click',()=>{const t=byId[b.dataset.term],m=D.indicatorDefs.find(x=>x.id===b.dataset.govMetric);dialog(m.title+' · '+t.period,[['Objetivo / problema',m.note],['Actuación realizada','Los datos anuales, por sí solos, no documentan una actuación o un efecto causal del Gobierno. Las medidas acreditadas figuran en «Acciones y promesas».'],['Resultado medido',`${t.from}: ${num(series(t.from)[m.id],m)}; ${t.to}: ${num(series(t.to)[m.id],m)}; cambio ${diff(delta(t,m),m)}.`],['Razón de la nota','N/D: falta una evaluación con criterios consistentes y evidencia del efecto de las decisiones.']],m.url);}));
el('governmentComparison').querySelectorAll('[data-gov-action]').forEach(b=>b.addEventListener('click',()=>{const t=byId[b.dataset.term],x=t.events[Number(b.dataset.govAction)];dialog(x.title,[['Objetivo / problema',x.objective],['Actuación real',x.action],['Resultado verificable',x.result],['Razón de la nota','N/D: la publicación de una norma acredita su aprobación, pero no permite inferir su impacto neto ni el cumplimiento íntegro de un programa.']],x.url);}));
}
function draw(){const t1=byId[A.value],t2=byId[B.value];if(!t1||!t2)return;
el('govViewTitle').textContent=tab==='indicadores'?'Indicadores: entrada → salida':tab==='medidas'?'Acciones, compromisos y resultados':'Crisis y situación judicial';
el('governmentComparison').innerHTML=`<div class="gov-comparison-grid">${panel(t1)}${panel(t2)}</div>`;
document.querySelectorAll('[data-gov-tab]').forEach(b=>{const on=b.dataset.govTab===tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});details();
}
function chart(){const m=D.indicatorDefs.find(x=>x.id===M.value),data=Object.entries(D.series).map(([y,o])=>({y,v:o[m.id]})).filter(x=>Number.isFinite(x.v));
if(!data.length){el('govSeries').innerHTML='<p>N/D · serie todavía no contrastada.</p>';return;}
const lo=Math.min(...data.map(x=>x.v)),span=Math.max(.1,Math.max(...data.map(x=>x.v))-lo);
el('govSeries').innerHTML=`<div class="gov-chart-head"><strong>${esc(m.title)} · ${esc(m.unit)}</strong>${href(m.url,m.source)}</div><div class="gov-bars">${data.map(x=>`<div class="gov-bar-col"><span class="gov-bar" tabindex="0" style="height:${Math.round(12+(x.v-lo)/span*84)}%" title="${esc(x.y)}: ${esc(num(x.v,m))}" aria-label="${esc(x.y)}: ${esc(num(x.v,m))}"></span><small>${Number(x.y)%5===0||x.y==='2025'?x.y:''}</small></div>`).join('')}</div><p class="gov-small">Valores anuales de España; cada barra muestra su cifra exacta al pasar el cursor. Los años de transición pueden incluir decisiones de dos gobiernos.</p>`;
}
function party(){let totals=['PP','PSOE'].map(k=>{const rows=D.terms.filter(t=>leaders[t.leader].party===k);let sums=['debtGDP','unemploymentILO'].map(id=>{const m=D.indicatorDefs.find(x=>x.id===id),values=rows.map(t=>delta(t,m)).filter(Number.isFinite);return values.length?(values.reduce((a,b)=>a+b,0)/values.length):null;});
return `<article class="gov-party-average"><b>${k}</b><span>${rows.length} periodos con el mismo peso</span><p>Deuda: <strong>${diff(sums[0],D.indicatorDefs[0])}</strong></p><p>Desempleo: <strong>${diff(sums[1],D.indicatorDefs[1])}</strong></p></article>`});el('govPartySummary').innerHTML=totals.join('');}
function sources(){el('govSources').innerHTML=`<h3>Metodología y fuentes</h3><p>${esc(D.method.yearPolicy)}</p><p>${esc(D.method.disclaimer)}</p><p><strong>Nota:</strong> ${esc(D.method.score)}</p><p><strong>Justicia:</strong> ${esc(D.method.judicial)}</p><ul>${D.method.sources.map(x=>`<li>${href(x.url,x.label)}</li>`).join('')}</ul><h4>Indicadores pendientes</h4><div class="gov-pending">${D.moreDomains.map(x=>`<article><strong>${esc(x.label)} · N/D</strong><p>${esc(x.reason)}</p></article>`).join('')}</div>`;}
for(const t of D.terms){for(const sel of [A,B]){const o=document.createElement('option');o.value=t.id;o.textContent=t.period+' · '+t.from+'–'+t.to;sel.appendChild(o);}}
for(const m of D.indicatorDefs){const o=document.createElement('option');o.value=m.id;o.textContent=m.title;M.appendChild(o);}
A.value='zapatero1';B.value='sanchez3';M.value='debtGDP';
document.querySelectorAll('[data-gov-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.govTab;draw();}));
for(const sel of [A,B])sel.addEventListener('change',draw);
M.addEventListener('change',chart);
el('govSwap').addEventListener('click',()=>{const tmp=A.value;A.value=B.value;B.value=tmp;draw();});
el('govCloseDialog').addEventListener('click',()=>{if(typeof el('govDialog').close==='function')el('govDialog').close();});
el('govDialog').addEventListener('click',ev=>{if(ev.target===el('govDialog')&&typeof ev.target.close==='function')ev.target.close();});
sources();party();chart();draw();
})();}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();})();
