import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
import {VisitorCounter,visitorStats,koreaDay} from '../worker/visitor-stats.mjs';
import {loadVisitorStats} from '../src/visitor-client.mjs';
function instance(){
 const db=new DatabaseSync(':memory:');let alarm=null;
 const storage={sql:{exec(query,...args){const st=db.prepare(query);return st.columns().length?st.all(...args):(st.run(...args),[]);}},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}},getAlarm:async()=>alarm,setAlarm:async value=>{alarm=value;}};
 return {counter:new VisitorCounter({storage}),storage,db};
}
const request=(id)=>new Request('https://counter.internal/',id?{method:'POST',body:id}:{});
test('duplicate IDs and concurrent retries only count once; second visitor increments',async()=>{
 const {counter,db}=instance();try{
  await Promise.all(Array.from({length:8},()=>counter.fetch(request('a'.repeat(64)))));
  let r=await (await counter.fetch(request())).json();assert.equal(r.today,1);assert.equal(r.total,1);
  r=await (await counter.fetch(request('b'.repeat(64)))).json();assert.equal(r.today,2);assert.equal(r.total,2);
  assert.equal((await counter.fetch(request('invalid'))).status,400);
 }finally{db.close();}
});
test('Korea midnight resets daily count and deletes identifiers while retaining total',async()=>{
 assert.equal(koreaDay(Date.parse('2026-11-16T14:59:59Z')),'2026-11-16');assert.equal(koreaDay(Date.parse('2026-11-16T15:00:00Z')),'2026-11-17');
 const {counter,storage,db}=instance();try{await counter.fetch(request('a'.repeat(64)));storage.transactionSync(()=>counter.rollover('2099-01-01'));assert.equal([...storage.sql.exec('SELECT * FROM seen')].length,0);const row=[...storage.sql.exec('SELECT * FROM totals')][0];assert.equal(row.today,0);assert.equal(row.total,1);}finally{db.close();}
});
test('endpoint rejects cross-origin and malformed IDs, hashes identifiers, caches only reads',async()=>{
 let calls=0,lastBody;const entries=new Map(),cache={match:async k=>entries.get(k.url)?.clone(),put:async(k,r)=>entries.set(k.url,r.clone())};
 const env={VISITOR_COUNTER:{idFromName:name=>name,get:()=>({fetch:async r=>{calls++;lastBody=await r.text();return new Response(JSON.stringify({status:'ok',today:1,total:1}));}})},URL_RATE_LIMITER:{limit:async()=>({success:true})}};
 const url='https://mypocketutility.com/api/visitor-stats';const post=origin=>new Request(url,{method:'POST',headers:{origin,'x-visitor-id':'11111111-1111-4111-a111-111111111111'}});
 assert.equal((await visitorStats(post('https://other.com'),env,{cache})).status,403);assert.equal(calls,0);
 await visitorStats(post('https://mypocketutility.com'),env,{cache});assert.match(lastBody,/^[a-f0-9]{64}$/);assert.equal(entries.size,0);
 await visitorStats(new Request(url),env,{cache});await visitorStats(new Request(url+'?random=123'),env,{cache});assert.equal(calls,2);
 assert.equal((await visitorStats(new Request(url),{})).status,503);
});
test('client registers once, refresh reads, next day registers, unavailable storage never counts',async()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};const methods=[];
 const fetcher=async(_,options)=>{methods.push(options.method);return new Response(JSON.stringify({status:'ok',today:1,total:1}));};
 await Promise.all([loadVisitorStats({storage,fetcher,day:'2026-11-16'}),loadVisitorStats({storage,fetcher,day:'2026-11-16'})]);assert.deepEqual(methods,['POST']);
 await loadVisitorStats({storage,fetcher,day:'2026-11-16'});await loadVisitorStats({storage,fetcher,day:'2026-11-17'});assert.deepEqual(methods,['POST','GET','POST']);
 await loadVisitorStats({storage:{getItem(){throw Error();}},fetcher});assert.equal(methods.at(-1),'GET');
});
test('failed registration retries the same ID without marking it counted',async()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};let first;
 await assert.rejects(()=>loadVisitorStats({storage,fetcher:async(_,opts)=>{first=opts.headers['x-visitor-id'];return new Response('',{status:503});}}));
 await loadVisitorStats({storage,fetcher:async(_,opts)=>{assert.equal(opts.headers['x-visitor-id'],first);return new Response(JSON.stringify({status:'ok'}));}});
});
