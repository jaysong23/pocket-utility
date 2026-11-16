import test from 'node:test';import assert from 'node:assert/strict';
import {readVisitors,visitorStats,analyticsToken} from '../worker/visitor-stats.mjs';
const report=(n)=>({metricHeaders:[{name:'totalUsers'}],rows:[{metricValues:[{value:String(n)}]}],metadata:{timeZone:'Asia/Seoul'}});
const response=()=>new Response(JSON.stringify({reports:[report(12),report(35)]}));
const env={GA4_PROPERTY_ID:'12345',GA4_SERVICE_ACCOUNT:JSON.stringify({client_email:'test@example.com',private_key:'test'})};
function cache(){const entries=new Map();return {match:async k=>entries.get(k.url)?.clone(),put:async(k,r)=>entries.set(k.url,r.clone())}}
test('counts use distinct users across the full period, not daily sums, filtered to this site',async()=>{
 const result=await readVisitors({property:'12345',startDate:'2026-11-16',host:'mypocketutility.com',token:'test',fetcher:async(url,opts)=>{assert.equal(url,'https://analyticsdata.googleapis.com/v1beta/properties/12345:batchRunReports');const body=JSON.parse(opts.body);assert.equal(body.requests[0].dateRanges[0].startDate,'today');assert.equal(body.requests[1].dateRanges[0].startDate,'2026-11-16');assert.deepEqual(body.requests[1].metrics,[{name:'totalUsers'}]);assert.equal(body.requests[1].dimensions,undefined);assert.deepEqual(body.requests[0].dimensionFilter.filter.inListFilter.values,['mypocketutility.com','www.mypocketutility.com']);return response()}});
 assert.equal(result.today,12);assert.equal(result.total,35);assert.equal(result.timeZone,'Asia/Seoul');
});
test('unconfigured counter never requests GA and does not invent zero visitors',async()=>{
 const r=await visitorStats(new Request('https://mypocketutility.com/api/visitor-stats'),{}, {fetcher:()=>{throw Error('unexpected fetch')}});assert.deepEqual(await r.json(),{status:'not_configured'});
});
test('cached stats reuse results across query strings and cache failures without leaking credentials',async()=>{
 const c=cache();let reads=0,tokens=0;const deps={cache:c,fetcher:async()=>{reads++;return response()},tokenProvider:async()=>{tokens++;return 'private-token'}};
 const req=()=>new Request('https://mypocketutility.com/api/visitor-stats?random='+Math.random());
 await Promise.all([visitorStats(req(),env,deps),visitorStats(req(),env,deps)]);const r=await visitorStats(req(),env,deps);assert.equal((await r.json()).total,35);assert.equal(reads,1);assert.equal(tokens,1);
 const fail={...deps,cache:cache(),tokenProvider:async()=>{throw Error('secret-private-key')}};const a=await visitorStats(req(),env,fail);assert.deepEqual(await a.json(),{status:'unavailable'});const b=await visitorStats(req(),env,{...fail,tokenProvider:()=>{throw Error('should be cached')}});assert.deepEqual(await b.json(),{status:'unavailable'});
});
test('malformed reports are not displayed as zero',async()=>{
 await assert.rejects(()=>readVisitors({property:'123',token:'test',fetcher:async()=>new Response(JSON.stringify({reports:[{},{}]}))}),/INVALID_REPORT/);
});
test('service-account assertion is signed and uses read-only Google scope',async()=>{
 const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const exported=await crypto.subtle.exportKey('pkcs8',keys.privateKey);const pem='-----BEGIN PRIVATE KEY-----\n'+Buffer.from(exported).toString('base64')+'\n-----END PRIVATE KEY-----';
 const result=await analyticsToken({client_email:'test@example.com',private_key:pem},async(url,options)=>{assert.equal(url,'https://oauth2.googleapis.com/token');const jwt=options.body.get('assertion'),[header,claims,signature]=jwt.split('.');const payload=JSON.parse(Buffer.from(claims,'base64url'));assert.equal(payload.scope,'https://www.googleapis.com/auth/analytics.readonly');assert.equal(payload.exp-payload.iat,3600);assert.ok(await crypto.subtle.verify('RSASSA-PKCS1-v1_5',keys.publicKey,Buffer.from(signature,'base64url'),new TextEncoder().encode(header+'.'+claims)));return new Response(JSON.stringify({access_token:'test-token'}))});assert.equal(result,'test-token');
});
