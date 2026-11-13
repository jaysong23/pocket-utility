import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
await mkdir('node_modules/.cache/pocket-interaction',{recursive:true});
await build({entryPoints:['src/App.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:'node_modules/.cache/pocket-interaction/app.mjs'});
const {default:App}=await import('../node_modules/.cache/pocket-interaction/app.mjs');
test('language and category navigation preserve input; plain-text copy uses actual output',async()=>{
 const dom=new JSDOM('<meta name="site-base" content="/pocket-utility/"><meta name="site-url" content="https://example.com/pocket-utility/"><meta name="description"><meta property="og:url"><meta property="og:title"><link rel="canonical"><div id="root"></div>',{url:'https://example.com/pocket-utility/markdown/',pretendToBeVisual:true});
 const previous={};for(const key of ['window','document','history','location','localStorage','sessionStorage','Event','HTMLElement','HTMLInputElement']){previous[key]=globalThis[key];globalThis[key]=dom.window[key]}
 const oldFetch=globalThis.fetch,oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');let copied='';
 globalThis.fetch=async()=>({ok:true,json:async()=>({year:2026,month:11,day:13,hour:1,minute:0,seconds:0,milliSeconds:0})});
 Object.defineProperty(globalThis,'navigator',{value:{clipboard:{writeText:async text=>{copied=text}}},configurable:true});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};const root=createRoot(document.getElementById('root'));
 try{
  await act(async()=>root.render(React.createElement(App)));
  const original=document.querySelector('.md-source').value;
  await act(async()=>{const select=document.querySelector('.language-switch select');select.value='en';select.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.equal(location.pathname,'/pocket-utility/en/markdown/');assert.equal(document.documentElement.lang,'en');assert.equal(document.querySelector('.md-source').value,original);assert.match(document.title,/Markdown converter/);
  await act(async()=>{const select=document.querySelector('.md-options select');select.value='plain';select.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.ok(document.querySelector('.md-output'));assert.equal(document.querySelectorAll('.md-preview').length,0);
  const text=document.querySelector('.md-output').value;assert.ok(text);assert.doesNotMatch(text,/<h1>|\*\*/);
  await act(async()=>document.querySelector('.md-save button').click());assert.equal(copied,text);
  const details=document.querySelector('.category-nav details');details.open=true;
  await act(async()=>document.querySelector('.category-nav a[href$="webp/"]').click());
  assert.equal(location.pathname,'/pocket-utility/en/webp/');assert.match(document.querySelector('h1').textContent,/WebP/);assert.equal(details.open,false);
  await act(async()=>{const select=document.querySelector('.language-switch select');select.value='ja';select.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.equal(location.pathname,'/pocket-utility/ja/webp/');assert.equal(document.documentElement.lang,'ja');
 }finally{await act(async()=>root.unmount());globalThis.fetch=oldFetch;if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;delete globalThis.IS_REACT_ACT_ENVIRONMENT;for(const key of Object.keys(previous)){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key]}dom.window.close()}
});
