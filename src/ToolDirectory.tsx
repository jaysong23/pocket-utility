import {useEffect,useState} from 'react';
import {Search,Star,ArrowUpRight,History} from 'lucide-react';
import {t as tr} from './i18n.mjs';
import {routeHref,navigate} from './routing.mjs';
const event='pocket:collection';
function read(key:string):string[]{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,30):[]}catch{return []}}
function write(key:string,value:string[]){try{localStorage.setItem(key,JSON.stringify(value))}catch{}window.dispatchEvent(new Event(event))}
export function recordTool(id:string){write('pocket-recent',[id,...read('pocket-recent').filter(x=>x!==id)].slice(0,5))}
function useCollection(key:string){const [value,setValue]=useState(()=>read(key));useEffect(()=>{const sync=()=>setValue(read(key));window.addEventListener(event,sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener(event,sync);window.removeEventListener('storage',sync)}},[key]);return value}
export function FavoriteButton({id}:{id:string}){const favorites=useCollection('pocket-favorites');const active=favorites.includes(id);return <button className="favorite-button" aria-pressed={active} aria-label={tr(active?'즐겨찾기 해제':'즐겨찾기 추가')} onClick={()=>write('pocket-favorites',active?favorites.filter(x=>x!==id):[...favorites,id])}><Star size={17} fill={active?'currentColor':'none'}/><span>{tr(active?'저장됨':'즐겨찾기')}</span></button>}
export function openToolSearch(){navigate(routeHref());setTimeout(()=>document.getElementById('tool-finder')?.focus(),0)}
export default function ToolDirectory({tools}: {tools:any[]}){
 const [search,setSearch]=useState(''),[category,setCategory]=useState('전체'),[savedOnly,setSavedOnly]=useState(false);
 const favorites=useCollection('pocket-favorites'),recent=useCollection('pocket-recent');
 const visible=tools.filter(tool=>(category==='전체'||tool.category===category)&&(!savedOnly||favorites.includes(tool.id))&&`${tr(tool.name)} ${tool.name} ${tool.english} ${tr(tool.text)} ${tool.tags.map((x:string)=>tr(x)).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
 const reset=()=>{setSearch('');setCategory('전체');setSavedOnly(false)};
 return <><section className="hub-hero"><div className="hero-copy"><span className="eyebrow">YOUR EVERYDAY TOOLKIT</span><h1>{tr('일상에 필요한 ')}<span>{tr('작은 도구들.')}</span></h1><p>{tr('찾고, 바로 쓰고, 끝. 자주 쓰는 도구를 한곳에.')}</p></div></section>
 {recent.some(id=>tools.some(t=>t.id===id))&&<section className="recent-strip" aria-label={tr('최근 사용한 도구')}><span><History size={16}/>{tr('최근 사용')}</span><div>{recent.map(id=>{const tool=tools.find(t=>t.id===id);return tool&&<a key={id} href={routeHref(id)}>{tr(tool.name)}</a>})}</div><button onClick={()=>write('pocket-recent',[])}>{tr('기록 지우기')}</button></section>}
 <section className="tool-directory" aria-label={tr('모든 도구')}><div className="finder-row"><label className="tool-search"><Search size={20}/><input id="tool-finder" type="search" placeholder={tr('필요한 도구 검색')} aria-label={tr('필요한 도구 검색')} value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ / Ctrl K</kbd></label><button className={'saved-filter '+(savedOnly?'active':'')} aria-pressed={savedOnly} onClick={()=>setSavedOnly(!savedOnly)}><Star size={16}/>{tr('즐겨찾기')} <span>{favorites.filter(id=>tools.some(t=>t.id===id)).length}</span></button></div>
 <div className="directory-bar"><div className="tabs">{['전체','이미지','날짜·시간','텍스트·경로','계산·변환'].map(c=><button key={c} aria-pressed={category===c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{tr(c)}<span>{tools.filter(t=>c==='전체'||t.category===c).length}</span></button>)}</div><span className="result-count" role="status">{tr('검색 결과')} · {visible.length}</span></div>
 <div className="tool-grid">{visible.map(({id,name,english,text,Icon,color,tags,category})=><article className={'tool-tile '+color} key={id}><a href={routeHref(id)} className={`tool-card ${color}`}><div className="card-top"><span className="tool-icon"><Icon size={26} strokeWidth={1.6}/></span><span className="category-tag">{tr(category)}</span></div><span className="tool-english">{tr(english)}</span><h2>{tr(name)}<ArrowUpRight size={20}/></h2><p>{tr(text)}</p><div className="card-tags">{tags.map((tag:string)=><span key={tag}>{tr(tag)}</span>)}</div></a><div className="tile-bottom"><FavoriteButton id={id}/><a href={routeHref(id)} aria-label={tr(name)}>{tr('도구 열기')} <ArrowUpRight size={14}/></a></div></article>)}</div>
 {!visible.length&&<div className="no-results"><Search size={26}/><h2>{tr(savedOnly?'저장한 도구가 없어요.':'검색한 도구가 없어요.')}</h2><p>{tr(savedOnly?'별표를 눌러 자주 쓰는 도구를 모아보세요.':'검색어를 줄이거나 다른 카테고리를 선택해 보세요.')}</p><button onClick={reset}>{tr('모든 도구 보기')}</button></div>}</section>
 <section className="hub-faq"><h2>{tr('사용 전에 궁금한 점')}</h2>{[
 ['사진이나 파일이 서버에 저장되나요?','이미지·PDF·마크다운 변환은 브라우저에서 처리합니다. 변환할 파일은 서버에 업로드하지 않습니다.'],
 ['인터넷 연결이 필요한가요?','사이트와 변환기 로딩, 이미지 링크 불러오기, 환율·서버 시각 조회에는 인터넷 연결이 필요합니다.'],
 ['즐겨찾기와 최근 기록은 어디에 저장되나요?','이 브라우저에 도구 목록만 저장합니다. 입력 내용이나 파일은 기록하지 않으며, 다른 기기와 동기화하지 않습니다.']
 ].map(([q,a])=><details key={q}><summary>{tr(q)}</summary><p>{tr(a)}</p></details>)}</section></>;
}
