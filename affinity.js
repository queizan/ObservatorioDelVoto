'use strict';
(() => {
  const BANK = window.AFFINITY_BANK;
  const CFG = window.AFFINITY_PUBLIC_CONFIG || {};
  if (!BANK || !Array.isArray(BANK.questions)) return;
  const el = id => document.getElementById(id);
  const partyInfo = {
    PP:{label:'PP',color:'#1767b2'},
    PSOE:{label:'PSOE',color:'#e0454d'},
    VOX:{label:'Vox',color:'#5c9739'},
    SUMAR:{label:'Sumar',color:'#d64d9b'}
  };
  const answerLabels=[
    [-2,'Muy en desacuerdo'],[-1,'En desacuerdo'],[0,'Ni de acuerdo ni en desacuerdo'],
    [1,'De acuerdo'],[2,'Muy de acuerdo'],['skip','Prefiero no responder']
  ];
  const state={questions:[],answers:new Map(),index:0,result:null,publicMode:'primary'};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const backendReady=()=>CFG.enabled===true && /^https:\/\/[a-z0-9.-]+$/i.test(CFG.supabaseUrl||'') && /^[-\w.]+$/.test(CFG.publishableKey||'');
  const deviceKey='observatorio-affinity-published-'+BANK.version;
  const readLocal=key=>{try{return localStorage.getItem(key)}catch{return null;}};
  const writeLocal=(key,value)=>{try{localStorage.setItem(key,value);return true;}catch{return false;}};
  const formatN=n=>Number(n).toLocaleString('es-ES');
  const endpoint=path=>CFG.supabaseUrl.replace(/\/$/,'')+'/rest/v1/'+path;
  function reqHeaders(){
    const h={'apikey':CFG.publishableKey,'Content-Type':'application/json'};
    if(CFG.publishableKey.startsWith('eyJ'))h['Authorization']='Bearer '+CFG.publishableKey;
    return h;
  }
  // Shuffle with modern CSPRNG where available; no external script or tracking required.
  function shuffle(values){
    const a=[...values];
    const random=max=>{
      if(globalThis.crypto?.getRandomValues){const b=new Uint32Array(1);globalThis.crypto.getRandomValues(b);return b[0]%max;}
      return Math.floor(Math.random()*max);
    };
    for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  // Stratification prevents 20 independently sampled items from omitting whole topic groups.
  function drawQuestions(){
    const groups=new Map();
    for(const q of BANK.questions){if(!groups.has(q.topic))groups.set(q.topic,[]);groups.get(q.topic).push(q);}
    const first=[...groups.values()].map(q=>shuffle(q)[0]);
    const selectedIds=new Set(first.map(q=>q.id));
    const remaining=shuffle(BANK.questions.filter(q=>!selectedIds.has(q.id)));
    return shuffle([...first,...remaining].slice(0,BANK.questionCount));
  }
  function initTest(){
    const programmes=BANK.programmes.map(p=>`<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(p.key==='SUMAR'?'Sumar':p.key)}</strong><span>Programa general 2023 ↗</span></a>`).join('');
    el('affinityProgrammeSources').innerHTML=programmes;
    el('affinityApp').innerHTML=`<div class="affinity-welcome"><div class="affinity-welcome-icon">20<span>Q</span></div><p class="panel-eyebrow">CUESTIONARIO DE AFINIDAD · 2023</p><h2>¿Qué propuestas encajan con tus ideas?</h2><p>Responderás a 20 afirmaciones seleccionadas de un banco de ${BANK.questions.length}. Las preguntas cambian y el orden es aleatorio. Al terminar verás los dos programas más próximos a tus respuestas, con el detalle de los cuatro.</p><div class="affinity-chips"><span>⏱ 4–6 minutos</span><span>Sin registro</span><span>Sin envío de respuestas</span></div><button type="button" class="button button-dark affinity-start" id="startAffinity">Empezar las 20 preguntas <span aria-hidden="true">↗</span></button></div>`;
    el('startAffinity').addEventListener('click',startTest);
  }
  function startTest(){state.questions=drawQuestions();state.answers=new Map();state.index=0;state.result=null;renderQuestion();}
  function renderQuestion(){
    const q=state.questions[state.index];
    const current=state.answers.get(q.id);
    const progress=Math.round(state.index/state.questions.length*100);
    el('affinityApp').innerHTML=`<div class="affinity-quiz-header"><span class="panel-eyebrow">${esc(q.topic.toUpperCase())} · 20 PREGUNTAS</span><strong>${state.index+1} <span>/ ${state.questions.length}</span></strong></div>
    <div class="affinity-progress" role="progressbar" aria-valuemin="0" aria-valuemax="20" aria-valuenow="${state.index}"><span style="width:${progress}%"></span></div>
    <h2 class="affinity-question">${esc(q.text)}</h2><p class="affinity-question-lead">¿Hasta qué punto estás de acuerdo con esta afirmación?</p>
    <form id="affinityForm"><fieldset><legend class="sr-only">Selecciona tu respuesta</legend><div class="affinity-answer-list">${answerLabels.map(([value,label])=>`<label class="affinity-answer ${current===value?'checked':''}"><input type="radio" name="affinityAnswer" value="${value}" ${current===value?'checked':''}/><span class="affinity-answer-radio" aria-hidden="true"></span>${esc(label)}</label>`).join('')}</div></fieldset>
    <div class="affinity-quiz-footer"><button type="button" id="affinityPrevious" class="button button-outline" ${state.index===0?'disabled':''}>← Anterior</button><a href="${esc(q.source)}" class="affinity-question-source" target="_blank" rel="noopener noreferrer">Ver propuestas de este tema ↗</a><button type="submit" id="affinityNext" class="button button-dark" ${current===undefined?'disabled':''}>${state.index===state.questions.length-1?'Ver mi afinidad →':'Siguiente →'}</button></div></form>
    <p class="affinity-question-disclaimer">La puntuación refleja una lectura editorial de los programas electorales de 2023. Las preguntas no citan literalmente un programa.</p>`;
    el('affinityForm').addEventListener('change',e=>{
      const v=e.target.value==='skip'?'skip':Number(e.target.value);
      state.answers.set(q.id,v);
      el('affinityNext').disabled=false;
      el('affinityApp').querySelectorAll('.affinity-answer').forEach(label=>label.classList.toggle('checked',label.querySelector('input').checked));
    });
    el('affinityForm').addEventListener('submit',e=>{
      e.preventDefault();
      if(!state.answers.has(q.id))return;
      if(state.index<state.questions.length-1){state.index++;renderQuestion();}
      else finishTest();
    });
    el('affinityPrevious').addEventListener('click',()=>{if(state.index>0){state.index--;renderQuestion();}});
  }
  function affinityScores(){
    const rows=state.questions.filter(q=>state.answers.has(q.id)&&state.answers.get(q.id)!=='skip');
    return Object.keys(partyInfo).map(key=>{
      // Programmatic closeness = average 1 - |answer - programme score| / 4.
      const values=rows.map(q=>1-Math.abs(state.answers.get(q.id)-q.positions[key])/4);
      return {key,score:Math.round((values.reduce((sum,v)=>sum+v,0)/(values.length||1))*1000)/10};
    }).sort((a,b)=>b.score-a.score||a.key.localeCompare(b.key));
  }
  function finishTest(){
    const answered=state.questions.filter(q=>state.answers.has(q.id)&&state.answers.get(q.id)!=='skip').length;
    if(answered<12){
      el('affinityApp').innerHTML=`<div class="affinity-insufficient"><p class="panel-eyebrow">RESPUESTAS INSUFICIENTES</p><h2>Necesitamos algo más de información</h2><p>Has respondido ${answered} preguntas. Para evitar resultados poco estables, responde al menos 12 de las 20 antes de calcular la coincidencia.</p><button id="affinityReview" type="button" class="button button-dark">Revisar mis respuestas ↗</button></div>`;
      el('affinityReview').addEventListener('click',()=>{const i=state.questions.findIndex(q=>state.answers.get(q.id)==='skip'||!state.answers.has(q.id));state.index=Math.max(0,i);renderQuestion();});
      return;
    }
    const scores=affinityScores();state.result={scores,primary:scores[0].key,secondary:scores[1].key,answered};renderResult();
  }
  function resultRow(row,i){
    const p=partyInfo[row.key];
    return `<div class="affinity-score-row"><div class="affinity-score-head"><span class="party-name"><i class="party-dot" style="background:${p.color}"></i>${p.label}</span><strong>${row.score.toFixed(1).replace('.',',')} <small>/ 100</small></strong></div><div class="affinity-score-track"><span style="width:${row.score}%;background:${p.color}"></span></div></div>`;
  }
  function renderResult(){
    const r=state.result;
    const best=partyInfo[r.primary],second=partyInfo[r.secondary];
    const hasTie=Math.abs(r.scores[0].score-r.scores[1].score)<2;
    const shared=readLocal(deviceKey)==='yes';
    el('affinityApp').innerHTML=`<div class="affinity-result"><p class="panel-eyebrow">TU COINCIDENCIA PROGRAMÁTICA · ${r.answered} RESPUESTAS</p><h2>Dos programas más próximos a tus respuestas</h2><p class="affinity-result-lead">Una comparación orientativa entre las propuestas de 2023 de los cuatro partidos incluidos.</p><div class="affinity-top-two"><div class="affinity-top-card"><small>1.ª AFINIDAD</small><strong style="color:${best.color}">${best.label}</strong><span>${r.scores[0].score.toFixed(1).replace('.',',')} / 100 puntos</span></div><div class="affinity-top-card"><small>2.ª AFINIDAD</small><strong style="color:${second.color}">${second.label}</strong><span>${r.scores[1].score.toFixed(1).replace('.',',')} / 100 puntos</span></div></div>${hasTie?'<p class="affinity-tie-notice">Los dos primeros resultados están muy próximos; se trata prácticamente de un empate en este cuestionario.</p>':''}
    <div class="affinity-all-scores">${r.scores.map(resultRow).join('')}</div><p class="affinity-score-caption">Los puntos expresan similitud con las posiciones editoriales asignadas en este test (0–100), <strong>no</strong> porcentaje de voto, probabilidad ni respaldo político. No son posiciones oficiales avaladas por los partidos.</p>
    <div class="affinity-actions"><button type="button" id="affinityRestart" class="button button-outline">↺ Repetir cuestionario</button><button type="button" id="affinitySave" class="button button-outline">Guardar en este dispositivo</button></div>
    <div class="affinity-participate"><p class="panel-eyebrow">ESTADÍSTICAS VOLUNTARIAS</p><h3>¿Quieres contribuir al gráfico público?</h3><p>Solo se sumarían tus dos partidos más afines a unos contadores agregados. No se enviarán ni conservarán en la base de datos tus respuestas a las 20 preguntas. El proveedor técnico puede tratar datos de conexión según su propia política.</p>
    <label class="affinity-consent"><input type="checkbox" id="affinityConsent" ${shared?'disabled':''}/> <span>Consiento expresamente contribuir con mis dos etiquetas de afinidad al recuento agregado. Sé que, al no guardarse un registro individual, no podré retirar posteriormente mi contribución del total.</span></label>
    <button type="button" id="affinityPublish" class="button button-dark" disabled>${shared?'Ya incorporado desde este navegador':'Compartir mis dos afinidades'}</button><p id="affinityPublishMessage" role="status">${!backendReady()?'La publicación está pendiente de configurar una base de datos y el aviso de privacidad; el test funciona sin ella.':shared?'Este navegador ya contribuyó al recuento.':'Compartir es opcional: tu resultado sigue siendo privado si no pulsas este botón.'}</p></div></div>`;
    el('affinityRestart').addEventListener('click',startTest);
    el('affinitySave').addEventListener('click',()=>{
      const ok=writeLocal('observatorio-affinity-saved',JSON.stringify({scores:r.scores,answered:r.answered,at:new Date().toISOString()}));
      el('affinitySave').textContent=ok?'✓ Guardado en este dispositivo':'No se puede guardar en este navegador';
      el('affinitySave').disabled=true;
    });
    const publish=el('affinityPublish');
    el('affinityConsent').addEventListener('change',e=>{publish.disabled=!(e.target.checked&&backendReady()&&!shared);});
    publish.addEventListener('click',async()=>{
      if(!el('affinityConsent').checked||!backendReady()||readLocal(deviceKey)==='yes')return;
      publish.disabled=true;el('affinityPublishMessage').textContent='Enviando únicamente las dos etiquetas seleccionadas…';
      try{
        const res=await fetch(endpoint('rpc/submit_affinity_vote'),{method:'POST',headers:reqHeaders(),body:JSON.stringify({p_first:r.primary,p_second:r.secondary})});
        if(!res.ok)throw Error('HTTP '+res.status);
        writeLocal(deviceKey,'yes');publish.textContent='✓ Gracias por participar';
        el('affinityPublishMessage').textContent='Tu contribución se ha incorporado al recuento público.';
        await refreshPublicStats();
      }catch(e){el('affinityPublishMessage').textContent='No se pudo publicar ('+e.message+'). Puedes conservar tu resultado sin compartirlo.';publish.disabled=false;}
    });
  }
  async function refreshPublicStats(){
    const target=el('affinityPublicChart');if(!target)return;
    if(!backendReady()){
      target.innerHTML='<div class="affinity-chart-unavailable"><strong>Estadísticas compartidas, próximamente</strong><p>El cuestionario funciona ya; los resultados públicos se mostrarán cuando se configure una base de datos que almacene únicamente contadores agregados. No se presentan cifras inventadas.</p></div>';
      return;
    }
    try{
      const res=await fetch(endpoint('affinity_totals?select=party,first_count,second_count'),{headers:reqHeaders(),cache:'no-store'});
      if(!res.ok)throw Error('HTTP '+res.status);
      const records=await res.json();
      if(!Array.isArray(records))throw Error('Formato de estadísticas inválido');
      const counts=Object.fromEntries(Object.keys(partyInfo).map(key=>[key,{primary:0,secondary:0}]));
      for(const r of records)if(counts[r.party]){
        counts[r.party].primary=Math.max(0,Number(r.first_count)||0);
        counts[r.party].secondary=Math.max(0,Number(r.second_count)||0);
      }
      const total=Object.values(counts).reduce((s,x)=>s+x.primary,0);
      if(!total){target.innerHTML='<div class="affinity-chart-unavailable"><strong>El contador está en cero</strong><p>Sé la primera persona en compartir voluntariamente tus coincidencias programáticas.</p></div>';return;}
      const mode=state.publicMode;
      const rows=Object.entries(counts).sort((a,b)=>b[1][mode]-a[1][mode]);
      target.innerHTML=`<div class="affinity-stat-head"><strong>${formatN(total)} <span>participaciones voluntarias</span></strong><div class="affinity-stat-switch"><button type="button" data-affinity-mode="primary" aria-pressed="${mode==='primary'}" class="${mode==='primary'?'active':''}">Primera afinidad</button><button type="button" data-affinity-mode="secondary" aria-pressed="${mode==='secondary'}" class="${mode==='secondary'?'active':''}">Segunda afinidad</button></div></div><div class="affinity-stat-bars">${rows.map(([key,c])=>`<div class="affinity-stat-row"><span class="party-name"><i class="party-dot" style="background:${partyInfo[key].color}"></i>${partyInfo[key].label}</span><div class="affinity-stat-track"><i style="width:${Math.min(100,c[mode]/total*100)}%;background:${partyInfo[key].color}"></i></div><b>${formatN(c[mode])}</b><small>${(c[mode]/total*100).toFixed(1).replace('.',',')} %</small></div>`).join('')}</div>`;
      target.querySelectorAll('[data-affinity-mode]').forEach(b=>b.addEventListener('click',()=>{state.publicMode=b.dataset.affinityMode;refreshPublicStats();}));
    }catch(e){target.innerHTML=`<div class="affinity-chart-unavailable"><strong>Resultados no disponibles temporalmente</strong><p>No se han podido consultar los contadores de participación. Inténtalo más tarde.</p></div>`;}
  }
  function boot(){initTest();refreshPublicStats();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
