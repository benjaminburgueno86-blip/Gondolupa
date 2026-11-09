export function distanceKm(a,b){
 const valid=p=>p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
 if(!valid(a)||!valid(b))return null;
 const rad=n=>n*Math.PI/180,dlat=rad(b.lat-a.lat),dlon=rad(b.lon-a.lon);
 const h=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlon/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));
}
export function nearestBranches(branches,origin,{storeId='',text=''}={}){
 const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 return branches.filter(b=>(!storeId||b.storeId===storeId)&&norm(b.name+' '+b.address+' '+b.store).includes(norm(text))).map(b=>({...b,distance:origin?distanceKm(origin,b):null})).sort((a,b)=>origin?(a.distance??Infinity)-(b.distance??Infinity):a.store.localeCompare(b.store)||a.name.localeCompare(b.name));
}
