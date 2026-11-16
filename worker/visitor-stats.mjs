export const koreaDay=(now=Date.now())=>new Date(now+9*3600000).toISOString().slice(0,10);
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
// A single durable instance serializes all count updates; daily IDs expire at midnight KST.
export class VisitorCounter {
 constructor(state){
  this.state=state;this.sql=state.storage.sql;
  this.sql.exec('CREATE TABLE IF NOT EXISTS totals (id INTEGER PRIMARY KEY CHECK(id=1), day TEXT NOT NULL, today INTEGER NOT NULL, total INTEGER NOT NULL, start TEXT NOT NULL)');
  this.sql.exec('CREATE TABLE IF NOT EXISTS seen (hash TEXT PRIMARY KEY)');
 }
 async alarm(){this.state.storage.transactionSync(()=>this.rollover(koreaDay()));}
 rollover(day){
  this.sql.exec('INSERT OR IGNORE INTO totals VALUES(1,?,0,0,?)',day,day);
  const row=[...this.sql.exec('SELECT * FROM totals WHERE id=1')][0];
  if(row.day!==day){this.sql.exec('DELETE FROM seen');this.sql.exec('UPDATE totals SET day=?,today=0 WHERE id=1',day);}
 }
 async fetch(request){
  const day=koreaDay(),hash=request.method==='POST'?await request.text():null;
  if(hash!==null&&!/^[a-f0-9]{64}$/.test(hash))return json({status:'unavailable'},400);
  let row;
  this.state.storage.transactionSync(()=>{
   this.rollover(day);
   if(hash){
    const found=[...this.sql.exec('SELECT hash FROM seen WHERE hash=?',hash)].length;
    if(!found){this.sql.exec('INSERT INTO seen VALUES(?)',hash);this.sql.exec('UPDATE totals SET today=today+1,total=total+1 WHERE id=1');}
   }
   row=[...this.sql.exec('SELECT * FROM totals WHERE id=1')][0];
  });
  if(hash&&!await this.state.storage.getAlarm())await this.state.storage.setAlarm(Date.parse(day+'T00:00:00+09:00')+86400000);
  return json({status:'ok',today:row.today,total:row.total,startDate:row.start,timeZone:'Asia/Seoul',updatedAt:new Date().toISOString()});
 }
}
export async function visitorStats(request,env,{cache=globalThis.caches?.default}={}){
 const url=new URL(request.url),method=request.method;
 if(!['GET','POST','HEAD'].includes(method))return json({status:'unavailable'},405);
 if(!env.VISITOR_COUNTER)return json({status:'unavailable'},503);
 try{
  let hash;
  if(method==='POST'){
   if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return json({status:'unavailable'},403);
   // The ID is a fixed-size header, not an unbounded request body. No IP/fingerprint is stored.
   const id=request.headers.get('x-visitor-id');if(!/^[a-f0-9-]{36}$/.test(id||''))return json({status:'unavailable'},400);
   if(env.URL_RATE_LIMITER){const {success}=await env.URL_RATE_LIMITER.limit({key:'counter:'+ (request.headers.get('CF-Connecting-IP')||'unknown')});if(!success)return json({status:'unavailable'},429);}
   hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(koreaDay()+':'+id))),x=>x.toString(16).padStart(2,'0')).join('');
  }
  const key=new Request(url.origin+'/__counter-cache-v1/'+koreaDay());
  if(!hash){let hit;try{hit=await cache?.match(key)}catch{}if(hit)return method==='HEAD'?new Response(null,{headers:hit.headers}):hit;}
  const stub=env.VISITOR_COUNTER.get(env.VISITOR_COUNTER.idFromName('site-visitors-v1'));
  const result=await stub.fetch(new Request('https://counter.internal/',{method:hash?'POST':'GET',...(hash?{body:hash}:{})}));
  if(!result.ok)return json({status:'unavailable'},503);
  if(!hash){const cached=new Response(result.clone().body,result);cached.headers.set('Cache-Control','public, max-age=60');try{await cache?.put(key,cached)}catch{}}
  return method==='HEAD'?new Response(null,{headers:result.headers}):result;
 }catch{return json({status:'unavailable'},503);}
}
