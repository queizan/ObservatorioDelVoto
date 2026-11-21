'use strict';
/* Programas y documentos: consulta local de fuentes verificadas, sin preguntas ni recogida de respuestas. */
(function(){
  function initialize(){(function programmeDocumentsApp(){
  'use strict';
  const data=window.PROGRAMMES_DATA;
  const el=id=>document.getElementById(id);
  if(!data||!Array.isArray(data.parties)||!el('documentsLibrary'))return;
  const partyMap=new Map(data.parties.map(p=>[p.key,p]));
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=x=>{try{const u=new URL(x);return u.protocol==='https:'?u.href:null;}catch(_){return null;}};
  const clean=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const docDate=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')?new Date(x+'T12:00:00Z').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}):'';
  const a=el('compareProgrammeA'),b=el('compareProgrammeB'),t=el('compareProgrammeTopic'),result=el('programmeComparison');
  let allMode=false;
  function fill(){
    for(const p of data.parties)for(const s of [a,b,el('documentsParty')]){
      const o=document.createElement('option');o.value=p.key;o.textContent=p.label;s.appendChild(o);
    }
    for(const topic of data.topics){const o=document.createElement('option');o.value=topic.key;o.textContent=topic.label;t.appendChild(o);}
    a.value='PP';b.value='PSOE';el('documentsParty').value='all';
  }
  function policyCard(p,topic){
    const info=data.positions[p.key]?.[topic.key]||null;
    const status=p.year===2026?'Programa 2026':'Programa histórico '+esc(p.year);
    const txt=info?`<p class="programme-summary">${esc(info.summary)}</p>`:`<p class="programme-missing"><strong>Sin propuesta verificable en las fuentes revisadas.</strong> Esto no significa necesariamente que el partido no trate este tema.</p>`;
    const url=info&&safeUrl(info.sourceUrl);
    return `<article class="programme-position" aria-label="${esc(p.label)} · ${esc(topic.label)}">
      <header><h4>${esc(p.label)}</h4><span class="${p.year===2026?'programme-current':'programme-legacy'}">${status}</span></header>
      ${txt}
      ${url?`<a class="programme-source" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Consultar fuente · ${esc(info.sourceTitle)} ↗</a>`:
      `<a class="programme-source" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Consultar programa disponible ↗</a>`}
    </article>`;
  }
  function drawCompare(){
    const topics=t.value==='all'?data.topics:data.topics.filter(q=>q.key===t.value);
    const selected=allMode?data.parties:[partyMap.get(a.value),partyMap.get(b.value)].filter(Boolean);
    const sections=topics.map(topic=>`<section class="programme-topic-section">
      <header class="programme-topic-heading"><p class="panel-eyebrow">COMPARACIÓN POR MATERIA</p><h3>${esc(topic.label)}</h3><p>${esc(topic.description)}</p></header>
      <div class="${allMode?'programme-position-grid all-parties':'programme-position-grid'}">${selected.map(p=>policyCard(p,topic)).join('')}</div>
    </section>`);
    result.innerHTML=sections.join('');
    el('comparisonResultCount').textContent=allMode?`${selected.length} formaciones · ${topics.length} tema`+(topics.length!==1?'s':''):`${topics.length} tema${topics.length!==1?'s':''} · ${selected.length} partidos`;
    el('programmeShowAll').textContent=allMode?'Comparar solo dos partidos':'Ver todas las formaciones';
    el('programmeShowAll').setAttribute('aria-pressed',String(allMode));
    el('comparisonPair').hidden=allMode;
    el('comparisonPairSwap').hidden=allMode;
  }
  function drawLibrary(){
    const selected=el('documentsParty').value, kind=el('documentsKind').value, query=clean(el('documentsSearch').value.trim());
    const cards=[];let count=0;
    for(const p of data.parties){
      if(selected!=='all'&&selected!==p.key)continue;
      const docs=[{title:p.type,type:p.type,year:p.year,url:p.url,kind:'programme'},
        ...(p.history||[]).map(x=>({...x,kind:'historic'})),
        ...(p.supplementaryDocuments||[]).map(x=>({...x,kind:'supplement'}))];
      const matched=docs.filter(x=>(kind==='all'||kind===x.kind)&&(!query||clean([p.label,p.key,p.territory,x.title,x.note,x.type,x.year].join(' ')).includes(query)));
      if(!matched.length)continue;
      count+=matched.length;
      const rows=matched.map(doc=>{
        const tag=doc.kind==='supplement'?'Complemento de campaña':doc.kind==='historic'?'Programa histórico':'Programa de referencia';
        const url=safeUrl(doc.url);
        return `<li class="documents-item"><div class="documents-item-top"><span class="documents-tag ${doc.kind==='programme'?'is-programme':'is-supplement'}">${esc(tag)}</span><span class="documents-year">${esc(doc.year||'')}${doc.date?' · '+esc(docDate(doc.date)):''}</span></div>
          <div class="documents-item-body"><h3>${esc(doc.title||doc.type)}</h3><p>${esc(doc.note||doc.type||'')}</p></div>
          ${url?`<a class="documents-open" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Leer fuente ↗</a>`:'<span class="documents-no-link">No hay enlace disponible</span>'}</li>`;
      }).join('');
      cards.push(`<article class="documents-party panel"><header class="documents-party-heading"><div><span class="panel-eyebrow">${esc(p.territory)}</span><h2>${esc(p.label)}</h2></div><span class="documents-party-count">${matched.length} documentos</span></header><ul class="documents-items">${rows}</ul></article>`);
    }
    el('documentsLibrary').innerHTML=cards.join('')||'<p class="documents-empty">No hay documentos que coincidan con la búsqueda.</p>';
    el('documentsCount').textContent=`${count} documentos · ${cards.length} formaciones`;
  }
  function showTab(tab){
    const compare=tab==='compare';
    el('programmeCompareView').hidden=!compare;el('programmeLibraryView').hidden=compare;
    for(const btn of document.querySelectorAll('[data-programme-tab]')){
      const on=btn.dataset.programmeTab===tab;
      btn.classList.toggle('active',on);btn.setAttribute('aria-selected',String(on));
    }
  }
  fill();
  for(const node of [a,b,t])node.addEventListener('change',drawCompare);
  el('comparisonPairSwap').addEventListener('click',()=>{const v=a.value;a.value=b.value;b.value=v;drawCompare();});
  el('programmeShowAll').addEventListener('click',()=>{allMode=!allMode;if(allMode&&t.value==='all')t.value='vivienda';drawCompare();});
  for(const btn of document.querySelectorAll('[data-programme-tab]'))btn.addEventListener('click',()=>showTab(btn.dataset.programmeTab));
  for(const id of ['documentsParty','documentsKind'])el(id).addEventListener('change',drawLibrary);
  el('documentsSearch').addEventListener('input',drawLibrary);
  drawCompare();drawLibrary();showTab('compare');
})();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
})();
