import catalog from './translations.json' with {type:'json'};
export const languages=['ko','en','ja'];
export function getLanguage(){if(typeof window==='undefined')return 'ko';const base=document.querySelector('meta[name="site-base"]')?.content||'/';const path=window.location.pathname.startsWith(base)?window.location.pathname.slice(base.length):'';return ['en','ja'].includes(path.split('/')[0])?path.split('/')[0]:'ko'}
export const locale=()=>({ko:'ko-KR',en:'en-US',ja:'ja-JP'}[getLanguage()]);
const normalized=new Map(Object.entries(catalog).map(([k,v])=>[k.replace(/\s+/g,' ').trim(),v]));
const patterns=Object.entries(catalog).filter(([k])=>/\{\d+\}/.test(k)).sort((a,b)=>b[0].replace(/\{\d+\}/g,'').length-a[0].replace(/\{\d+\}/g,'').length).map(([k,v])=>{const ids=[];const pieces=k.split(/(\{\d+\})/).map(s=>{if(/^\{\d+\}$/.test(s)){ids.push(Number(s.slice(1,-1)));return '([\\s\\S]*?)'}return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')});return {re:new RegExp('^'+pieces.join('')+'$'),ids,v}});
export function t(value,lang=getLanguage()){
 if(typeof value!=='string'||lang==='ko'||!['en','ja'].includes(lang))return value;
 const index=lang==='en'?0:1;const exact=catalog[value];if(exact)return exact[index];
 const key=value.replace(/\s+/g,' ').trim();const match=normalized.get(key);if(match)return (value.match(/^\s*/)?.[0]||'')+match[index]+(value.match(/\s*$/)?.[0]||'');
 if(!/[가-힣]/.test(value))return value;
 for(const {re,ids,v} of patterns){const m=value.match(re);if(m)return v[index].replace(/\{(\d+)\}/g,(_,n)=>t(m[ids.indexOf(Number(n))+1],lang))}
 return value;
}
export function dateLabel(date,lang=getLanguage()){return new Intl.DateTimeFormat({ko:'ko-KR',en:'en-US',ja:'ja-JP'}[lang],{timeZone:'UTC',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(date)}
