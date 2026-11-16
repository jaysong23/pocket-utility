import {useState} from 'react';
import {getLanguage,t as tr} from './i18n.mjs';
import {routeHref} from './routing.mjs';
import {infoPage,infoHTML,CONTACT_EMAIL,contactSubject,contactMailto} from './info-pages.mjs';
export default function InfoPage({id}:{id:string}){
 const lang=getLanguage(),page=infoPage(id,lang);
 const [subject,setSubject]=useState(''),[message,setMessage]=useState(''),[status,setStatus]=useState('');
 const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);setStatus('복사했어요.')}catch{setStatus('복사하지 못했습니다. 텍스트를 직접 선택해 주세요.')}};
 return <><nav className="breadcrumbs" aria-label={tr('탐색 경로')}><a href={routeHref()}>{tr('모든 도구')}</a><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span></nav><div className="tool-heading"><span className="eyebrow">MY POCKET UTILITY</span><h1>{page.title}</h1><p>{page.description}</p></div><div dangerouslySetInnerHTML={{__html:infoHTML(id,lang)}}/>{id==='contact'&&<form className="contact-form" onSubmit={e=>{e.preventDefault();window.location.href=contactMailto(subject,message);setStatus('이메일 앱에서 최종 전송해 주세요. 아직 발송 완료된 상태가 아닙니다.')}}>
 <div className="contact-recipient"><span>{tr('받는 사람')}</span><a href={contactMailto('', '')}>{CONTACT_EMAIL}</a><button type="button" onClick={()=>void copy(CONTACT_EMAIL)}>{tr('이메일 주소 복사')}</button></div>
 <label htmlFor="contact-subject">{tr('문의 제목')}</label><div className="contact-subject"><span aria-hidden="true">[MPU]</span><input id="contact-subject" required maxLength={120} value={subject} onChange={e=>setSubject(e.target.value)} autoComplete="off" aria-describedby="contact-prefix-note"/></div><small id="contact-prefix-note">{tr('제목 앞에 [MPU]가 자동으로 붙습니다.')}</small>
 <label htmlFor="contact-message">{tr('문의 내용')}</label><textarea id="contact-message" required maxLength={1500} rows={9} value={message} onChange={e=>setMessage(e.target.value)} aria-describedby="contact-note"/>
 <p id="contact-note" className="og-hint">{tr('이메일 앱이 열리지 않으면 주소와 작성 내용을 복사해 웹메일에서 보내주세요.')}</p><div className="og-actions"><button type="submit" disabled={!subject.trim()||!message.trim()}>{tr('이메일 앱에서 보내기')}</button><button type="button" disabled={!subject.trim()||!message.trim()} onClick={()=>void copy(contactSubject(subject)+'\n\n'+message)}>{tr('작성 내용 복사')}</button></div><p role="status">{tr(status)}</p>
 </form>}</>;
}
