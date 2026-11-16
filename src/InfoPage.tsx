import {getLanguage,t as tr} from './i18n.mjs';
import {routeHref} from './routing.mjs';
import {infoPage,infoHTML} from './info-pages.mjs';
export default function InfoPage({id}:{id:string}){
 const lang=getLanguage(),page=infoPage(id,lang);
 return <><nav className="breadcrumbs" aria-label={tr('탐색 경로')}><a href={routeHref()}>{tr('모든 도구')}</a><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span></nav><div className="tool-heading"><span className="eyebrow">MY POCKET UTILITY</span><h1>{page.title}</h1><p>{page.description}</p></div><div dangerouslySetInnerHTML={{__html:infoHTML(id,lang)}}/></>;
}
