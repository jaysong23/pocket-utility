const TTL=1800;
const inFlight=new Map();
const b64=value=>btoa(typeof value==='string'?value:String.fromCharCode(...new Uint8Array(value))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
export async function analyticsToken(account,fetcher,signal){
 const iat=Math.floor(Date.now()/1000);
 const header=b64(JSON.stringify({alg:'RS256',typ:'JWT'}));
 const claims=b64(JSON.stringify({iss:account.client_email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:'https://oauth2.googleapis.com/token',iat,exp:iat+3600}));
 const pem=account.private_key.replace(/-----[^-]+-----/g,'').replace(/\s/g,'');
 const key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(header+'.'+claims));
 const response=await fetcher('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:header+'.'+claims+'.'+b64(signature)}),signal});
 if(!response.ok)throw Error('AUTH_FAILED');const data=await response.json();if(typeof data.access_token!=='string'||!data.access_token)throw Error('AUTH_FAILED');return data.access_token;
}
export async function readVisitors({property,startDate,host,token,fetcher=fetch,signal}){
 const report=start=>({dateRanges:[{startDate:start,endDate:'today'}],metrics:[{name:'totalUsers'}],dimensionFilter:{filter:{fieldName:'hostName',inListFilter:{values:[host,'www.'+host]}}}});
 const response=await fetcher(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:batchRunReports`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({requests:[report('today'),report(startDate)]}),signal});
 if(!response.ok)throw Error('REPORT_FAILED');const data=await response.json();if(data.reports?.length!==2)throw Error('INVALID_REPORT');
 const count=report=>{
  if(report.metricHeaders?.[0]?.name!=='totalUsers')throw Error('INVALID_REPORT');
  const value=report.rows?.length?report.rows[0].metricValues?.[0]?.value:(!report.rows?.length&&(report.rowCount===0||report.rowCount===undefined))?'0':undefined;
  if(!/^\d+$/.test(value||''))throw Error('INVALID_REPORT');const n=Number(value);if(!Number.isSafeInteger(n))throw Error('INVALID_REPORT');return n;
 };
 const today=count(data.reports[0]),total=count(data.reports[1]);
 return {status:'ok',today,total,startDate,updatedAt:new Date().toISOString(),timeZone:data.reports[0].metadata?.timeZone||null,limited:data.reports.some(r=>r.metadata?.subjectToThresholding||r.metadata?.samplingMetadatas?.length)};
}
const json=(data,seconds=300,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':`public, max-age=${seconds}`,'X-Content-Type-Options':'nosniff'}});
export async function visitorStats(request,env,{cache=globalThis.caches?.default,fetcher=fetch,tokenProvider=analyticsToken}={}){
 if(request.method!=='GET'&&request.method!=='HEAD')return json({status:'unavailable'},0,405);
 const head=request.method==='HEAD',finish=response=>head?new Response(null,{status:response.status,headers:response.headers}):response;
 const property=env.GA4_PROPERTY_ID,startDate=env.GA4_START_DATE||'2026-11-16',host=env.GA4_SITE_HOST||'mypocketutility.com';
 if(!property||!env.GA4_SERVICE_ACCOUNT)return finish(json({status:'not_configured'},600));
 let account;try{account=JSON.parse(env.GA4_SERVICE_ACCOUNT)}catch{return finish(json({status:'unavailable'},600))}
 if(!/^\d+$/.test(property)||!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!Number.isFinite(Date.parse(startDate))||!/^[a-z0-9.-]+$/.test(host)||!account.client_email||!account.private_key)return finish(json({status:'unavailable'},600));
 // One canonical cache key: client query parameters never select reports or bypass caching.
 const key=new Request('https://'+host+'/__visitor-stats-v1/'+property+'/'+startDate);
 let cached;try{cached=await cache?.match(key)}catch{}if(cached){const response=new Response(cached.body,cached);response.headers.set('Cache-Control','public, max-age=300');return finish(response)}
 if(!inFlight.has(key.url)){
  inFlight.set(key.url,(async()=>{
   let result,seconds=TTL;
   const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),8000);
   try{
    if(env.URL_RATE_LIMITER){const limit=await env.URL_RATE_LIMITER.limit({key:'ga4-refresh'});if(!limit.success)throw Error('RATE_LIMITED')}
    const token=await tokenProvider(account,fetcher,ctl.signal);
    result=await readVisitors({property,startDate,host,token,fetcher,signal:ctl.signal});
   }catch{result={status:'unavailable'};seconds=900}finally{clearTimeout(timer)}
   // Negative cache also prevents repeated auth/API errors from hammering Google.
   const response=json(result,seconds);try{await cache?.put(key,response.clone())}catch{}
   return result;
  })().finally(()=>inFlight.delete(key.url)));
 }
 return finish(json(await inFlight.get(key.url)));
}
