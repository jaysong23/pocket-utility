import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createMarkdownConverter,htmlDocument,MAX_MARKDOWN} from '../src/markdown.mjs';
const dom=new JSDOM(''),convert=createMarkdownConverter(dom.window);
after(()=>dom.window.close());
test('Korean headings, tables, checklists and fenced code',()=>{
 const fence=String.fromCharCode(96).repeat(3);
 const html=convert('# 한글 제목\n\n| 이름 | 값 |\n| --- | --- |\n| 도구 | 1 |\n\n- [x] 완료\n\n'+fence+'js\nconst x = "<script>";\n'+fence);
 assert.match(html,/<h1>한글 제목<\/h1>/);assert.match(html,/<table>/);assert.match(html,/checked/);assert.match(html,/disabled/);assert.match(html,/&lt;script&gt;/);
});
test('removes executable HTML and unsafe URLs while keeping safe content',()=>{
 const html=convert('<script>alert(1)</script>\n\n<img src="https://example.com/a.png" onerror="alert(1)"><a href="javascript:alert(1)">bad</a><iframe src="https://example.com"></iframe><p style="color:red">문장</p><input type="text" autofocus>');
 assert.doesNotMatch(html,/<script|onerror|javascript:|<iframe|style=|autofocus|type="text"/i);
 assert.match(html,/https:\/\/example.com\/a.png/);assert.match(html,/문장/);assert.match(html,/type="checkbox"/);
});
test('exports standalone HTML with escaped title; body stays a fragment',()=>{
 const body=convert('**강조**');assert.equal(body.trim(),'<p><strong>강조</strong></p>');
 const full=htmlDocument(body,'</title><script>alert(1)</script>');
 assert.match(full,/^<!doctype html>/);assert.match(full,/<style>/);assert.match(full,/&lt;\/title&gt;/);assert.doesNotMatch(full,/<script>/);assert.ok(full.includes(body));
 const preview=htmlDocument(body,'문서',false);assert.match(preview,/img-src data:/);assert.match(full,/img-src https: http: data:/);
});
test('empty input, BOM and input limit',()=>{
 assert.equal(convert(''),'');assert.match(convert('\uFEFF# 제목'),/<h1>/);assert.throws(()=>convert('a'.repeat(MAX_MARKDOWN+1)),/20만/);
});
test('CJK emphasis and strikethrough work across punctuation and particles without breaking code or underscores',()=>{
 const report=convert('2. **수원·동탄 매출 및 품목 성과**를 보면, **스타필드 수원 매출이 +47.5%(3,231만 원)** 달성한 가운데 **수원은 세트 +163%·모자 +154%·운동화 +59%**, **동탄 역시 세트 +72%·모자 +58%·가방 +26%**로 양 거점 모두 풀코디 아이템 구매가 크게 뛰었습니다.');
 assert.match(report,/<strong>동탄 역시 세트 \+72%·모자 \+58%·가방 \+26%<\/strong>로/);
 assert.doesNotMatch(report,/\*\*/);
 assert.equal(convert('**스타필드 수원 +91.8%(744명)**은 그리고 **“제목”**을').trim(),'<p><strong>스타필드 수원 +91.8%(744명)</strong>은 그리고 <strong>“제목”</strong>을</p>');
 assert.equal(convert('한글**(예시)**는 매출**+26%**로').trim(),'<p>한글<strong>(예시)</strong>는 매출<strong>+26%</strong>로</p>');
 assert.equal(convert('**A (*한글*)**로 끝').trim(),'<p><strong>A (<em>한글</em>)</strong>로 끝</p>');
 assert.equal(convert('日本語**（テスト）**ですと**「結果」**を確認。').trim(),'<p>日本語<strong>（テスト）</strong>ですと<strong>「結果」</strong>を確認。</p>');
 assert.equal(convert('매출~~+26%~~로 및 한글~~(삭제)~~는').trim(),'<p>매출<del>+26%</del>로 및 한글<del>(삭제)</del>는</p>');
 assert.equal(convert('한글**(보고서_(최종)_2026)**는 foo_bar_baz').trim(),'<p>한글<strong>(보고서_(최종)_2026)</strong>는 foo_bar_baz</p>');
 assert.equal(convert('`**+26%**로` \\*\\*+26%\\*\\*로 10% * 20%').trim(),'<p><code>**+26%**로</code> **+26%**로 10% * 20%</p>');
});
