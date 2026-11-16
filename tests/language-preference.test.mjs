import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {preferredLanguage,applyInitialLanguage,rememberLanguage} from '../src/language-preference.mjs';
test('language preference respects saved choices and browser priority',()=>{
 assert.equal(preferredLanguage('ko',['en-US']),'ko');
 assert.equal(preferredLanguage(null,['ja-JP','en']),'ja');
 assert.equal(preferredLanguage(null,['ko-KR']),'ko');
 assert.equal(preferredLanguage('invalid',['fr','en-GB']),'en');
 assert.equal(preferredLanguage(null,['fr','de']),'en');
});
test('entry language redirect preserves query/hash and explicit links',()=>{
 const dom=new JSDOM('<meta name="site-base" content="/pocket-utility/">',{url:'https://example.com/pocket-utility/?q=49#/weeknumber'});
 const keys=['document','location','history','localStorage','navigator'];const descriptors=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 try {
  for(const k of keys)Object.defineProperty(globalThis,k,{value:dom.window[k],configurable:true});
  Object.defineProperty(navigator,'languages',{value:['ja-JP'],configurable:true});
  applyInitialLanguage();assert.equal(location.pathname,'/pocket-utility/ja/');assert.equal(location.search,'?q=49');assert.equal(location.hash,'#/weeknumber');
  rememberLanguage('ko');history.replaceState({},'','/pocket-utility/');applyInitialLanguage();assert.equal(location.pathname,'/pocket-utility/');
  history.replaceState({},'','/pocket-utility/en/heic/');applyInitialLanguage();assert.equal(location.pathname,'/pocket-utility/en/heic/');
 } finally {for(const k of keys){if(descriptors[k])Object.defineProperty(globalThis,k,descriptors[k]);else delete globalThis[k]}dom.window.close()}
});
