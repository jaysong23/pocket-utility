export const koreaDay=(now=Date.now())=>new Date(now+9*3600000).toISOString().slice(0,10);
let pending;
export function loadVisitorStats({storage,fetcher=fetch,day=koreaDay()}={}){
 if(pending)return pending;
 pending=(async()=>{
  let record;
  try{
   storage=storage||globalThis.localStorage;
   record=JSON.parse(storage.getItem('mpu-visit-day')||'null');
   if(record?.day!==day||!record?.id){record={day,id:crypto.randomUUID(),counted:false};storage.setItem('mpu-visit-day',JSON.stringify(record));}
  }catch{record=null;} // If storage is unavailable, read only instead of inflating counts.
  const register=record&&!record.counted;
  const response=await fetcher('/api/visitor-stats',{method:register?'POST':'GET',headers:register?{'x-visitor-id':record.id}:{},credentials:'same-origin',signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('COUNTER_UNAVAILABLE');const data=await response.json();
  if(data.status!=='ok')throw Error('COUNTER_UNAVAILABLE');
  if(register){try{storage.setItem('mpu-visit-day',JSON.stringify({...record,counted:true}));}catch{}}
  return data;
 })().finally(()=>{pending=null;});
 return pending;
}
