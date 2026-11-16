import {useEffect,useRef,useState} from 'react';
import {siteBase} from './routing.mjs';
import {footerHTML} from './footer.mjs';
let saved:any=null,savedUntil=0;
export default function SiteFooter({language}:{language:string}){
 const root=useRef<HTMLElement>(null),[stats,setStats]=useState(()=>Date.now()<savedUntil?saved:null);
 useEffect(()=>{
  const ctl=new AbortController();let started=false,mounted=true;
  const load=async()=>{
   if(started)return;started=true;
   if(Date.now()<savedUntil){setStats(saved);return}
   const timer=setTimeout(()=>ctl.abort(),10000);
   try{const response=await fetch('/api/visitor-stats',{credentials:'omit',signal:ctl.signal});if(!response.ok)throw Error();const data=await response.json();if(!['ok','not_configured','unavailable'].includes(data.status))throw Error();saved=data;savedUntil=Date.now()+300000;setStats(data)}catch{if(mounted)setStats({status:'unavailable'})}finally{clearTimeout(timer)}
  };
  let observer:IntersectionObserver|undefined;
  if(typeof IntersectionObserver!=='undefined'){observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer?.disconnect();void load()}},{rootMargin:'200px'});if(root.current)observer.observe(root.current)}else void load();
  return()=>{mounted=false;observer?.disconnect();ctl.abort()};
 },[]);
 return <footer ref={root} className="site-footer" dangerouslySetInnerHTML={{__html:footerHTML(siteBase(),language,stats)}}/>;
}
