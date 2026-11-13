import {getLanguage} from './i18n.mjs';
export function siteBase(doc=document){return new URL(doc.querySelector('meta[name="site-base"]').content,window.location.origin).pathname}
export function routeHref(id='',query='',lang=getLanguage()){if(id==='md-to-html')id='markdown';return siteBase()+(lang==='ko'?'':lang+'/')+(id?id+'/':'')+(query?'?q='+encodeURIComponent(query):'')}
export function readRoute(location,base){const legacy=location.hash.startsWith('#/');const path=legacy?location.hash.slice(2).split('?')[0]:location.pathname.startsWith(base)?location.pathname.slice(base.length):'not-found';const route=path.replace(/^(en|ja)(\/|$)/,'').replace(/\/$/,'')||'home';return route==='md-to-html'?'markdown':route}
export function getRoute(){return readRoute(window.location,siteBase())}
export function getQuery(){return new URLSearchParams(window.location.hash.startsWith('#/')?window.location.hash.split('?')[1]||'':window.location.search).get('q')||''}
export function navigate(url,replace=false){history[replace?'replaceState':'pushState']({},'',url);window.dispatchEvent(new Event('pocket:navigate'))}
export function installRouting(){
 const migrate=()=>{if(window.location.hash.startsWith('#/'))navigate(routeHref(getRoute()==='home'?'':getRoute(),getQuery()),true)};migrate();if(location.pathname.includes('/md-to-html'))navigate(routeHref('markdown',getQuery()),true);
 const click=e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest?.('a');if(!a||a.target||a.hasAttribute('download'))return;const u=new URL(a.href);if(u.origin!==location.origin||!u.pathname.startsWith(siteBase())||u.hash)return;e.preventDefault();navigate(u.pathname+u.search)};
 document.addEventListener('click',click);window.addEventListener('hashchange',migrate);
 return()=>{document.removeEventListener('click',click);window.removeEventListener('hashchange',migrate)};
}
