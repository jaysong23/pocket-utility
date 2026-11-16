import {useState} from 'react';
import {t as tr} from './i18n.mjs';
import {generateFiller} from './lorem.mjs';
export default function LoremGenerator(){
 const [language,setLanguage]=useState('la'),[paragraphs,setParagraphs]=useState(3),[sentences,setSentences]=useState(4),[text,setText]=useState(()=>generateFiller()),[status,setStatus]=useState(''),[mode,setMode]=useState('paragraphs');
 const generate=(lang=language,p=paragraphs,s=sentences,m=mode)=>{setText(generateFiller(lang,m,p,s));setStatus('')};
 const save=()=>{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='lorem-'+language+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 return <><div className="tool-heading"><span className="eyebrow">LOREM IPSUM GENERATOR</span><h1>{tr('Lorem ipsum 생성기')}</h1><p>{tr('의미에 집중하지 않고 레이아웃을 확인하는 더미 텍스트를 생성하세요.')}</p></div><section className="og-input"><div className="lorem-options">
 <label>{tr('문장 언어')}<select value={language} onChange={e=>{setLanguage(e.target.value);generate(e.target.value)}}><option value="ko">{tr('한국어')}</option><option value="la">{tr('라틴어 · Lorem ipsum')}</option><option value="ja">日本語</option></select></label>
 <label>{tr('분량 기준')}<select value={mode} onChange={e=>{setMode(e.target.value);setParagraphs(3);generate(language,3,sentences,e.target.value)}}><option value="paragraphs">{tr('문단 수')}</option><option value="words">{tr('단어 수')}</option><option value="characters">{tr('글자 수')}</option></select></label>
 <label>{tr('분량')}<input type="number" min="1" max={mode==='paragraphs'?20:mode==='words'?2000:10000} value={paragraphs} onChange={e=>{const n=Math.max(1,Math.min(mode==='paragraphs'?20:mode==='words'?2000:10000,Number(e.target.value)||1));setParagraphs(n);generate(language,n)}}/></label>
 {mode==='paragraphs'&&<label>{tr('문단당 문장 수')}<input type="number" min="1" max="10" value={sentences} onChange={e=>{const n=Math.max(1,Math.min(10,Number(e.target.value)||1));setSentences(n);generate(language,paragraphs,n)}}/></label>}</div>
 <p className="og-hint">{tr('글자 수는 공백·문장부호를 포함합니다. 단어 수는 공백 기준이며, 일본어는 문장 단위로 구분합니다.')}</p><textarea aria-label={tr('생성된 텍스트')} value={text} readOnly rows={12}/><div className="og-actions"><button onClick={()=>generate()}>{tr('다시 생성')}</button><button onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('복사했어요.')}catch{setStatus('복사하지 못했습니다. 텍스트를 직접 선택해 주세요.')}}}>{tr('전체 복사')}</button><button onClick={save}>{tr('TXT 다운로드')}</button></div><p role="status" className="og-hint">{tr(status)}</p></section></>;
}
