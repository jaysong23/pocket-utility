import {httpDateSample} from '../src/clock-sync.mjs';
const REDIRECTS=new Set([301,302,303,307,308]);
export class ResolveError extends Error{constructor(code,status=400){super(code);this.code=code;this.status=status}}
export function publicURL(value,ownHost=''){
 let url;try{url=new URL(value)}catch{throw new ResolveError('INVALID_URL')}
 const host=url.hostname.toLowerCase();
 if(value.length>4096||!['http:','https:'].includes(url.protocol)||url.username||url.password||url.port||!host.includes('.')||host.endsWith('.')||! /^[a-z0-9.-]+$/.test(host)||/^\d+(\.\d+)*$/.test(host)||host===ownHost||host==='mypocketutility.com'||host.endsWith('.mypocketutility.com')||/\.(localhost|local|internal|lan|home|test|invalid|example|workers\.dev)$/.test(host))throw new ResolveError('BLOCKED_URL');
 return url;
}
export function publicIP(ip){
 if(ip.includes(':'))return /^[23][0-9a-f]{3}:/i.test(ip)&&!/^2001:(?:db8|0):|^2002:/i.test(ip);
 const a=ip.split('.').map(Number);if(a.length!==4||a.some(v=>!Number.isInteger(v)||v<0||v>255))return false;
 const [x,y,z]=a;return !(x===0||x===10||x===127||x>=224||x===100&&y>=64&&y<=127||x===169&&y===254||x===172&&y>=16&&y<=31||x===192&&(y===168||y===0||y===2)||x===198&&(y===18||y===19||y===51&&z===100)||x===203&&y===0&&z===113);
}
async function checkDNS(host,fetcher,signal){
 const records=await Promise.all(['A','AAAA'].map(async type=>{
  const res=await fetcher('https://cloudflare-dns.com/dns-query?name='+encodeURIComponent(host)+'&type='+type,{headers:{accept:'application/dns-json'},signal});
  if(!res.ok)throw new ResolveError('DNS_FAILED',502);
  const data=await res.json();if(data.Status!==0)throw new ResolveError('DNS_FAILED',502);
  return (data.Answer||[]).filter(r=>r.type===1||r.type===28).map(r=>r.data);
 }));
 const ips=records.flat();if(!ips.length||ips.some(ip=>!publicIP(ip)))throw new ResolveError('BLOCKED_URL');
}
export async function resolveURL(value,{fetcher=fetch,ownHost='',signal,includeHTML=false}={}){
 let current=publicURL(value,ownHost);const visited=new Set(),chain=[];
 for(let hop=0;hop<=8;hop++){
  const key=current.href.split('#')[0];if(visited.has(key))throw new ResolveError('REDIRECT_LOOP',422);visited.add(key);
  await checkDNS(current.hostname,fetcher,signal);
  // Manual redirects ensure every destination is validated before requesting it.
  const res=await fetcher(key,{redirect:'manual',method:'GET',headers:{'User-Agent':'MyPocketUtility-LinkResolver/1.0','Accept':'text/html,*/*;q=0.5'},signal});
  if(REDIRECTS.has(res.status)||!includeHTML)await res.body?.cancel();
  chain.push({url:current.href,status:res.status});
  if(REDIRECTS.has(res.status)){
   const location=res.headers.get('location');if(!location)throw new ResolveError('INVALID_REDIRECT',502);
   if(hop===8)throw new ResolveError('TOO_MANY_REDIRECTS',422);
   let next;try{next=new URL(location,current)}catch{throw new ResolveError('INVALID_REDIRECT',502)}
   if(!location.includes('#'))next.hash=current.hash;
   current=publicURL(next.href,ownHost);continue;
  }
  // Even a blocked final page can reveal a destination via the preceding Location.
  // Surface its HTTP status rather than claiming the page is accessible.
  if(includeHTML){
   if(!res.ok){await res.body?.cancel();throw new ResolveError('HTTP_'+res.status,502)}
   const type=res.headers.get('content-type')||'';
   if(!/text\/html|application\/xhtml\+xml/i.test(type)){await res.body?.cancel();throw new ResolveError('NOT_HTML',422)}
   const max=2*1024*1024;
   if(Number(res.headers.get('content-length'))>max){await res.body?.cancel();throw new ResolveError('HTML_TOO_LARGE',413)}
   const reader=res.body?.getReader(),chunks=[];let size=0;
   if(reader)try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new ResolveError('HTML_TOO_LARGE',413)}chunks.push(value)}}finally{reader.releaseLock()}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
   let decoder;try{decoder=new TextDecoder(type.match(/charset\s*=\s*["']?([^\s;"']+)/i)?.[1]||'utf-8')}catch{decoder=new TextDecoder()}
   return {url:current.href,html:decoder.decode(bytes)};
  }
  return {url:current.href,redirected:chain.length>1,chain,status:res.status};
 }
 throw new ResolveError('TOO_MANY_REDIRECTS',422);
}
export async function naverTime({fetcher=fetch,signal}={}){
 const response=await fetcher('https://api.searchad.naver.com/',{method:'HEAD',redirect:'error',cache:'no-store',headers:{'Cache-Control':'no-cache'},signal});
 const date=response.headers.get('date'),age=response.headers.get('age');
 await response.body?.cancel();
 // The root is not a time API and may return 404; its fresh HTTP Date is still usable.
 try{httpDateSample(date,age,0,0)}catch{throw new ResolveError('INVALID_TIME',502)}
 return {date,age,source:'https://api.searchad.naver.com/',precisionMs:1000};
}
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function readBody(request){
 if(Number(request.headers.get('content-length'))>8192)throw new ResolveError('INVALID_URL',413);
 const reader=request.body?.getReader();if(!reader)throw new ResolveError('INVALID_URL');let text='',size=0;const decoder=new TextDecoder();
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();throw new ResolveError('INVALID_URL',413)}text+=decoder.decode(value,{stream:true})}}finally{reader.releaseLock()}
 try{return JSON.parse(text+decoder.decode())}catch{throw new ResolveError('INVALID_URL')}
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(!['/api/expand-url','/api/naver-time','/api/inspect-url'].includes(url.pathname))return env.ASSETS.fetch(request);
 if(request.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
 // Only same-site browser requests; do not provide an open CORS proxy.
 const origin=request.headers.get('origin');if(origin!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'FORBIDDEN'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'INVALID_URL'},415);
 try{
  if(!env.URL_RATE_LIMITER)return json({error:'UNAVAILABLE'},503);
  const {success}=await env.URL_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});
  if(!success)return json({error:'RATE_LIMITED'},429);
  const body=await readBody(request);if(url.pathname!=='/api/naver-time'&&typeof body?.url!=='string')throw new ResolveError('INVALID_URL');
  const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),9000);
  try{return json(url.pathname==='/api/naver-time'?await naverTime({signal:ctl.signal}):await resolveURL(body.url.trim(),{ownHost:url.hostname,signal:ctl.signal,includeHTML:url.pathname==='/api/inspect-url'}))}
  catch(e){if(ctl.signal.aborted)return json({error:'TIMEOUT'},504);throw e}
  finally{clearTimeout(timeout)}
 }catch(e){return json({error:e instanceof ResolveError?e.code:'FETCH_FAILED'},e instanceof ResolveError?e.status:502)}
}};
