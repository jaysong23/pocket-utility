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
export async function expandURL(value,signal){
 const url=parseURL(value);if(url.protocol!=='https:')throw Error('HTTPS 서버 주소를 입력해 주세요.');
 const res=await fetch(url.href,{method:'GET',redirect:'follow',mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal});
 await res.body?.cancel();
 if(!res.url||['opaque','opaqueredirect','error'].includes(res.type))throw Error('최종 주소를 확인할 수 없습니다.');
 if(!res.ok)throw Error('HTTP '+res.status);
 return {result:inspectURL(res.url),redirected:res.redirected};
}
