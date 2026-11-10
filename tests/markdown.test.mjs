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
