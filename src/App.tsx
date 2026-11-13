import { t as tr, locale, getLanguage } from "./i18n.mjs";
import { guides, guideHTML } from './guides.mjs';
import { getRoute, getQuery, routeHref, navigate, installRouting } from './routing.mjs';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, ArrowLeft, Search, Image, CalendarDays, Smartphone, ChevronLeft, ChevronRight, Copy, Check, Command, FolderSync, Moon, Sun, Type, Shapes, Coins, Ruler, FileImage, Timer, FileCode2 } from 'lucide-react';
import Converter from './Converter';
import PathConverter from './PathConverter';
import { Symbols, InstaFonts } from './TextTools';
import { CurrencyConverter, UnitConverter } from './Calculators';
import PdfConverter from './PdfConverter';
import MarkdownConverter from './MarkdownConverter';
import ClockTimer from './ClockTimer';
import {updatePageMeta} from './seo.mjs';
import {dateLabel} from './i18n.mjs';
import {normalizeWeekQuery} from './week-input.mjs';
import { holidayName } from './holidays.mjs';
import { koreaToday, isoWeek, searchWeek, dateKey, addDays, fromWeek, weeksInYear } from './week.mjs';
const tools = [{
  id: 'markdown',
  name: '마크다운 변환',
  english: 'MARKDOWN CONVERTER',
  category: '텍스트·경로',
  text: '마크다운을 HTML 또는 일반 텍스트로.\n미리 보고 복사·저장하세요.',
  Icon: FileCode2,
  color: 'blue',
  tags: ['실시간 미리보기', 'HTML / Plain Text']
}, {
  id: 'webp',
  name: 'WebP 변환',
  english: 'WEBP CONVERTER',
  category: '이미지',
  text: '웹에서 받은 WebP 이미지를\n익숙한 JPG, PNG로 바꿔보세요.',
  Icon: Image,
  color: 'green',
  tags: ['WebP → JPG', 'WebP → PNG']
}, {
  id: 'heic',
  name: 'HEIC 변환',
  english: 'HEIC CONVERTER',
  category: '이미지',
  text: '아이폰 사진을 어디서든 열 수 있게.\nHEIC를 JPG, PNG로 간편하게.',
  Icon: Smartphone,
  color: 'purple',
  tags: ['HEIC → JPG', 'HEIC → PNG']
}, {
  id: 'weeknumber',
  name: '위크넘버',
  english: 'WEEK NUMBER',
  category: '날짜·시간',
  text: '오늘은 몇 주차일까요?\n날짜와 기념일로 주차를 찾아보세요.',
  Icon: CalendarDays,
  color: 'orange',
  tags: ['현재 주차', '한국어 날짜 검색']
}, {
  id: 'path-converter',
  name: '경로 변환',
  english: 'PATH CONVERTER',
  category: '텍스트·경로',
  text: '윈도우와 맥 사이, 공유 경로를\n붙여넣고 바로 바꿔보세요.',
  Icon: FolderSync,
  color: 'blue',
  tags: ['Windows ↔ Mac', 'SMB · AFP']
}, {
  id: 'symbols',
  name: '특수문자',
  english: 'SPECIAL CHARACTERS',
  category: '텍스트·경로',
  text: '하트부터 화살표, 원문자까지.\n필요한 기호를 모아 복사하세요.',
  Icon: Shapes,
  color: 'orange',
  tags: ['Windows · Mac', '모아서 복사']
}, {
  id: 'insta-fonts',
  name: '인스타 폰트',
  english: 'INSTA FONTS',
  category: '텍스트·경로',
  text: '소개글과 캡션에 새로운 표정.\n12가지 영문 스타일을 만나보세요.',
  Icon: Type,
  color: 'purple',
  tags: ['영문 스타일', '바로 복사']
}, {
  id: 'currency',
  name: '환율 변환',
  english: 'CURRENCY CONVERTER',
  category: '계산·변환',
  text: '달러, 엔화, 원화까지.\n기준일이 표시된 환율로 계산하세요.',
  Icon: Coins,
  color: 'green',
  tags: ['15개 통화', '환율 기준일']
}, {
  id: 'units',
  name: '단위 변환',
  english: 'UNIT CONVERTER',
  category: '계산·변환',
  text: '길이·무게·압력·온도 등\n9개 분야의 단위를 간편하게.',
  Icon: Ruler,
  color: 'blue',
  tags: ['9개 분야', '즉시 계산']
}, {
  id: 'pdf-to-jpg',
  name: 'PDF → JPG',
  english: 'PDF TO JPG',
  category: '이미지',
  text: 'PDF의 각 페이지를 이미지로.\n미리 보고 JPG로 저장하세요.',
  Icon: FileImage,
  color: 'orange',
  tags: ['페이지별 변환', '전체 다운로드']
}, {
  id: 'clock-timer',
  name: '시계·타이머·뽀모도로',
  english: 'CLOCK & POMODORO',
  category: '날짜·시간',
  text: '서버 시각과 나만의 집중 시간.\nPIP 미니 창으로 언제나 가까이.',
  Icon: Timer,
  color: 'purple',
  tags: ['서버 시각', '뽀모도로 · PIP']
}];
function usePreference(key: string, fallback: string) {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  });
  const update = (next: string) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch {}
  };
  return [value, update] as const;
}
function ThemeToggle() {
  const [theme, setTheme] = usePreference('pocket-theme', typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={tr(theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환')} title={tr(theme === 'dark' ? '라이트모드' : '다크모드')} aria-pressed={theme === 'dark'}>{tr(theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />)}<span>{tr(theme === 'dark' ? '라이트' : '다크')}</span></button>;
}
function useToday() {
  const [today, setToday] = useState(koreaToday);
  useEffect(() => {
    const timer = setInterval(() => setToday(koreaToday()), 30000);
    return () => clearInterval(timer);
  }, []);
  return today;
}
function Month({
  year,
  month,
  result,
  today
}: {
  year: number;
  month: number;
  result: any;
  today: Date;
}) {
  const first = new Date(Date.UTC(year, month, 1)),
    start = isoWeek(first).start;
  const rows = [];
  for (let r = 0; r < 6; r++) {
    const monday = addDays(start, r * 7);
    if (r > 0 && monday.getUTCMonth() !== month) break;
    const w = isoWeek(monday);
    rows.push(<tr key={r}><th><a href={routeHref("weeknumber", `${w.year}년 ${w.week}주차`)} aria-label={tr(`${w.year}년 ${w.week}주차`)}>{tr(w.week)}</a></th>{tr(Array.from({
        length: 7
      }, (_, i) => {
        const d = addDays(monday, i),
          inside = d.getUTCMonth() === month,
          holiday = holidayName(d);
        return <td key={i} className={`${inside ? '' : 'muted'} ${d >= result.start && d <= result.end ? 'selected-week' : ''}`}><a href={routeHref("weeknumber", dateKey(d))} className={`${dateKey(d) === dateKey(today) ? 'today' : ''} ${result.date && dateKey(d) === dateKey(result.date) ? 'selected-day' : ''}`} title={tr(holiday || undefined)} aria-label={tr(`${dateLabel(d)}${holiday ? ` · ${tr(holiday)}` : ''}`)}>{tr(d.getUTCDate())}{tr(holiday && <span className="holiday-dot" aria-hidden="true" />)}</a></td>;
      }))}</tr>);
  }
  return <div className="month"><h3>{new Intl.DateTimeFormat(locale(),{month:"long",timeZone:"UTC"}).format(new Date(Date.UTC(year,month,1)))}</h3><table><thead><tr>{tr(['주', '월', '화', '수', '목', '금', '토', '일'].map(x => <th key={x}>{tr(x)}</th>))}</tr></thead><tbody>{tr(rows)}</tbody></table></div>;
}
function WeekNumber({
  query
}: {
  query: string;
}) {
  const today = useToday();
  const [corners, setCorners] = usePreference('pocket-calendar-corners', 'rounded');
  const [input, setInput] = useState(query),
    [copied, setCopied] = useState(false);
  useEffect(() => setInput(query), [query]);
  let result: any,
    error = '';
  try {
    result = searchWeek(normalizeWeekQuery(query), today);
    if(result.date&&/\d{4}년 \d{1,2}월/.test(result.label))result.label=dateLabel(result.date);
  } catch (e) {
    error = (e as Error).message;
  }
  const current = isoWeek(today);
  const [calendarYear, setCalendarYear] = useState(result?.date?.getUTCFullYear() || result?.year || current.year);
  useEffect(() => {
    if (result) setCalendarYear(result.date?.getUTCFullYear() || result.year);
  }, [query, dateKey(today)]);
  const run = (q: string) => {
    navigate(routeHref('weeknumber', q));
  };
  const same = result && result.year === current.year && result.week === current.week;
  return <><div className="tool-heading"><span className="eyebrow">DATE & TIME / 03</span><h1>{tr("위크넘버")}</h1><p>{tr("“내년 추석”도, “12월 23일”도. 한국어로 편하게 검색하세요.")}</p></div><section className="week-search"><form onSubmit={e => {
        e.preventDefault();
        run(input);
      }}><Search size={21} /><input aria-label={tr("날짜 또는 주차 검색")} value={input} onChange={e => setInput(e.target.value)} placeholder={tr("52주차, 12월 23일, 크리스마스, 내년 추석")} /><button type="submit">{tr("조회하기 ")}<ArrowRight size={17} /></button></form><div className="examples"><span>{tr("이렇게 검색해 보세요")}</span>{tr(['오늘', '52주차', '12월 23일', '크리스마스', '내년 추석'].map(x => <button key={x} onClick={() => run(tr(x))}>{tr(x)}</button>))}</div></section>{tr(error ? <div className="query-error" role="alert"><b>{tr("검색어를 다시 확인해 주세요.")}</b><p>{tr(error)}</p><button onClick={() => run('')}>{tr("오늘의 주차 보기")}</button></div> : <><section className="week-result" aria-live="polite"><div className="week-main"><div className="week-label"><span className="live-dot" />{tr(!query ? '오늘의 주차' : result.label)}{tr(same && query && <small>{tr("이번 주")}</small>)}</div><div className="big-week"><span>{tr(String(result.week).padStart(2, '0'))}</span><div><b>{tr("주차")}</b><small>{tr(`${result.year}년 ${result.week}주차`)}</small></div></div><p className="result-date">{tr(result.date ? dateLabel(result.date) : `${result.year}년의 ${result.week}번째 주`)}</p><span className="basis">{tr(result.basis)}</span></div><div className="week-detail"><span className="eyebrow">{tr("한 주의 기간")}</span><div className="range-date"><span>{tr("월요일")}</span><strong>{tr(dateLabel(result.start))}</strong></div><div className="range-line" /><div className="range-date"><span>{tr("일요일")}</span><strong>{tr(dateLabel(result.end))}</strong></div><div className="week-controls"><button aria-label={tr("이전 주")} onClick={() => run(dateKey(addDays(result.start, -7)))} disabled={result.start.getUTCFullYear() < 1900}><ChevronLeft size={16} />{tr(" 이전 주")}</button><button onClick={() => run('')}>{tr("오늘")}</button><button aria-label={tr("다음 주")} onClick={() => run(dateKey(addDays(result.start, 7)))} disabled={result.end.getUTCFullYear() > 2100}>{tr("다음 주 ")}<ChevronRight size={16} /></button></div></div></section>{tr(result.festival && <p className="festival-note"><CalendarDays size={17} /> {tr(result.label)}{tr(" 당일은 ")}{tr(dateLabel(result.date))}{tr("입니다. 전날·당일·다음날: ")}{tr(dateLabel(addDays(result.date, -1)))} ~ {tr(dateLabel(addDays(result.date, 1)))}. <span>{tr("대체·임시공휴일은 포함하지 않습니다.")}</span></p>)}<div className="result-bottom"><span>{tr("한국 시간 (KST) · ISO 8601 · 월요일~일요일")}</span><button onClick={async () => {
          try {
            await navigator.clipboard.writeText(`${tr(result.label)} · ${tr(`${result.year}년 ${result.week}주차`)}\n${dateLabel(result.start)} ~ ${dateLabel(result.end)}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
            alert(tr('복사를 사용할 수 없습니다. 결과를 직접 선택해 복사해 주세요.'));
          }
        }}>{tr(copied ? <Check size={15} /> : <Copy size={15} />)} {tr(copied ? '복사했어요' : '결과 복사')}</button></div><section className={`annual ${corners === 'square' ? 'calendar-square' : 'calendar-rounded'}`}><div className="section-heading"><div><span className="eyebrow">YEAR AT A GLANCE</span><h2>{tr(calendarYear)}{tr("년 주차 달력")}</h2></div><div className="year-controls"><button aria-label={tr("이전 연도")} disabled={calendarYear <= 1900} onClick={() => setCalendarYear(y => y - 1)}><ChevronLeft size={19} /></button><span>{tr(calendarYear)}</span><button aria-label={tr("다음 연도")} disabled={calendarYear >= 2100} onClick={() => setCalendarYear(y => y + 1)}><ChevronRight size={19} /></button></div></div><div className="calendar-style" role="group" aria-label={tr("달력 테두리 모양")}><span>{tr("달력 모양")}</span><button aria-pressed={corners === 'square'} className={corners === 'square' ? 'active' : ''} onClick={() => setCorners('square')}>{tr("각진 테두리")}</button><button aria-pressed={corners !== 'square'} className={corners !== 'square' ? 'active' : ''} onClick={() => setCorners('rounded')}>{tr("둥근 테두리")}</button></div><p className="calendar-caption">{tr("날짜나 왼쪽 주차 번호를 누르면 해당 주를 확인할 수 있어요. ")}<span>{tr("● 오늘\u3000 ▰ 조회한 주\u3000 ")}<i className="holiday-legend" />{tr(" 공휴일")}</span></p><p className="holiday-coverage">{tr(calendarYear === 2026 || calendarYear === 2027 ? '2026~2027년 공휴일·대체공휴일 반영. 빨간 점에 마우스를 올리면 공휴일 이름을 볼 수 있어요.' : '이 연도는 공휴일 자료가 등록되지 않아 빨간 점을 표시하지 않습니다. 공휴일 표시는 2026~2027년을 지원합니다.')}</p><div className="month-grid">{tr(Array.from({
            length: 12
          }, (_, m) => <Month key={m} year={calendarYear} month={m} result={result} today={today} />))}</div></section></>)}<section className="week-help"><h2>{tr("알아두면 좋아요")}</h2><div><p><b>{tr("주차는 어떻게 계산하나요?")}</b>{tr("월요일에 시작하고 일요일에 끝나는 ISO 주차입니다. 1월 4일을 포함한 주가 1주차이며, 연초·연말에는 달력 연도와 주차 연도가 다를 수 있어요.")}</p><p><b>{tr("어떤 검색어를 지원하나요?")}</b>{tr("오늘·내일·다음 주, 올해·내년·작년, 52주차, 27년 1주차, 2027년 1주차, 12월 23일, 26-07-30, 2027-12-23, 크리스마스·어린이날·설날·추석·부처님오신날 등을 지원합니다. 두 자리 연도는 2000년대로, 연도 생략 시 한국 시간 기준 올해로 계산합니다.")}</p><p><b>{tr("음력 기념일도 정확하게")}</b>{tr("한국 음력 변환표를 사용합니다. 양력 날짜는 1900~2100년, 음력 기념일은 1900~2050년을 지원합니다. 지원하지 않는 검색어는 추측하지 않고 안내합니다. ")}<a href="https://astro.kasi.re.kr/kor/life/post/calendarData" target="_blank" rel="noreferrer">{tr("한국천문연구원 달력자료 ↗")}</a></p></div></section></>;
}

function Navigation({route,language}:{route:string;language:string}){
 useEffect(()=>{const close=(e:any)=>{if(e.type==='keydown'&&e.key!=='Escape')return;if(e.type==='click'&&e.target.closest('.category-nav')&&!e.target.closest('a'))return;document.querySelectorAll('.category-nav details[open]').forEach(d=>d.removeAttribute('open'))};document.addEventListener('click',close);document.addEventListener('keydown',close);return()=>{document.removeEventListener('click',close);document.removeEventListener('keydown',close)}},[]);
 return <><a className="skip-link" href="#main-content">{tr('본문으로 이동')}</a><header className="site-header"><div className="nav-inner"><a className="logo" href={routeHref()}><span className="logo-mark"><Command size={22}/></span>pocket<span>utility</span><em>BETA</em></a><nav className="category-nav" aria-label={tr('주요 메뉴')}><a href={routeHref()} aria-current={route==='home'?'page':undefined}>{tr('모든 도구')}</a>{['이미지','날짜·시간','텍스트·경로','계산·변환'].map(cat=><details key={cat} onToggle={e=>{if(e.currentTarget.open)document.querySelectorAll('.category-nav details[open]').forEach(d=>{if(d!==e.currentTarget)d.removeAttribute('open')})}}><summary className={tools.find(tool=>tool.id===route)?.category===cat?'active':''}>{tr(cat)}<ChevronRight size={12}/></summary><div className="category-dropdown">{tools.filter(tool=>tool.category===cat).map(tool=><a key={tool.id} href={routeHref(tool.id)} aria-current={route===tool.id?'page':undefined}>{tr(tool.name)}</a>)}</div></details>)}</nav><div className="nav-actions"><ThemeToggle/><label className="language-switch"><span className="sr-only">{tr('언어 선택')}</span><select value={language} aria-label={tr('언어 선택')} onChange={e=>{navigate(routeHref(route==='home'?'':route,getQuery(),e.target.value))}}><option value="ko" lang="ko">한국어</option><option value="en" lang="en">English</option><option value="ja" lang="ja">日本語</option></select></label></div></div></header></>;
}

export default function App() {
  const [route, setRoute] = useState(getRoute),
    [query, setQuery] = useState(getQuery),
    [category, setCategory] = useState('전체'),
    [search, setSearch] = useState('');
  const today = useToday();
  const [language,setLanguage]=useState(getLanguage);
  useEffect(()=>{document.documentElement.lang=language;updatePageMeta(route,language)},[route,language]);
  useEffect(() => {
    const update = () => {
      setRoute(getRoute());
      setLanguage(getLanguage());
      setQuery(getQuery());
      window.scrollTo(0, 0);
    };
    window.addEventListener('pocket:navigate', update);
    window.addEventListener('popstate', update);
    const cleanup = installRouting();
    return () => {
      cleanup();
      window.removeEventListener('pocket:navigate', update);
      window.removeEventListener('popstate', update);
    };
  }, []);
  const visible = tools.filter(t => (category === '전체' || t.category === category) && `${tr(t.name)} ${t.name} ${t.english} ${tr(t.text)} ${t.tags.map(x=>tr(x)).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  const selected = tools.find(t => t.id === route);
  return <div className="site"><Navigation route={route} language={language}/><main className="shell" id="main-content">{tr(route === 'home' ? <><section className="hub-hero"><div className="hero-copy"><span className="eyebrow">YOUR EVERYDAY TOOLKIT</span><h1>{tr("일상에 필요한 ")}<span>{tr("작은 도구들.")}</span></h1><p>{tr("이미지와 경로 변환부터 오늘의 주차까지.")}<br />{tr("자주 쓰는 도구를 한곳에서, 가볍고 간편하게.")}</p><div className="hero-pills"><span><Check size={14} />{tr(" 회원가입 없이")}</span><span><Check size={14} />{tr(" 설치 없이")}</span><span><Check size={14} />{tr(" 무료로")}</span></div></div></section><section className="tool-directory"><div className="directory-bar"><div className="tabs">{tr(['전체', '이미지', '날짜·시간', '텍스트·경로', '계산·변환'].map(c => <button className={c === category ? 'active' : ''} onClick={() => setCategory(c)} key={c}>{tr(c)}{tr(c === '전체' && <span>{tr(tools.length)}</span>)}</button>))}</div><label className="tool-search"><Search size={17} /><input placeholder={tr("필요한 도구 검색")} aria-label={tr("도구 검색")} value={search} onChange={e => setSearch(e.target.value)} /></label></div><div className="tool-grid">{tr(visible.map(({
              id,
              name,
              english,
              text,
              Icon,
              color,
              tags,
              category
            }) => <a key={id} href={routeHref(id)} className={`tool-card ${color}`}><div className="card-top"><span className="tool-icon"><Icon size={28} strokeWidth={1.6} /></span><span className="category-tag">{tr(category)}</span></div><span className="tool-english">{tr(english)}</span><h2>{tr(name)}<ArrowUpRight size={22} /></h2><p>{tr(text)}</p><div className="card-tags">{tr(tags.map(t => <span key={t}>{tr(t)}</span>))}</div></a>))}</div>{tr(visible.length === 0 && <div className="no-results"><Search size={26} /><p>{tr("검색한 도구가 없어요.")}</p><button onClick={() => {
              setSearch('');
              setCategory('전체');
            }}>{tr("모든 도구 보기")}</button></div>)}</section><div className="bottom-note"><span>LESS FRICTION. MORE EVERYDAY.</span><p>{tr("작은 불편을 덜어내는, 작은 도구.")}</p></div></> : selected ? <><nav className="breadcrumbs" aria-label={tr("탐색 경로")}><a href={routeHref()}>{tr("모든 도구")}</a><span aria-hidden="true">/</span><span aria-current="page">{tr(selected.name)}</span></nav>{tr(route === 'markdown' ? <MarkdownConverter /> : route === 'weeknumber' ? <WeekNumber query={query} /> : route === 'path-converter' ? <PathConverter /> : route === 'symbols' ? <Symbols /> : route === 'insta-fonts' ? <InstaFonts /> : route === 'currency' ? <CurrencyConverter /> : route === 'units' ? <UnitConverter /> : route === 'pdf-to-jpg' ? <PdfConverter /> : route === 'clock-timer' ? null : <><div className="tool-heading"><span className="eyebrow">{tr(selected.english)}</span><h1>{tr(selected.name)}</h1><p>{tr(route === 'heic' ? '아이폰 HEIC 사진을 JPG와 PNG로 바꿔보세요.' : 'WebP 이미지를 JPG와 PNG로 간편하게 변환하세요.')}</p></div><Converter kind={route as 'webp' | 'heic'} key={route} /></>)}</> : <div className="no-results"><h1>{tr("도구를 찾을 수 없어요.")}</h1><a href={routeHref()}>{tr("모든 도구로 돌아가기")}</a></div>)}<div hidden={route !== 'clock-timer'}><ClockTimer showHeading={route==='clock-timer'}/></div>{tr(guides[route] && <div dangerouslySetInnerHTML={{
        __html: guideHTML(route,language)
      }} />)}{selected&&<section className="related-tools"><h2>{tr("관련 도구")}</h2><div>{tools.filter(tool=>tool.category===selected.category&&tool.id!==route).map(tool=><a key={tool.id} href={routeHref(tool.id)}>{tr(tool.name)}</a>)}</div></section>}</main><footer className="site-footer"><div><a href={routeHref()}>pocket utility</a><span>{tr("작은 도구, 더 편리한 일상.")}</span></div><span>© {tr(today.getUTCFullYear())} Pocket Utility</span></footer></div>;
}
