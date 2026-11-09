import {nearestBranches} from './geo.js';
import {freshOffer} from './comparison.js';
export function recommendBranches(branches,origin,items,{radius=10,mode='nearest',effective=o=>o.price,now=Date.now()}={}){
 if(!origin||!Number.isFinite(origin.lat)||!Number.isFinite(origin.lon)||Math.abs(origin.lat)>90||Math.abs(origin.lon)>180)return {candidates:[],reason:'location'};
 const ranked=nearestBranches(branches,origin).filter(b=>b.distance!==null&&(radius===0||b.distance<=radius)).map(b=>{
 let exactCount=0,chainCount=0,exactTotal=0,chainTotal=0;
 for(const item of items){const offers=item.offers.filter(o=>o.storeId===b.storeId&&freshOffer(o,now));const exact=offers.filter(o=>o.scope==='selected-branch'&&o.selectedBranchId===b.id).sort((a,c)=>effective(a)-effective(c))[0];const chain=offers.sort((a,c)=>effective(a)-effective(c))[0];if(exact){exactCount++;exactTotal+=effective(exact)*item.quantity;}if(chain){chainCount++;chainTotal+=effective(chain)*item.quantity;}}
 const verified=items.length>0&&exactCount===items.length;return {...b,exactCount,chainCount,verified,exactTotal:verified?exactTotal:null,chainTotal:items.length>0&&chainCount===items.length?chainTotal:null};
 });
 const eligible=mode==='verified'?ranked.filter(b=>b.verified):ranked;
 const candidates=[];for(const b of eligible){if(candidates.some(c=>c.storeId===b.storeId))continue;candidates.push(b);}
 return {candidates:candidates.slice(0,6),reason:eligible.length?'ok':mode==='verified'?'unverified':'radius',nearby:ranked.length};
}
