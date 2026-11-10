import {useState} from 'react';
import {Copy,Search,Trash2} from 'lucide-react';
import {fontStyles,stylize,symbolGroups} from './text-tools.mjs';
function useCopy(){const [status,setStatus]=useState('');const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);setStatus(`복사했어요: ${text.slice(0,40)}`)}catch{setStatus('복사를 사용할 수 없어요. 텍스트를 선택해 직접 복사해 주세요.')}};return {status,copy}}
export function Symbols(){const [category,setCategory]=useState('전체'),[search,setSearch]=useState(''),[collection,setCollection]=useState('');const {status,copy}=useCopy();const groups=symbolGroups.filter(g=>(category==='전체'||category===g.name)&&(!search||`${g.name} ${g.hint} ${g.chars.join('')}`.includes(search.trim())));return <>
 <div className="tool-heading"><span className="eyebrow">SPECIAL CHARACTERS</span><h1>찾고, 누르고, 붙여넣으세요.</h1><p>윈도우에서도 맥에서도. 필요한 특수문자를 클릭하면 바로 복사됩니다.</p></div>
 <div className="shortcut-guide"><span><b>Windows</b> Win + . <small>이모지·기호 패널</small></span><span><b>Mac</b> Control + Command + Space <small>문자 뷰어</small></span></div>
 <div className="text-tool-controls"><label className="tool-search"><Search size={16}/><input aria-label="특수문자 검색" placeholder="하트, 화살표, 단위…" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="symbol-tabs">{['전체',...symbolGroups.map(g=>g.name)].map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
 <section className="symbol-compose"><label htmlFor="symbol-collection">모아 쓰기 <small>선택한 문자가 여기에 쌓여요.</small></label><div><input id="symbol-collection" value={collection} onChange={e=>setCollection(e.target.value)} placeholder="문자를 골라 나만의 조합을 만드세요."/><button onClick={()=>void copy(collection)} disabled={!collection}><Copy size={15}/>전체 복사</button><button aria-label="모은 문자 지우기" onClick={()=>setCollection('')} disabled={!collection}><Trash2 size={15}/></button></div></section>
 <p className="copy-feedback" role="status">{status||'특수문자는 기기 안에서 처리되며 서버에 저장하지 않습니다.'}</p>
 <div className="symbol-sections">{groups.map(g=><section key={g.name} className="symbol-group"><h2>{g.name}<small>{g.chars.length}</small></h2><div className="symbol-grid">{g.chars.map((c,i)=><button key={i} title={`${c} · ${Array.from(c).map(x=>'U+'+x.codePointAt(0)!.toString(16).toUpperCase()).join(' ')}`} aria-label={`${c} 복사`} onClick={()=>{setCollection(v=>v+c);void copy(c)}}>{c}</button>)}</div></section>)}</div>{!groups.length&&<p className="no-results">검색한 문자가 없어요. 다른 분류나 검색어를 사용해 주세요.</p>}
 <p className="text-tool-note">Windows 한글 입력기에서는 자음 입력 후 한자 키로도 특수문자를 선택할 수 있어요. 단축키와 문자 모양은 OS·입력기·글꼴에 따라 달라질 수 있습니다.</p>
 </>}
export function InstaFonts(){const [input,setInput]=useState('Pocket Utility'),{status,copy}=useCopy();return <>
 <div className="tool-heading"><span className="eyebrow">INSTA FONTS</span><h1>평범한 문장을, 나만의 스타일로.</h1><p>영문과 숫자를 입력하고 마음에 드는 스타일을 복사하세요.</p></div>
 <section className="font-input"><label htmlFor="font-text">변환할 문장</label><textarea id="font-text" value={input} maxLength={2000} onChange={e=>setInput(e.target.value)} placeholder="Write your message here"/><div><span>한글·이모지·지원하지 않는 숫자는 원문 그대로 유지합니다.</span><span>{input.length} / 2,000</span></div></section>
 <p className="copy-feedback" role="status">{status||'입력하면 12가지 스타일로 바로 변환됩니다.'}</p><div className="font-results">{fontStyles.map(style=>{const output=stylize(input,style.id);return <section className="font-result" key={style.id}><div><h2>{style.name}</h2><button disabled={!input} onClick={()=>void copy(output)}><Copy size={15}/>복사</button></div><p>{output||'문장을 입력해 주세요.'}</p></section>})}</div>
 <p className="text-tool-note">글꼴 파일이 아닌 유니코드 문자로 변환합니다. 인스타그램 등 붙여넣는 앱과 기기에 따라 모양이 다르거나 일부 글자가 표시되지 않을 수 있으며, 검색·스크린리더에서 일반 영문과 다르게 처리될 수 있어요.</p>
 </>}
