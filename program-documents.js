'use strict';
/* The document library consumes the same verified, versioned data as the affinity sources.
 * It never collects or stores visitor information or answers. */
(function(){
  const el=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[ch]));
  const dateText=date=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return 'Fecha no indicada';
    return new Date(date+'T12:00:00Z').toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'});
  };
  const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const safeUrl=url=>{try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}catch(_){return null;}};
  function init(){
    const bank=window.AFFINITY_BANK;
    if(!bank||!Array.isArray(bank.programmes)||!el('documentsLibrary'))return;
    const party=el('documentsParty'),kind=el('documentsKind'),search=el('documentsSearch'),target=el('documentsLibrary');
    for(const p of bank.programmes){
      const option=document.createElement('option');option.value=p.key;option.textContent=p.label||p.key;party.appendChild(option);
    }
    const draw=()=>{
      const query=normalize(search.value.trim());
      const cards=[];let total=0;
      for(const p of bank.programmes){
        if(party.value!=='all'&&party.value!==p.key)continue;
        const base={title:p.type||'Programa electoral',type:p.type||'Programa / manifiesto',year:p.year,date:null,url:p.url,territory:p.territory,kind:'programme'};
        const docs=[base,...(p.supplementaryDocuments||[]).map(d=>({...d,kind:'supplement',territory:p.territory}))];
        const matched=docs.filter(d=>(kind.value==='all'||kind.value===d.kind)&&(!query||normalize([p.label,p.key,p.territory,d.title,d.type,d.year,d.note].join(' ')).includes(query)));
        if(!matched.length)continue;
        matched.sort((a,b)=>Number(b.year||0)-Number(a.year||0)||(b.date||'').localeCompare(a.date||''));
        total+=matched.length;
        const entries=matched.map(d=>{
          const href=safeUrl(d.url),isMain=d.kind==='programme',isManifesto=isMain&&/manifiesto/i.test(d.type||'');
          const classification=isMain?(isManifesto?'Manifiesto / referencia histórica':'Programa / referencia histórica'):'Documento de campaña · complementario';
          const year=Number(d.year)||'Sin año';
          return `<li class="documents-item">
            <div class="documents-item-top"><span class="documents-tag ${isMain?'is-programme':'is-supplement'}">${esc(classification)}</span><span class="documents-year">${esc(year)}${d.date?' · '+esc(dateText(d.date)):''}</span></div>
            <div class="documents-item-body"><h3>${esc(d.title||d.type||'Documento electoral')}</h3><p>${esc(d.type||'Documento electoral')}${d.note?' · '+esc(d.note):''}</p></div>
            ${href?`<a class="documents-open" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Leer ${esc(d.title||d.type)} de ${esc(p.label||p.key)} (abre sitio externo)">Leer documento ↗</a>`:'<span class="documents-no-link">Enlace no disponible</span>'}
          </li>`;
        }).join('');
        cards.push(`<article class="documents-party panel" aria-label="${esc(p.label||p.key)}">
          <header class="documents-party-heading"><div><span class="panel-eyebrow">${esc(p.territory||'España')}</span><h2>${esc(p.label||p.key)}</h2></div><span class="documents-party-count">${matched.length} ${matched.length===1?'documento':'documentos'}</span></header>
          <ul class="documents-items">${entries}</ul>
        </article>`);
      }
      target.innerHTML=cards.join('')||'<p class="documents-empty">No se han encontrado documentos con estos filtros.</p>';
      el('documentsCount').textContent=`${total} ${total===1?'documento disponible':'documentos disponibles'} · ${cards.length} ${cards.length===1?'formación':'formaciones'}`;
    };
    [party,kind].forEach(node=>node.addEventListener('change',draw));search.addEventListener('input',draw);
    draw();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
