export const MAX_HTML_BYTES=2*1024*1024;
export function httpURL(value,base){try{if(!value?.trim())return '';const u=new URL(value,base||undefined);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return ''}}
export function inspectHTML(html,source,document){
 if(new TextEncoder().encode(html).length>MAX_HTML_BYTES)throw Error('HTML은 2MB 이하로 입력해 주세요.');
 if(!html.trim())throw Error('검사할 HTML을 입력해 주세요.');
 // Template contents remain inert: no user scripts, frames or images are mounted.
 const template=document.createElement('template');template.innerHTML=html;const root=template.content;
 const values={};
 for(const meta of root.querySelectorAll('meta')){const key=(meta.getAttribute('property')||meta.getAttribute('name')||'').toLowerCase().trim();if(key)(values[key]??=[]).push(meta.getAttribute('content')||'')}
 const first=k=>values[k]?.[0]||'';
 const base=httpURL(root.querySelector('base[href]')?.getAttribute('href')||'',source)||source;
 const canonicalRaw=root.querySelector('link[rel~="canonical"]')?.getAttribute('href')||'';
 const fields=['og:title','og:description','og:image','og:url','og:type','og:site_name','twitter:card','twitter:title','twitter:description','twitter:image'].map(key=>({key,value:first(key),count:values[key]?.length||0}));
 const issues=[];
 for(const key of ['og:title','og:description','og:image','og:url','og:type'])if(!first(key).trim())issues.push({key,code:'누락'});
 for(const {key,count} of fields)if(count>1&&key!=='og:image')issues.push({key,code:'중복 태그'});
 for(const key of ['og:image','og:url','twitter:image'])if(first(key)&&!httpURL(first(key),base))issues.push({key,code:'유효하지 않은 URL'});else if(first(key)&&!httpURL(first(key)))issues.push({key,code:'절대 URL 권장'});
 if(!canonicalRaw)issues.push({key:'canonical',code:'누락'});else if(!httpURL(canonicalRaw,base))issues.push({key:'canonical',code:'유효하지 않은 URL'});
 return {fields,issues,title:root.querySelector('title')?.textContent||'',description:first('description'),robots:first('robots'),canonical:httpURL(canonicalRaw,base),canonicalRaw,image:httpURL(first('og:image')||first('twitter:image'),base),previewTitle:first('og:title')||root.querySelector('title')?.textContent||'',previewDescription:first('og:description')||first('description'),source};
}
export async function fetchPage(url,signal){
 const response=await fetch('/api/inspect-url',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url}),credentials:'omit',cache:'no-store',signal});
 let data;try{data=await response.json()}catch{throw Error('검사 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.')}
 if(!response.ok){
  const errors={TIMEOUT:'조회 시간이 초과되었습니다. HTML로 검사해 주세요.',RATE_LIMITED:'조회가 너무 많습니다. 1분 후 다시 시도해 주세요.',NOT_HTML:'HTML 페이지 주소를 입력해 주세요.',HTML_TOO_LARGE:'HTML은 2MB 이하로 입력해 주세요.',BLOCKED_URL:'공개된 외부 웹사이트 주소를 입력해 주세요.',INVALID_URL:'http 또는 https 페이지 주소를 입력해 주세요.',DNS_FAILED:'도메인을 찾을 수 없습니다. 주소를 확인해 주세요.'};
  throw Error(errors[data.error]||(/^HTTP_/.test(data.error)?'대상 사이트가 요청을 거부했거나 페이지가 없습니다. HTML로 검사해 주세요.':'대상 사이트에 연결하지 못했습니다. HTML로 검사해 주세요.'));
 }
 if(typeof data.html!=='string'||!httpURL(data.url))throw Error('검사 서버의 응답이 올바르지 않습니다.');
 if(new TextEncoder().encode(data.html).length>MAX_HTML_BYTES)throw Error('HTML은 2MB 이하로 입력해 주세요.');
 return data;
}
