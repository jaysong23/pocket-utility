export function parseURL(value){const u=new URL(value.trim());if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('http 또는 https 페이지 주소를 입력해 주세요.');return u}
export function inspectURL(value){
 const u=parseURL(value);const params=[...u.searchParams].map(([key,value])=>{
 const k=key.toLowerCase();let kind='일반 파라미터';
 if(k.startsWith('utm_'))kind='캠페인 추적';
 else if(['gclid','dclid','msclkid','fbclid','ttclid','twclid','yclid','wbraid','gbraid','n_click','n_query','n_keyword'].includes(k))kind='광고·클릭 추적 가능';
 else if(['aff','affiliate','aff_id','affiliate_id','partner','partner_id','ref','referral','tag'].includes(k))kind='제휴·추천 코드 가능';
 const nested=/^(https?:\/\/)/i.test(value)?value:'';
 return {key,value,kind,nested};
 });return {url:u.href,host:u.hostname,path:u.pathname,hash:u.hash,params,signals:params.filter(p=>p.kind!=='일반 파라미터').length};
}
export const resolveErrors={
 INVALID_URL:'http 또는 https 페이지 주소를 입력해 주세요.',BLOCKED_URL:'공개 웹사이트 주소만 조회할 수 있습니다.',
 RATE_LIMITED:'조회가 너무 많습니다. 잠시 후 다시 시도해 주세요.',TIMEOUT:'서버 응답 시간이 초과되었습니다.',
 REDIRECT_LOOP:'주소가 반복해서 이동합니다.',TOO_MANY_REDIRECTS:'주소 이동 횟수가 너무 많습니다.',
 UNAVAILABLE:'URL 조회 서버를 사용할 수 없습니다.',FORBIDDEN:'사이트를 새로고침한 뒤 다시 시도해 주세요.'
};
export async function expandURL(value,signal){
 const url=parseURL(value);
 const res=await fetch('/api/expand-url',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url.href}),signal});
 if(!res.headers.get('content-type')?.includes('application/json'))throw Error(resolveErrors.UNAVAILABLE);
 const data=await res.json();
 if(!res.ok)throw Error(resolveErrors[data.error]||'목적지 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');
 if(typeof data.url!=='string'||!Array.isArray(data.chain))throw Error(resolveErrors.UNAVAILABLE);
 return {result:inspectURL(data.url),redirected:data.redirected,chain:data.chain,status:data.status};
}
