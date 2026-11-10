import KoreanLunarCalendar from '../vendor/korean-lunar-calendar/dist/korean-lunar-calendar.js';
export const DAY=86400000;
export function civilDate(y,m,d){const x=new Date(Date.UTC(y,m-1,d));if(!Number.isInteger(y)||y<1900||y>2100||x.getUTCFullYear()!==y||x.getUTCMonth()!==m-1||x.getUTCDate()!==d)throw new Error('1900~2100년 사이의 올바른 날짜를 입력해 주세요.');return x;}
export function koreaToday(now=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now);const get=t=>+p.find(x=>x.type===t).value;return civilDate(get('year'),get('month'),get('day'));}
export const addDays=(date,n)=>new Date(date.getTime()+n*DAY);
export function isoWeek(date){const monday=addDays(date,-((date.getUTCDay()+6)%7));const thursday=addDays(monday,3);const year=thursday.getUTCFullYear();const jan4=new Date(Date.UTC(year,0,4));const first=addDays(jan4,-((jan4.getUTCDay()+6)%7));return {year,week:1+Math.round((monday-first)/(7*DAY)),start:monday,end:addDays(monday,6)};}
export const weeksInYear=y=>isoWeek(new Date(Date.UTC(y,11,28))).week;
export function fromWeek(year,week){if(!Number.isInteger(year)||year<1900||year>2100)throw new Error('1900~2100년 사이의 연도를 입력해 주세요.');if(!Number.isInteger(week)||week<1||week>weeksInYear(year))throw new Error(`${year}년은 1~${weeksInYear(year)}주차까지 있습니다.`);const jan4=new Date(Date.UTC(year,0,4));return addDays(jan4,-((jan4.getUTCDay()+6)%7)+(week-1)*7);}
export const dateKey=d=>d.toISOString().slice(0,10);
export const prettyDate=d=>new Intl.DateTimeFormat('ko-KR',{timeZone:'UTC',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(d);
const solar=[['신정',1,1,['새해','양력설','1월1일']],['삼일절',3,1,['3.1절','3·1절']],['어린이날',5,5,[]],['어버이날',5,8,[]],['스승의날',5,15,[]],['현충일',6,6,[]],['광복절',8,15,[]],['개천절',10,3,[]],['한글날',10,9,[]],['크리스마스',12,25,['성탄절','기독탄신일']],['크리스마스이브',12,24,['성탄절이브']],['연말',12,31,[]],['발렌타인데이',2,14,['밸런타인데이']],['화이트데이',3,14,[]],['빼빼로데이',11,11,[]]];
const lunar=[['설날',1,1,['설','구정']],['추석',8,15,['한가위']],['부처님오신날',4,8,['석가탄신일']],['정월대보름',1,15,['대보름']],['단오',5,5,[]],['칠석',7,7,[]]];
export function holidayDate(name,year){const s=solar.find(x=>x[0]===name||x[3].includes(name));if(s)return {date:civilDate(year,s[1],s[2]),label:s[0],basis:'양력'};const l=lunar.find(x=>x[0]===name||x[3].includes(name));if(!l)return null;if(year<1900||year>2050)throw new Error('음력 기념일은 1900~2050년까지만 조회할 수 있습니다.');const cal=new KoreanLunarCalendar();if(!cal.setLunarDate(year,l[1],l[2],false))throw new Error('이 연도의 음력 날짜를 계산할 수 없습니다.');const d=cal.getSolarCalendar();return {date:civilDate(d.year,d.month,d.day),label:l[0],basis:`음력 ${l[1]}월 ${l[2]}일`,...(l[0]==='설날'||l[0]==='추석'?{festival:true}:{} )};}
export function searchWeek(raw,today=koreaToday()){
 let q=raw.normalize('NFKC').trim().replace(/[\s\u200B-\u200D\uFEFF]+/g,'').replace(/[–—−]/g,'-');let year=today.getUTCFullYear(),explicitYear=false;
 if(!q||q==='오늘'||q==='이번주')return {...isoWeek(today),date:today,label:'오늘',basis:'한국 시간 (KST)'};
 if(['내일','모레','어제','그제','지난주','저번주','다음주','다다음주'].includes(q)){const offsets={'내일':1,'모레':2,'어제':-1,'그제':-2,'지난주':-7,'저번주':-7,'다음주':7,'다다음주':14};const date=addDays(today,offsets[q]);return {...isoWeek(date),date,label:raw,basis:'한국 시간 기준'};}
 const relative=q.match(/^(올해|금년|내년|내후년|작년|지난해|재작년)/);if(relative){year+=({올해:0,금년:0,내년:1,내후년:2,작년:-1,지난해:-1,재작년:-2})[relative[1]];q=q.slice(relative[1].length);explicitYear=true;}
 const ym=q.match(/^(\d{4}|\d{2})년/);if(ym){if(explicitYear)throw new Error('연도는 하나만 지정해 주세요.');year=ym[1].length===2?2000+Number(ym[1]):Number(ym[1]);q=q.slice(ym[0].length);explicitYear=true;}
 if(year<1900||year>2100)throw new Error('1900~2100년 사이의 연도를 입력해 주세요.');
 const wn=q.match(/^(?:W)?(\d{1,2})(?:주차|주)?$/i);if(wn){const date=fromWeek(year,+wn[1]);return {...isoWeek(date),date:null,label:`${year}년 ${+wn[1]}주차`,basis:'ISO 8601 · 월요일 시작'};}
 const iso=q.match(/^(\d{4}|\d{2})[-/.](\d{1,2})[-/.](\d{1,2})$/);const md=q.match(/^(\d{1,2})월(\d{1,2})일?$/)||q.match(/^(\d{1,2})[/.\-](\d{1,2})$/);
 if(iso||md){if(iso&&explicitYear)throw new Error('연도는 하나만 지정해 주세요.');const date=iso?civilDate(iso[1].length===2?2000+Number(iso[1]):Number(iso[1]),+iso[2],+iso[3]):civilDate(year,+md[1],+md[2]);return {...isoWeek(date),date,label:prettyDate(date),basis:'양력'};}
 const h=holidayDate(q,year);if(h)return {...isoWeek(h.date),...h,label:`${year}년 ${h.label}`};
 throw new Error('날짜 또는 지원하는 기념일을 입력해 주세요. 예: 52주차, 12월 23일, 크리스마스, 내년 추석');
}
