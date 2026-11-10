import {useEffect, useState} from 'react';
import {ArrowLeftRight, Check, Copy, FolderSync, X} from 'lucide-react';
import {convertPath} from './path.mjs';

export default function PathConverter() {
  const [input,setInput]=useState('');
  const [protocol,setProtocol]=useState('smb');
  const [customProtocol,setCustomProtocol]=useState('');
  const [status,setStatus]=useState('');
  const [autoCopy,setAutoCopy]=useState(true);
  useEffect(()=>{try { const stored=localStorage.getItem('pocket-path-protocol'); if(stored&&['smb','afp','none','custom'].includes(stored)) setProtocol(stored); setCustomProtocol(localStorage.getItem('pocket-path-custom-protocol')||''); } catch {}},[]);
  let result={output:'',direction:'자동 감지',note:''}, error='';
  try {result=convertPath(input,protocol,customProtocol)} catch(e) {error=(e as Error).message}
  const copy=async(text:string)=>{if(!text)return;try{await navigator.clipboard.writeText(text);setStatus('복사했어요.')}catch{setStatus('자동 복사를 사용할 수 없어요. 결과를 선택해 직접 복사해 주세요.')}};
  const change=(text:string)=>{setInput(text);setStatus('')};
  return <>
    <div className="tool-heading"><span className="eyebrow">PATH CONVERTER</span><h1>윈도우와 맥,<br className="mobile-only"/> 경로를 이어주세요.</h1><p>공유 폴더 경로를 붙여넣으면 반대 형식으로 바로 바꿔드려요.</p></div>
    <div className="path-format-options">
      <fieldset className="path-protocol"><legend>Windows → Mac 변환 형식</legend>{[['smb','smb://','SMB · 기본'],['afp','afp://','AFP'],['none','//','구분자만 변경'],['custom','직접 입력','사용자 지정']].map(([value,label,detail])=><label key={value} className={protocol===value?'selected':''}><input type="radio" name="path-protocol" value={value} checked={protocol===value} onChange={()=>{setProtocol(value);setStatus('');try{localStorage.setItem('pocket-path-protocol',value)}catch{}}}/><b>{label}</b><small>{detail}</small></label>)}</fieldset>
      {protocol==='custom'&&<div className="path-custom"><label htmlFor="custom-protocol">사용자 지정 프로토콜</label><div><input id="custom-protocol" value={customProtocol} placeholder="예: nfs 또는 nfs://" autoComplete="off" spellCheck={false} onChange={e=>{setCustomProtocol(e.target.value);setStatus('');try{localStorage.setItem('pocket-path-custom-protocol',e.target.value)}catch{}}}/><span>://</span></div><small>영문으로 시작하며 숫자, +, -, .을 사용할 수 있어요.</small></div>}
    </div>
    <section className="path-workspace">
      <div className="path-toolbar"><span><FolderSync size={19}/>{result.direction||'자동 감지'}</span><label><input type="checkbox" checked={autoCopy} onChange={e=>setAutoCopy(e.target.checked)}/>붙여넣을 때 결과 자동 복사</label></div>
      <div className="path-panels">
        <div className="path-panel"><div className="path-panel-title"><label htmlFor="path-input">원본 경로</label><button aria-label="경로 지우기" onClick={()=>change('')} disabled={!input}><X size={16}/></button></div><textarea id="path-input" spellCheck={false} value={input} placeholder={'\\\\NAS\\공유폴더\\프로젝트\nsmb://NAS/공유폴더/프로젝트'} onChange={e=>change(e.target.value)} onPaste={e=>{const text=e.clipboardData.getData('text');e.preventDefault();const el=e.currentTarget;const next=input.slice(0,el.selectionStart)+text+input.slice(el.selectionEnd);change(next);if(autoCopy){try{void copy(convertPath(next,protocol,customProtocol).output)}catch{}}}}/><small>Windows 경로 또는 Mac 공유 경로</small></div>
        <div className="path-panel output"><div className="path-panel-title"><label htmlFor="path-output">변환된 경로</label><span>{result.output?'변환 완료':'입력 대기'}</span></div><textarea id="path-output" spellCheck={false} value={result.output} readOnly placeholder="변환 결과가 여기에 표시됩니다."/><div className="path-actions"><button onClick={()=>change(result.output)} disabled={!result.output}><ArrowLeftRight size={16}/>반대로 변환</button><button className="path-copy" disabled={!result.output} onClick={()=>void copy(result.output)}>{status==='복사했어요.'?<Check size={16}/>:<Copy size={16}/>}결과 복사</button></div></div>
      </div>

      {error&&<p className="path-error" role="alert">{error}</p>}<p className="path-status" role="status">{status||result.note||'입력한 경로는 서버로 전송하거나 저장하지 않습니다.'}</p>
    </section>
    <div className="examples path-examples"><span>예시로 시작하기</span>{[['Windows 공유 경로','\\\\NAS\\공유폴더\\2026 프로젝트'],['Mac 공유 경로','smb://NAS/공유폴더/2026 프로젝트']].map(([label,value])=><button key={label} onClick={()=>change(value)}>{label}</button>)}</div>
    <section className="week-help"><h3>어떻게 사용하나요?</h3><div><p><b>경로를 붙여넣으세요</b>역슬래시(\\)가 있는 Windows 경로는 Mac 형식으로, 슬래시(/)가 있는 Mac 경로는 Windows 형식으로 변환합니다. 한글과 공백은 그대로 유지됩니다.</p><p><b>공유 폴더에서 편리하게</b>Windows의 \\NAS 공유 경로와 Mac의 smb:// 또는 afp:// 경로를 서로 바꿀 수 있어요. 복사한 경로를 탐색기나 Finder의 서버 연결에 붙여넣으세요.</p><p><b>파일 이동 없이, 표기만 변경</b>파일을 열거나 옮기는 기능은 아닙니다. C: 드라이브와 Mac의 /Volumes 같은 로컬 위치는 자동으로 매핑되지 않습니다.</p></div></section>
  </>;
}
