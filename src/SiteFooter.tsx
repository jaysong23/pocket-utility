import {useEffect,useState} from 'react';
import {siteBase} from './routing.mjs';
import {footerHTML} from './footer.mjs';
import {loadVisitorStats} from './visitor-client.mjs';
export default function SiteFooter({language}:{language:string}){
 const [stats,setStats]=useState<any>(null);
 useEffect(()=>{
  let mounted=true;
  // Count page visits even when the visitor never scrolls down to the footer.
  loadVisitorStats().then(data=>{if(mounted)setStats(data)}).catch(()=>{if(mounted)setStats({status:'unavailable'})});
  return()=>{mounted=false};
 },[]);
 return <footer className="site-footer" dangerouslySetInnerHTML={{__html:footerHTML(siteBase(),language,stats)}}/>;
}
