import test from 'node:test';
import assert from 'node:assert/strict';
import {publicHolidays} from '../src/holidays.mjs';
test('verified holiday counts and substitute dates',()=>{
 const a=publicHolidays(2026),b=publicHolidays(2027);
 assert.equal(Object.keys(a).length,22);assert.equal(Object.keys(b).length,24);
 for(const key of ['2026-05-01','2026-06-03','2026-07-17','2026-05-25'])assert.ok(a[key]);
 for(const key of ['2027-02-09','2027-05-03','2027-07-19','2027-12-27'])assert.match(b[key],/대체공휴일/);
 assert.equal(a['2026-05-08'],undefined);assert.equal(a['2026-09-28'],undefined);
 assert.equal(b['2027-06-07'],undefined);assert.deepEqual(publicHolidays(2028),{});
});
