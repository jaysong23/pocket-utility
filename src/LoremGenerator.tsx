import {useState} from 'react';
import {getLanguage,t as tr} from './i18n.mjs';
import {generateLorem} from './lorem.mjs';
export default function LoremGenerator(){
 const [language,setLanguage]=useState(getLanguage()),[paragraphs,setParagraphs]=useState(3),[sentences,setSentences]=useState(4),[text,setText]=useState(()=>generateLorem(getLanguage())),[status,setStatus]=useState('');
 const generate=(lang=language,p=paragraphs,s=sentences)=>{setText(generateLorem(lang,p,s));setStatus('')};
 const save=()=>{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='lorem-'+language+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 return <><div className="tool-heading"><span className="eyebrow">LOREM IPSUM GENERATOR</span><h1>{tr('Lorem ipsum 생성기')}</h1><p>{tr('한글·영어·일본어 예시 문장을 간편하게 생성하세요.')}</p></div><section className="og-input"><div className="lorem-options">
 <label>{tr('문장 언어')}<select value={language} onChange={e=>{setLanguage(e.target.value);generate(e.target.value)}}><option value="ko">{tr('한국어')}</option><option value="en">English</option><option value="ja">日本語</option></select></label>
 <label>{tr('문단 수')}<input type="number" min="1" max="20" value={paragraphs} onChange={e=>{const n=Math.max(1,Math.min(20,Number(e.target.value)||1));setParagraphs(n);generate(language,n)}}/></label>
 <label>{tr('문단당 문장 수')}<input type="number" min="1" max="10" value={sentences} onChange={e=>{const n=Math.max(1,Math.min(10,Number(e.target.value)||1));setSentences(n);generate(language,paragraphs,n)}}/></label></div>
 <textarea aria-label={tr('생성된 텍스트')} value={text} readOnly rows={12}/><div className="og-actions"><button onClick={()=>generate()}>{tr('다시 생성')}</button><button onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('복사했어요.')}catch{setStatus('복사하지 못했습니다. 텍스트를 직접 선택해 주세요.')}}}>{tr('전체 복사')}</button><button onClick={save}>{tr('TXT 다운로드')}</button></div><p role="status" className="og-hint">{tr(status)}</p></section></>;
}
