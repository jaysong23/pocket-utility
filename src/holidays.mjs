// Verified calendar data, including the April 2026 amendments in KASA's 2027 announcement.
// https://astro.kasi.re.kr/kor/life/post/calendarData?year=2026
// https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431
// https://astro.kasi.re.kr/kor/life/post/calendarData?year=2027
import {holidayDate,dateKey,addDays} from './week.mjs';
const cache=new Map();
export function publicHolidays(year){
 if(cache.has(year))return cache.get(year);
 const result={};
 if(year!==2026&&year!==2027)return result;
 const add=(md,name)=>{result[`${year}-${md}`]=name};
 for(const [md,name] of [['01-01','신정'],['03-01','삼일절'],['05-01','노동절'],['05-05','어린이날'],['06-06','현충일'],['07-17','제헌절'],['08-15','광복절'],['10-03','개천절'],['10-09','한글날'],['12-25','크리스마스']])add(md,name);
 for(const name of ['설날','추석','부처님오신날']){
  const {date}=holidayDate(name,year);
  for(const offset of name==='부처님오신날'?[0]:[-1,0,1])result[dateKey(addDays(date,offset))]=name+(offset?' 연휴':'');
 }
 const extras=year===2026?[['03-02','대체공휴일 · 삼일절'],['05-25','대체공휴일 · 부처님오신날'],['06-03','전국동시지방선거'],['08-17','대체공휴일 · 광복절'],['10-05','대체공휴일 · 개천절']]:[['02-09','대체공휴일 · 설날'],['05-03','대체공휴일 · 노동절'],['07-19','대체공휴일 · 제헌절'],['08-16','대체공휴일 · 광복절'],['10-04','대체공휴일 · 개천절'],['10-11','대체공휴일 · 한글날'],['12-27','대체공휴일 · 크리스마스']];
 for(const [md,name] of extras)add(md,name);
 cache.set(year,result);return result;
}
export const holidayName=date=>publicHolidays(date.getUTCFullYear())[dateKey(date)]||'';
