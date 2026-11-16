import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
await mkdir('node_modules/.cache/url-expander',{recursive:true});
await build({entryPoints:['src/UrlExpander.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:'node_modules/.cache/url-expander/component.mjs'});
test('primary submission resolves parameter-free URLs; failures and local analysis are never labeled destinations',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://example.com/url-expander/'});
 const old={};for(const key of ['window','document','HTMLElement','Event']){old[key]=globalThis[key];globalThis[key]=dom.window[key]}
 const oldFetch=globalThis.fetch;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {createRoot}=await import('react-dom/client');const {default:Component}=await import('../node_modules/.cache/url-expander/component.mjs');const root=createRoot(document.querySelector('#root'));
 let calls=0;globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({url:'https://destination.example/product',redirected:true,chain:[{url:'https://short.example/abc',status:301},{url:'https://destination.example/product',status:200}],status:200}),{headers:{'content-type':'application/json'}})};
 try{
  await act(async()=>root.render(React.createElement(Component)));
  const input=document.querySelector('input');
  await act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(input,'https://short.example/abc');input.dispatchEvent(new Event('input',{bubbles:true}))});
  assert.equal(document.querySelector('button[type=submit]').textContent,'최종 URL 확인');
  const submit=()=>document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  await act(async()=>submit());assert.equal(calls,1);
  assert.equal(document.querySelector('h2').textContent,'최종 목적지 URL');
  assert.equal(document.querySelector('.url-result').textContent,'https://destination.example/product');
  assert.ok(document.body.textContent.includes('이 주소에는 파라미터가 없습니다.'));assert.equal(document.querySelector('table'),null);
  globalThis.fetch=async()=>{calls++;throw new TypeError('CORS')};
  await act(async()=>submit());assert.equal(document.querySelector('.url-result'),null);assert.ok(document.querySelector('[role=alert]'));
  await act(async()=>document.querySelector('button[type=button]').click());assert.equal(calls,2);
  assert.equal(document.querySelector('h2').textContent,'입력한 URL · 목적지 미확인');
  assert.equal(document.querySelector('.url-result').textContent,'https://short.example/abc');
 }finally{await act(async()=>root.unmount());globalThis.fetch=oldFetch;delete globalThis.IS_REACT_ACT_ENVIRONMENT;for(const key of Object.keys(old)){if(old[key]===undefined)delete globalThis[key];else globalThis[key]=old[key]}dom.window.close()}
});
