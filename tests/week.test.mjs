import test from 'node:test';
import assert from 'node:assert/strict';
import {civilDate,koreaToday,isoWeek,searchWeek,dateKey,fromWeek,weeksInYear} from '../src/week.mjs';
const today=civilDate(2026,11,10);
test('KST midnight and current ISO week',()=>{assert.equal(dateKey(koreaToday(new Date('2026-11-09T15:00:00Z'))),'2026-11-10');const r=searchWeek('',today);assert.equal(r.week,46);assert.equal(dateKey(r.start),'2026-11-09');assert.equal(dateKey(r.end),'2026-11-15')});
test('Korean week and date queries',()=>{const w=searchWeek('52주차',today);assert.equal(dateKey(w.start),'2026-12-21');assert.equal(dateKey(w.end),'2026-12-27');assert.equal(searchWeek('12월 23일',today).week,52);assert.equal(searchWeek('크리스마스',today).week,52);assert.equal(dateKey(searchWeek('2027년 3주차',today).start),'2027-01-18')});
test('2027 lunar holidays match KASA official 2027 calendar',()=>{const c=searchWeek('내년 추석',today);assert.equal(dateKey(c.date),'2027-09-15');assert.equal(c.week,37);assert.equal(dateKey(c.start),'2027-09-13');assert.equal(dateKey(c.end),'2027-09-19');assert.equal(dateKey(searchWeek('내년 설날',today).date),'2027-02-07');assert.equal(dateKey(searchWeek('내년 정월대보름',today).date),'2027-02-21');assert.equal(dateKey(searchWeek('내년 단오',today).date),'2027-06-09')});
test('ISO year boundaries and 53-week years',()=>{const r=isoWeek(civilDate(2021,1,1));assert.equal(r.year,2020);assert.equal(r.week,53);const n=isoWeek(civilDate(2024,12,30));assert.equal(n.year,2025);assert.equal(n.week,1);assert.equal(weeksInYear(2026),53);assert.equal(weeksInYear(2027),52);assert.throws(()=>searchWeek('2027년 53주차',today))});
test('Invalid inputs fail without guessing',()=>{for(const q of ['0주차','54주차','2027-02-29','2월 30일','안녕','내년2028년추석','2051년추석','2101-01-01'])assert.throws(()=>searchWeek(q,today),q);assert.equal(dateKey(searchWeek('2028-02-29',today).date),'2028-02-29')});
test('Relative years and days follow Korea current year',()=>{assert.equal(dateKey(searchWeek('내일',today).date),'2026-11-11');assert.equal(dateKey(searchWeek('작년 크리스마스',today).date),'2025-12-25');assert.equal(dateKey(searchWeek('내후년 12월 23일',today).date),'2028-12-23');assert.equal(dateKey(searchWeek('다음 주',today).date),'2026-11-17')});
test('Every ISO week round trips for 1900–2100',()=>{for(let y=1900;y<=2100;y++)for(let w=1;w<=weeksInYear(y);w++){const r=isoWeek(fromWeek(y,w));assert.equal(r.year,y);assert.equal(r.week,w);assert.equal(r.start.getUTCDay(),1);assert.equal(r.end.getUTCDay(),0)}});
test('short and full year inputs, Unicode normalization',()=>{
 for(const q of ['27년 1주차','2027년 1주차','２０２７년 １주차','2027년\u200b 1주차']){
  const r=searchWeek(q,today);assert.equal(dateKey(r.start),'2027-01-04');assert.equal(dateKey(r.end),'2027-01-10');
 }
 for(const q of ['26-07-30','26/7/30','26.07.30','2026-07-30'])assert.equal(dateKey(searchWeek(q,today).date),'2026-07-30');
 assert.throws(()=>searchWeek('27-02-29',today));
});
