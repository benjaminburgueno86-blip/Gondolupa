const $=s=>document.querySelector(s),money=n=>new Intl.NumberFormat('es-UY',{style:'currency',currency:'UYU'}).format(n);
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const sourceLink=(label,url)=>{const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
const date=s=>new Date(s+'T12:00:00Z').toLocaleDateString('es-UY',{day:'2-digit',month:'2-digit'});
const month=s=>new Date(s+'-01T12:00:00Z').toLocaleDateString('es-UY',{month:'long',year:'numeric'});
let snapshot=()=>({items:[],total:0}),timer,controller,lastKey='',version=0,promotions=null,promotionsLoading=false;
export function scheduleAdvice(force=false){
 const {items,total}=snapshot(),benefits=$('#advice-midinero')?.checked?['midinero']:[],day=new Date().toLocaleDateString('en-CA',{timeZone:'America/Montevideo'}),key=JSON.stringify({items,total,benefits,day});
 $('#advice-refresh').disabled=!items.length;
 if(!force&&key===lastKey)return;lastKey=key;clearTimeout(timer);controller?.abort();const run=++version;
 if(!items.length){$('#advice-results').replaceChildren();$('#advice-status').textContent=total?'Actualizá los precios del carrito antes de consultar la recomendación.':'Agregá productos para consultar el análisis.';return;}
 $('#advice-status').textContent='Analizando historial y próximas fechas publicadas…';
 timer=setTimeout(async()=>{controller=new AbortController();try{const r=await fetch('/api/recommendations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,benefits}),signal:controller.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo consultar el análisis.');if(run!==version)return;renderAdvice(data,total-items.length);}catch(e){if(e.name!=='AbortError'&&run===version){$('#advice-status').textContent='No pudimos completar el análisis. Podés reintentarlo.';$('#advice-results').replaceChildren();}}},350);
}
function renderAdvice(data,missing){
 $('#advice-status').textContent='Objetivo: '+month(data.targetMonth)+'. Historial SIPC hasta '+month(data.history.latestMonth)+' · '+data.history.months+' reportes mensuales.'+(missing?' Hay '+missing+' referencias sin precio actual; no se analizaron.':'');
 const box=$('#advice-results');box.replaceChildren();
 for(const result of data.results){const waiting=result.decision==='consider-waiting',now=result.decision==='competitive-now',card=el('article',undefined,'advice-result'+(waiting?' wait':now?' now':''));
  card.append(el('span',waiting?'POSIBLE BAJA · ESTIMACIÓN':now?'OFERTA ACTUAL COMPETITIVA':'SIN SEÑAL SUFICIENTE PARA ESPERAR','advice-tag'),el('h4',result.name),el('p',result.message));
  const p=result.prediction;
  if(p.status==='estimated'){
   card.append(el('p','Promedio de mercado estimado para '+month(data.targetMonth)),el('p',money(p.low)+' – '+money(p.high),'forecast-range'),el('p','Precio de referencia de tu carrito: '+money(result.currentPrice)+'. Estimación central de mercado: '+money(p.expected)+'.'),el('p','Calidad estimativa '+p.confidence+' · error medio en '+p.backtestCases+' meses de prueba: '+p.backtestErrorPercent+'%. El rango es orientativo, no una garantía.'));
   if(result.match)card.append(el('p','Serie: '+result.match.product+' · '+result.match.brand+' · '+result.match.presentation+'. Coincidencia por denominación, marca y tamaño; sin verificación por código de barras.'));
   card.append(el('p',p.scope),sourceLink('Ver la fuente del historial',p.source));
  }else card.append(el('p',p.reason));box.append(card);
 }
 for(const future of data.futurePromotions){const card=el('article',undefined,'advice-result');card.append(el('span','FECHAS PUBLICADAS · BENEFICIO CONDICIONAL','advice-tag'),el('h4',future.title),el('p','Productos potencialmente comprendidos: '+future.eligibleProducts.join(', ')+'. Confirmá su categoría con la tienda.'));const dates=el('div',undefined,'calendar-dates');for(const d of future.dates)dates.append(el('span',date(d)));card.append(dates,el('p',future.conditions),el('p',future.message));if(future.alreadyAppliesToday)card.append(el('p','Esta promoción también tiene fecha válida hoy. No necesitás esperar al mes próximo solo para acceder a este beneficio.'));card.append(sourceLink('Ver bases oficiales',future.source));box.append(card);}
}
export function initPlanner(getSnapshot){
 snapshot=getSnapshot;$('#advice-midinero').onchange=()=>scheduleAdvice(true);$('#advice-refresh').onclick=()=>scheduleAdvice(true);
 $('#promotions-panel').ontoggle=()=>{if($('#promotions-panel').open)loadPromotions();};$('#promo-store').onchange=$('#promo-time').onchange=()=>{if(promotions)renderPromotions();else loadPromotions();};
}
async function loadPromotions(){
 if(promotionsLoading)return;if(promotions&&Date.now()-Date.parse(promotions.checkedAt)<900000){renderPromotions();return;}
 promotionsLoading=true;$('#promo-status').textContent='Consultando ofertas y bases oficiales…';try{const r=await fetch('/api/promotions');if(!r.ok)throw Error();promotions=await r.json();renderPromotions();}catch{$('#promo-status').textContent='No se pudieron consultar las promociones. Cerrá y abrí el panel para reintentar.';}finally{promotionsLoading=false;}
}
function renderPromotions(){
 const store=$('#promo-store').value,upcoming=$('#promo-time').value==='upcoming';const campaigns=promotions.campaigns.filter(c=>(!store||c.storeId===store)&&(!upcoming||c.nextDates.some(d=>d>promotions.today)));
 const offers=upcoming?[]:promotions.offers.filter(o=>!store||o.storeId===store),campaignBox=$('#promo-campaigns'),offerBox=$('#promo-offers');campaignBox.replaceChildren();offerBox.replaceChildren();
 $('#promo-status').textContent=(upcoming?'Próximas fechas dentro de campañas publicadas. ':'Muestra de '+offers.length+' ofertas y '+campaigns.length+' campañas. ')+'Consulta: '+new Date(promotions.checkedAt).toLocaleString('es-UY')+'.';
 if(store==='tata'){const note=el('article',undefined,'campaign-card');note.append(el('h3','Promociones de Ta-Ta pendientes de verificación automática'),el('p','Podés consultar las condiciones directamente en la tienda. No se presentan descuentos ni fechas que no pudimos verificar.'),sourceLink('Consultar Ta-Ta','https://www.tata.com.uy/beneficios-y-promociones'));campaignBox.append(note);}
 for(const c of campaigns){const card=el('article',undefined,'campaign-card');card.append(el('span',c.store+' · CAMPAÑA PUBLICADA','promo-badge'),el('h3',c.title),el('p',c.conditions),el('p','Vigencia publicada: '+(c.validFrom?date(c.validFrom)+' al ':'hasta ')+date(c.validUntil)+'/'+c.validUntil.slice(0,4)+'.'));const dates=c.nextDates.filter(d=>!upcoming||d>promotions.today),calendar=el('div',undefined,'calendar-dates');for(const d of dates)calendar.append(el('span',date(d)));if(dates.length)card.append(el('p','Fechas comprendidas en las bases:'),calendar);else card.append(el('p','Días exactos a confirmar con la fuente.'));card.append(sourceLink('Leer bases y condiciones',c.url));campaignBox.append(card);}
 for(const o of offers){const card=el('article',undefined,'promo-offer'),visual=sourceLink('Ver foto y producto',o.url);visual.className='product-visual';if(o.imageUrl){const img=el('img');img.src=o.imageUrl;img.alt=o.name;img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{img.remove();visual.textContent='Sin imagen';};visual.append(img);}else visual.append(el('span','Sin imagen','photo-placeholder'));const info=el('div');info.append(el('span',o.store+' · '+o.label,'promo-badge'),el('h4',o.name),el('strong',money(o.price)),el('p','Precio de referencia: '+money(o.originalPrice),'meta'));const conditions=el('div');conditions.append(el('p',o.conditions,'meta'),sourceLink('Ver oferta en la tienda ↗',o.url));card.append(visual,info,conditions);offerBox.append(card);}
 if(upcoming&&!campaigns.length)campaignBox.append(el('p','No hay fechas futuras verificadas para este filtro. No asumimos que una oferta actual seguirá vigente.','meta'));
 const errors=promotions.sources.filter(s=>s.status==='error'&&(!store||store===s.storeId));if(errors.length)offerBox.append(el('p','No se pudo verificar '+errors.map(e=>e.store).join(', ')+'. Revisá su sitio antes de decidir.','meta'));
}
