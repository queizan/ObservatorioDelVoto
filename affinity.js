'use strict';
(function affinityModule(){
  const BANK=window.AFFINITY_BANK;
  const CFG=window.AFFINITY_PUBLIC_CONFIG||{};
  if(!BANK||!Array.isArray(BANK.questions))return;
  const el=id=>document.getElementById(id);
  const color={PP:"#1767b2",PSOE:"#e0454d",VOX:"#5c9739",SUMAR:"#d64d9b",ERC:"#e0a621",JUNTS:"#36aab7",BILDU:"#83ab58",PNV:"#277653",BNG:"#79a7bf",PACMA:"#aa9c43",CC:"#bf793d"};
  const parties=Object.fromEntries(BANK.programmes.map(p=>[p.key,{label:p.key==="BILDU"?"EH Bildu":p.key==="JUNTS"?"Junts":p.key,territory:p.territory,color:color[p.key]||"#77868a"}]));
  const labels=[[-2,"Muy en desacuerdo"],[-1,"En desacuerdo"],[0,"Ni de acuerdo ni en desacuerdo"],[1,"De acuerdo"],[2,"Muy de acuerdo"],["skip","Prefiero no responder"]];
  const s={questions:[],answers:new Map(),idx:0,result:null,shared:false,schemaReady:false};
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmt=v=>Number(v).toLocaleString("es-ES");
  const pct=v=>v.toFixed(1).replace(".",",");
  const ready=()=>CFG.enabled===true&&/^https:\/\/[a-z0-9.-]+$/i.test(CFG.supabaseUrl||"")&&/^[-\w.]+$/.test(CFG.publishableKey||"");
  const endpoint=x=>CFG.supabaseUrl.replace(/\/$/,"")+"/rest/v1/"+x;
  const headers=()=>{return {"apikey":CFG.publishableKey,"Content-Type":"application/json"};};
  function shuffle(a){
    const b=[...a];
    for(let i=b.length-1;i>0;i--){
      let n;
      if(globalThis.crypto?.getRandomValues){const u=new Uint32Array(1);crypto.getRandomValues(u);n=u[0]%(i+1);}
      else n=Math.floor(Math.random()*(i+1));
      [b[i],b[n]]=[b[n],b[i]];
    }
    return b;
  }
  // One item per topic first, then fresh random rounds: 30 questions from 21 diverse topics.
  function draw(){
    const groups=new Map();
    for(const q of BANK.questions){if(!groups.has(q.topic))groups.set(q.topic,[]);groups.get(q.topic).push(q);}
    const buckets=shuffle([...groups.values()]).map(g=>shuffle(g));
    const chosen=[];
    while(chosen.length<BANK.questionCount && buckets.some(b=>b.length)){
      for(const b of shuffle(buckets)){if(b.length&&chosen.length<BANK.questionCount)chosen.push(b.pop());}
    }
    return shuffle(chosen);
  }
  function init(){
    // Discard any user-specific browser records created by earlier prototypes.
    try{localStorage.removeItem("observatorio-affinity-saved");for(const k of Object.keys(localStorage)){if(k.startsWith("observatorio-affinity-published-"))localStorage.removeItem(k);}}catch(e){}
    el("affinityProgrammeSources").innerHTML=BANK.programmes.map(p=>`<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(p.label||p.key)}</strong><span>${esc(p.type||"Programa 2023")} · ${esc(p.territory||"España")} ↗</span></a>`).join("");
    welcome();refreshStats();
  }
  function welcome(){
    el("affinityApp").innerHTML=`<div class="affinity-welcome"><div class="affinity-welcome-icon">${BANK.questionCount}<span>Q</span></div><p class="panel-eyebrow">EXPERIMENTO INDEPENDIENTE · NO OFICIAL</p><h2>¿Con qué propuestas coincides?</h2><p>Responde a <strong>${BANK.questionCount} preguntas aleatorias</strong> de un banco de ${BANK.questions.length} repartidas en ${new Set(BANK.questions.map(q=>q.topic)).size} temas. Se incluye una selección documentada de ${BANK.parties.length} formaciones con programas o manifiestos de 2023, también partidos territoriales. Puedes consultar las fuentes originales.</p><div class="affinity-chips"><span>Sin cuenta</span><span>Sin almacenar respuestas</span><span>Participación opcional</span></div><p class="affinity-muted">No es una encuesta oficial, una muestra representativa ni una recomendación electoral. Las coincidencias son interpretaciones orientativas y no se pueden comparar con intención real de voto.</p><button id="startAffinity" type="button" class="button button-dark affinity-start">Empezar las ${BANK.questionCount} preguntas ↗</button></div>`;
    el("startAffinity").addEventListener("click",start);
  }
  function start(){s.questions=draw();s.answers=new Map();s.idx=0;s.result=null;s.shared=false;renderQ();}
  function renderQ(){
    const q=s.questions[s.idx],n=s.questions.length,chosen=s.answers.get(q.id),pos=s.idx+1;
    el("affinityApp").innerHTML=`<div class="affinity-quiz-header"><span class="panel-eyebrow">${esc(q.topic.toUpperCase())} · CUESTIONARIO NO OFICIAL</span><strong>${pos} <span>/ ${n}</span></strong></div><div class="affinity-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${s.idx}" aria-label="Progreso"><span style="width:${(s.idx/n*100).toFixed(2)}%"></span></div><h2 class="affinity-question">${esc(q.text)}</h2><p class="affinity-question-lead">Elige una respuesta. Pasarás automáticamente a la siguiente pregunta.</p><form id="affinityForm"><fieldset><legend class="sr-only">Respuesta</legend><div class="affinity-answer-list">${labels.map(([v,name])=>`<label class="affinity-answer ${chosen===v?"checked":""}"><input type="radio" name="affinityAnswer" value="${v}" ${chosen===v?"checked":""}><span class="affinity-answer-radio" aria-hidden="true"></span>${esc(name)}</label>`).join("")}</div></fieldset><div class="affinity-quiz-footer"><button id="affinityPrevious" class="button button-outline" type="button" ${s.idx===0?"disabled":""}>← Anterior</button><a class="affinity-question-source" href="${esc(q.source)}" target="_blank" rel="noopener noreferrer">Fuente orientativa ↗</a><button id="affinityNext" class="button button-dark" type="submit" ${chosen===undefined?"disabled":""}>${pos===n?"Ver resultados →":"Siguiente →"}</button></div></form><p class="affinity-question-disclaimer">Afirmación elaborada para este test; las valoraciones por partido son interpretativas y pueden no cubrir todos los programas.</p>`;
    el("affinityForm").addEventListener("change",e=>{
      if(e.target.name!=="affinityAnswer")return;
      s.answers.set(q.id,e.target.value==="skip"?"skip":Number(e.target.value));
      advance();
    });
    el("affinityForm").addEventListener("submit",e=>{e.preventDefault();if(s.answers.has(q.id))advance();});
    el("affinityPrevious").addEventListener("click",()=>{if(s.idx>0){s.idx--;renderQ();}});
  }
  function advance(){if(s.idx<s.questions.length-1){s.idx++;renderQ();}else finish();}
  function score(){
    const rows=s.questions.filter(q=>typeof s.answers.get(q.id)==="number");
    return BANK.parties.map(key=>{
      const matched=rows.filter(q=>typeof q.positions[key]==="number");
      const score=matched.length ? matched.reduce((sum,q)=>sum+1-Math.abs(s.answers.get(q.id)-q.positions[key])/4,0)/matched.length*100 : null;
      return {key,covered:matched.length,answered:rows.length,score:score==null?null:Math.round(score*10)/10,eligible:matched.length>=6};
    }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||(b.score??-1)-(a.score??-1)||b.covered-a.covered||a.key.localeCompare(b.key));
  }
  function finish(){
    const answered=s.questions.filter(q=>typeof s.answers.get(q.id)==="number").length;
    if(answered<18){
      el("affinityApp").innerHTML=`<div class="affinity-insufficient"><h2>Necesitamos más respuestas</h2><p>Has respondido ${answered} de las ${s.questions.length} preguntas. Para ver una comparación mínimamente estable debes responder al menos 18.</p><button id="affinityReview" type="button" class="button button-dark">Revisar preguntas omitidas</button></div>`;
      el("affinityReview").addEventListener("click",()=>{s.idx=Math.max(0,s.questions.findIndex(q=>typeof s.answers.get(q.id)!=="number"));renderQ();});
      return;
    }
    const scores=score(), eligible=scores.filter(x=>x.eligible);
    s.result={scores,first:eligible[0]?.key||null,second:eligible[1]?.key||null,answered};
    result();
  }
  function resultRow(r){
    const p=parties[r.key],status=r.eligible?pct(r.score)+" / 100":"Datos insuficientes";
    const bar=r.eligible?`<div class="affinity-score-track"><span style="width:${r.score}%;background:${p.color}"></span></div>`:"";
    return `<div class="affinity-score-row"><div class="affinity-score-head"><span class="party-name"><i class="party-dot" style="background:${p.color}"></i>${esc(p.label)}</span><strong>${status}</strong></div>${bar}<small>${r.covered} de ${r.answered} respuestas comparables · ${esc(p.territory)}</small></div>`;
  }
  function result(){
    const r=s.result,one=r.scores.find(x=>x.key===r.first),two=r.scores.find(x=>x.key===r.second);
    const top=[one,two].filter(Boolean).map((x,i)=>`<div class="affinity-top-card"><small>${i===0?"PRIMERA":"SEGUNDA"} COINCIDENCIA ORIENTATIVA</small><strong style="color:${parties[x.key].color}">${esc(parties[x.key].label)}</strong><span>${pct(x.score)} / 100 · ${x.covered} temas comparables</span></div>`).join("");
    el("affinityApp").innerHTML=`<div class="affinity-result"><p class="panel-eyebrow">RESULTADO PRIVADO · ${r.answered} RESPUESTAS</p><h2>Coincidencias con los programas de 2023</h2><p class="affinity-result-lead">Comparación editorial, no oficial, no representativa y no indicativa de tu voto. Los partidos territoriales solo concurren en sus circunscripciones. Una puntuación basada en pocas preguntas no es comparable con otra de cobertura completa.</p><div class="affinity-top-two">${top||"<p>No hay suficientes posiciones documentadas para comparar.</p>"}</div><div class="affinity-all-scores">${r.scores.map(resultRow).join("")}</div><p class="affinity-score-caption">Las posiciones sin respaldo documental se excluyen del cálculo; no se consideran posturas neutrales. Para mostrar una puntuación se requieren al menos seis respuestas comparables. La selección de fuentes y la codificación son editoriales. Este resultado no recomienda partido ni predice decisiones electorales.</p><div class="affinity-actions"><button id="affinityRestart" type="button" class="button button-outline">↺ Repetir cuestionario</button></div><div class="affinity-participate"><p class="panel-eyebrow">PARTICIPACIÓN ANÓNIMA VOLUNTARIA</p><h3>¿Compartir solo la primera coincidencia?</h3><p>El cuestionario y las respuestas permanecen en este navegador durante la sesión; no guardamos identificadores, perfiles, direcciones IP ni respuestas individuales en nuestra base de datos. Al compartir, se envía únicamente la etiqueta de primera afinidad a Supabase, que incrementa un contador; Supabase y el alojamiento podrían procesar registros técnicos de conexión. No hay bloqueo por navegador: se admiten participaciones repetidas.</p><label class="affinity-consent"><input type="checkbox" id="affinityConsent" ${s.shared||!r.first?"disabled":""}><span>Quiero añadir voluntariamente mi primera coincidencia a los contadores públicos. Entiendo que no es una votación oficial ni representativa, que mi participación se agregará a las estadísticas y que no existe un registro individual para retirarla después.</span></label><button type="button" id="affinityPublish" class="button button-dark" disabled>${s.shared?"✓ Participación añadida":"Compartir mi primera afinidad"}</button><p id="affinityPublishMessage" role="status">${ready()?"Comprobando que la base de datos admita las formaciones del test…":"El servicio de estadísticas todavía no está configurado."}</p></div></div>`;
    el("affinityRestart").addEventListener("click",start);
    const publish=el("affinityPublish"), consent=el("affinityConsent");
    const toggle=()=>{publish.disabled=!(consent.checked&&s.schemaReady&&!s.shared&&!!r.first);};
    consent.addEventListener("change",toggle);
    publish.addEventListener("click",async()=>{
      if(!consent.checked||!s.schemaReady||s.shared||!r.first)return;
      publish.disabled=true;
      el("affinityPublishMessage").textContent="Enviando únicamente la primera coincidencia…";
      try{
        const response=await fetch(endpoint("rpc/submit_affinity_vote"),{method:"POST",headers:headers(),body:JSON.stringify({p_first:r.first})});
        if(!response.ok)throw Error("HTTP "+response.status);
        s.shared=true; consent.disabled=true;publish.textContent="✓ Participación añadida";
        el("affinityPublishMessage").textContent="Participación agregada correctamente. Puedes repetir el test si quieres; se cuentan las participaciones, no personas distintas.";
        await refreshStats();
      }catch(e){el("affinityPublishMessage").textContent="No se pudo añadir ("+e.message+"). Vuelve a intentarlo más tarde.";toggle();}
    });
    refreshStats();
  }
  function affinityGaugeMarkup(total,counts){
  const raw=BANK.parties.map(key=>({key,count:counts[key]||0,...parties[key]}));
  const rows=raw.sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
  const max=total?rows[0]:null;
  const polar=(cx,cy,r,angle)=>[cx+r*Math.cos(angle*Math.PI/180),cy+r*Math.sin(angle*Math.PI/180)];
  const arc=(cx,cy,r,start,end)=>{
    const [x1,y1]=polar(cx,cy,r,start),[x2,y2]=polar(cx,cy,r,end);
    return `M${x1.toFixed(3)} ${y1.toFixed(3)} A${r} ${r} 0 ${end-start>180?1:0} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
  };
  let angle=180;
  const segments=rows.map(p=>{
    const size=total?180*p.count/total:0,start=angle,end=angle+size;angle=end;
    if(size<=0.44)return "";
    const value=100*p.count/total;
    return `<path d="${arc(285,289,206,start+.22,end-.22)}" fill="none" stroke="${p.color}" stroke-width="50" stroke-linecap="butt"><title>${esc(p.label)}: ${pct(value)} % (${fmt(p.count)} participaciones)</title></path>`;
  }).join("");
  const center=max?`${pct(max.count/total*100)} %`:"0,0 %";
  const name=max?max.label.toUpperCase():"SIN PARTICIPACIONES";
  const sub=max?"PRIMERA AFINIDAD MÁS FRECUENTE":"PENDIENTE DE PARTICIPACIONES";
  const accessible=total?`Distribución de ${fmt(total)} participaciones: ${rows.map(x=>x.label+" "+pct(100*x.count/total)+" por ciento").join(", ")}`:"Aún no hay participaciones compartidas";
  const gauge=`<div class="gauge-wrap affinity-gauge-wrap"><svg viewBox="0 0 570 315" role="img" aria-label="${esc(accessible)}"><path d="${arc(285,289,206,180,360)}" stroke="#ecf0ed" stroke-width="50" fill="none"/>${segments}<text x="285" y="225" class="gauge-caption" text-anchor="middle">${sub}</text><text x="285" y="275" class="big-number" text-anchor="middle">${center}</text><text x="285" y="297" fill="${max?max.color:"#85938a"}" font-size="13" font-weight="780" text-anchor="middle">${esc(name)}</text></svg></div>`;
  const legend=rows.map(p=>`<div class="legend-item affinity-legend-item"><i class="legend-swatch" style="background:${p.color}"></i><span class="affinity-legend-party">${esc(p.label)}</span><span class="affinity-legend-count">${fmt(p.count)}</span><b>${total?pct(p.count/total*100):"0,0"} %</b></div>`).join("");
  return `<div class="affinity-stat-head"><strong>${fmt(total)} <span>participaciones voluntarias · primera coincidencia únicamente</span></strong></div>${gauge}<div class="affinity-gauge-legend" aria-label="Resultados por formación">${legend}</div>${total===0?'<p class="affinity-muted affinity-zero-note">Todavía no hay participaciones compartidas.</p>':""}<p class="affinity-score-caption">No es intención de voto ni una muestra representativa. Una misma persona puede participar más de una vez; solo se contabiliza la primera afinidad de cada envío.</p>`;
}
  async function refreshStats(){
    const target=el("affinityPublicChart");
    if(!target)return;
    if(!ready()){
      s.schemaReady=false;
      target.innerHTML='<div class="affinity-chart-unavailable"><strong>Estadísticas pendientes de conectar</strong><p>El test funciona sin enviar datos. No mostramos cifras ficticias.</p></div>';
      return;
    }
    try{
      const response=await fetch(endpoint("affinity_totals?select=party,first_count"),{headers:headers(),cache:"no-store"});
      if(!response.ok)throw Error("HTTP "+response.status);
      const records=await response.json();
      if(!Array.isArray(records))throw Error("Respuesta inesperada");
      const byParty=Object.fromEntries(records.map(x=>[x.party,Math.max(0,Number(x.first_count)||0)]));
      const missing=BANK.parties.filter(k=>!Object.prototype.hasOwnProperty.call(byParty,k));
      s.schemaReady=missing.length===0;
      if(missing.length){
        target.innerHTML='<div class="affinity-chart-unavailable"><strong>Actualización de la base de datos pendiente</strong><p>Se han incorporado más partidos al cuestionario. Para activar el gráfico y el envío hay que ejecutar el script SQL de actualización en Supabase. No se muestran datos incompletos.</p></div>';
      }else{
        const total=BANK.parties.reduce((n,key)=>n+byParty[key],0);
        target.innerHTML=affinityGaugeMarkup(total,byParty);
      }
      const button=el("affinityPublish"),consent=el("affinityConsent"),message=el("affinityPublishMessage");
      if(button&&consent&&!s.shared){button.disabled=!(s.schemaReady&&consent.checked);if(message)message.textContent=s.schemaReady?"Puedes participar si quieres; no se guardan respuestas ni identificadores en nuestra base de datos.":"La base de datos aún necesita incorporar los nuevos partidos. El botón seguirá desactivado hasta entonces.";}
    }catch(e){
      s.schemaReady=false;
      target.innerHTML='<div class="affinity-chart-unavailable"><strong>Estadísticas no disponibles</strong><p>No se ha podido consultar el servicio. No se muestran cifras inventadas.</p></div>';
      const message=el("affinityPublishMessage");if(message)message.textContent="No se pudo conectar con el servicio de estadísticas.";
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
