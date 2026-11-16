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
 const response=await fetch(url,{mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',signal});
 if(!response.ok)throw Error('HTTP '+response.status);
 const type=response.headers.get('content-type')||'';
 if(type&&!/text\/html|application\/xhtml\+xml/i.test(type))throw Error('HTML 페이지 주소를 입력해 주세요.');
 if(Number(response.headers.get('content-length'))>MAX_HTML_BYTES)throw Error('HTML은 2MB 이하로 입력해 주세요.');
 const reader=response.body?.getReader();if(!reader){const html=await response.text();if(new TextEncoder().encode(html).length>MAX_HTML_BYTES)throw Error('HTML은 2MB 이하로 입력해 주세요.');return {html,url:response.url||url}}
 const chunks=[];let length=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>MAX_HTML_BYTES){await reader.cancel();throw Error('HTML은 2MB 이하로 입력해 주세요.')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(length);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length}
 const charset=type.match(/charset\s*=\s*["']?([^\s;"']+)/i)?.[1]||'utf-8';let decoder;try{decoder=new TextDecoder(charset)}catch{decoder=new TextDecoder()}
 return {html:decoder.decode(bytes),url:response.url||url};
}
