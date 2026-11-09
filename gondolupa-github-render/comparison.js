const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function unitPrice(name,price){
 const n=norm(name),matches=[...n.matchAll(/(\d+(?:[.,]\d+)?)\s*(kg|grs?|g|ml|cc|lts?|l|unidades|unid|un)\b/g)];if(matches.length!==1||/\ba\s+\d+[.,]?\d*\s*(kg|g|ml|l)\b/.test(n))return null;
 const m=matches[0],amount=Number(m[1].replace(',','.'));if(!amount||!Number.isFinite(price)||price<=0)return null;
 let count=1;const pack=n.match(/\bpack\s*x\s*(\d+)\b/)||n.match(/\b(\d+)\s*x\s*\d/)||n.match(/\d\s*(?:kg|grs?|g|ml|cc|lts?|l)\s*x\s*(\d+)\b/);if(pack)count=Number(pack[1]);else if(/\b(pack|combo|tripack|duopack)\b/.test(n))return null;
 const u=m[2],base=/^(kg|l|lt|lts)$/.test(u)?1:/^(g|gr|grs|ml|cc)$/.test(u)?1000:1,unit=/^(kg|g|gr|grs)$/.test(u)?'kg':/^(l|lt|lts|ml|cc)$/.test(u)?'litro':'unidad';return {value:price*base/(amount*count),unit,amount:amount*count/base};
}
export function freshOffer(o,now=Date.now()){return o.available===true&&o.price>0&&now-Date.parse(o.checkedAt)<=300000&&now-Date.parse(o.checkedAt)>=-60000;}
export function calculatePlans(items,stores,settings={},effective=o=>o.price,now=Date.now()){
 const ids=stores.filter(s=>s.prices).map(s=>s.id);const plans=[];if(!items.length)return [];
 const price=(item,id)=>item.offers.filter(o=>o.storeId===id&&freshOffer(o,now)).sort((a,b)=>effective(a)-effective(b))[0];
 for(let mask=1;mask<(1<<ids.length);mask++){
  const selected=ids.filter((_,i)=>mask&(1<<i)),orders=new Map();let missing=false;
  for(const item of items){const offers=selected.map(id=>price(item,id)).filter(Boolean).sort((a,b)=>effective(a)-effective(b));if(!offers.length){missing=true;break;}const o=offers[0];if(!orders.has(o.storeId))orders.set(o.storeId,{storeId:o.storeId,store:o.store,subtotal:0,items:[],scopes:new Set()});const order=orders.get(o.storeId);order.subtotal+=effective(o)*item.quantity;order.items.push({key:item.key||item.name,name:item.name,quantity:item.quantity,price:effective(o),url:o.url});order.scopes.add(o.scope||'unknown');}
  if(missing)continue;let total=0,known=true,eligible=true;const warnings=[];
  for(const order of orders.values()){const s=settings[order.storeId]||{};order.mode=s.mode||'pickup';const r=s.publishedRule,valid=r?.verified&&s.usePublished&&s.coverageConfirmed&&now-Date.parse(r.checkedAt)<=86400000&&now>=Date.parse(r.checkedAt);const fee=valid?(order.mode==='delivery'?(order.subtotal>r.freeAbove?0:r.deliveryFee):r.pickupFee):s.fee;const minimum=valid&&r.minimum!==null?r.minimum:s.minimum;if(valid)order.policySource=r.url;order.fee=typeof fee==='number'&&Number.isFinite(fee)&&fee>=0?fee:null;order.minimum=typeof minimum==='number'&&Number.isFinite(minimum)&&minimum>=0?minimum:null;if(order.fee===null||order.minimum===null)known=false;if(order.minimum!==null&&order.subtotal<order.minimum)eligible=false;order.total=order.fee===null?null:order.subtotal+order.fee;total+=order.subtotal+(order.fee||0);order.scopes=[...order.scopes];if(order.scopes.some(scope=>scope!=='selected-branch'))warnings.push(order.store+': confirmar precio y entrega en el contexto del catálogo.');}
  const signature=[...orders].map(([id,o])=>id+':'+o.items.map(i=>i.key+'='+i.quantity).sort().join(',')).sort().join('|');if(plans.some(p=>p.signature===signature))continue;
  plans.push({signature,orders:[...orders.values()],total:known?total:null,subtotal:[...orders.values()].reduce((s,o)=>s+o.subtotal,0),known,eligible,warnings});
 }
 return plans.sort((a,b)=>Number(b.eligible&&b.known)-Number(a.eligible&&a.known)||(a.total??a.subtotal)-(b.total??b.subtotal));
}
export function historySummary(rows){const valid=rows.filter(r=>r.available===1&&r.price>0);const contexts=new Map();for(const r of valid){const key=[r.store,r.scope,r.branch].join('|');if(!contexts.has(key))contexts.set(key,[]);contexts.get(key).push(r);}return [...contexts.values()].map(points=>{const sorted=points.sort((a,b)=>a.checked.localeCompare(b.checked)),days=new Set(sorted.map(r=>r.checked.slice(0,10))),last=sorted.at(-1),prior=sorted.slice(0,-1).filter(r=>r.checked.slice(0,10)!==last.checked.slice(0,10)).map(r=>r.price).sort((a,b)=>a-b);return {...last,observations:sorted.length,days:days.size,min:Math.min(...sorted.map(r=>r.price)),max:Math.max(...sorted.map(r=>r.price)),change:prior.length>=2?(last.price/prior[Math.floor(prior.length/2)]-1)*100:null,points:sorted};});}
