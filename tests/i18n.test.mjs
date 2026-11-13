import test from 'node:test';
import assert from 'node:assert/strict';
import {t} from '../src/i18n.mjs';
import {normalizeWeekQuery} from '../src/week-input.mjs';
import {searchWeek,civilDate} from '../src/week.mjs';
import {readRoute} from '../src/routing.mjs';
import {JSDOM} from 'jsdom';
import {createMarkdownConverter,plainTextFromHTML,htmlDocument} from '../src/markdown.mjs';
test('translations interpolate counts and preserve unknown input',()=>{
 assert.equal(t('2027년 1주차','en'),'2027 · Week 1');
 assert.equal(t('3페이지 변환 완료','ja'),'3ページ変換完了');
 assert.equal(t('집중 · 집중 2회 완료','en'),'Focus · 2 focus sessions complete');
 assert.equal(t('사용자 파일 이름.txt','en'),'사용자 파일 이름.txt');
});
test('localized dates resolve to the same Korean-based ISO weeks',()=>{
 const today=civilDate(2026,11,13);
 for(const [a,b] of [['2027 week 1','2027년 1주차'],['2027年第1週','2027년 1주차'],['Week 52','52주차'],['December 23','12월 23일'],['12月23日','12월 23일'],['next year Chuseok','내년 추석'],['来年の秋夕','내년 추석'],['Christmas','크리스마스'],['クリスマス','크리스마스'],['next week','다음주']]){
  assert.deepEqual(searchWeek(normalizeWeekQuery(a),today),searchWeek(b,today),a);
 }
});
test('localized direct paths and old Markdown URLs retain their tool',()=>{
 for(const base of ['/','/pocket-utility/'])for(const lang of ['','en/','ja/']){
  assert.equal(readRoute({hash:'',pathname:base+lang+'markdown/'},base),'markdown');
  assert.equal(readRoute({hash:'',pathname:base+lang+'md-to-html/'},base),'markdown');
  assert.equal(readRoute({hash:'',pathname:base+lang},base),'home');
 }
});
test('plain text preserves paragraphs, lists, tables, code and link destinations safely',()=>{
 const dom=new JSDOM('');try{const convert=createMarkdownConverter(dom.window);const input='# Title\n\n**Bold** and *italic*\n\n- [x] Done\n- Next\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n[Site](https://example.com)\n\n![Image](https://example.com/a.png)\n\n<script>alert(1)</script>';
 const text=plainTextFromHTML(convert(input),dom.window);assert.ok(text.startsWith('Title\n\nBold and italic'));assert.match(text,/☑ Done/);assert.match(text,/A\tB/);assert.match(text,/1\t2/);assert.match(text,/Site \(https:\/\/example.com\)/);assert.match(text,/Image/);assert.doesNotMatch(text,/<script|alert\(1\)|\*\*Bold|!\[/);
 assert.equal(plainTextFromHTML(convert('```js\n  const x = "<b>";\n```'),dom.window),'  const x = "<b>";');
 assert.match(htmlDocument('<p>Test</p>','Title',false,'ja'),/<html lang="ja">/);
 }finally{dom.window.close()}
});
