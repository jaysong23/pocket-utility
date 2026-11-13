import test from 'node:test';
import assert from 'node:assert/strict';
import {readRoute} from '../src/routing.mjs';
import {guides,guideHTML} from '../src/guides.mjs';
test('root and project paths support direct entry and reload',()=>{
 for(const base of ['/','/pocket-utility/']){
  assert.equal(readRoute({hash:'',pathname:base},base),'home');
  assert.equal(readRoute({hash:'',pathname:base+'webp/'},base),'webp');
  assert.equal(readRoute({hash:'',pathname:base+'weeknumber'},base),'weeknumber');
 }
 assert.equal(readRoute({hash:'',pathname:'/other/'},'/pocket-utility/'),'not-found');
});
test('legacy bookmarks preserve routes and query separation',()=>{
 assert.equal(readRoute({hash:'#/weeknumber?q=2027',pathname:'/'},'/'),'weeknumber');
 assert.equal(readRoute({hash:'#/',pathname:'/pocket-utility/'},'/pocket-utility/'),'home');
});
test('every tool has readable instructions, examples and FAQ',()=>{
 assert.equal(Object.keys(guides).length,11);
 for(const [id,g] of Object.entries(guides)){assert.equal(g[2].length,3);assert.ok(guideHTML(id).includes('<details>'));assert.ok(g[3].length>20);assert.ok(g[5].length>30)}
 assert.equal(guideHTML('unknown'),'');
});
test('legacy query migration and in-app navigation preserve page state',async()=>{
 const {JSDOM}=await import('jsdom');
 const dom=new JSDOM('<meta name="site-base" content="/pocket-utility/"><a href="/pocket-utility/webp/">WebP</a>',{url:'https://example.com/pocket-utility/#/weeknumber?q=27%EB%85%84%201%EC%A3%BC%EC%B0%A8'});
 const prior={};for(const key of ['window','document','history','location','Event']){prior[key]=globalThis[key];globalThis[key]=dom.window[key]}
 try{
  const {installRouting,getRoute,getQuery}=await import('../src/routing.mjs');let updates=0;
  window.addEventListener('pocket:navigate',()=>updates++);const cleanup=installRouting();
  assert.equal(getRoute(),'weeknumber');assert.equal(getQuery(),'27년 1주차');assert.equal(location.hash,'');
  document.querySelector('a').dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
  assert.equal(getRoute(),'webp');assert.equal(updates,2);assert.equal(document.querySelector('a').textContent,'WebP');cleanup();
 }finally{for(const key of Object.keys(prior)){if(prior[key]===undefined)delete globalThis[key];else globalThis[key]=prior[key]}dom.window.close()}
});
