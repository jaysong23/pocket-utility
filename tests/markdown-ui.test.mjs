import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
await mkdir('node_modules/.cache/markdown-ui',{recursive:true});
await build({entryPoints:['src/MarkdownConverter.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:'node_modules/.cache/markdown-ui/component.mjs'});
async function runWithLang(lang,fn){
 const dom=new JSDOM('<meta name="site-base" content="/"><div id="root"></div>',{url:'https://example.com/'+(lang==='ko'?'':lang+'/')+'markdown/'});
 const old={};for(const key of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','Event','DOMParser']){old[key]=globalThis[key];globalThis[key]=dom.window[key]}
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {createRoot}=await import('react-dom/client');
 const {default:Component}=await import('../node_modules/.cache/markdown-ui/component.mjs');
 const root=createRoot(document.querySelector('#root'));
 try{
  await act(async()=>root.render(React.createElement(Component)));
  await fn(dom);
 }finally{
  await act(async()=>root.unmount());
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  for(const key of Object.keys(old)){if(old[key]===undefined)delete globalThis[key];else globalThis[key]=old[key]}
  dom.window.close();
 }
}
test('Markdown page title follows first H1, custom override, and localized default across languages',async()=>{
 for(const [lang,expectedDefault] of [['ko','Markdown 문서'],['en','Markdown Document'],['ja','マークダウン文書']]){
  await runWithLang(lang,async dom=>{
   const setInput=(el,val)=>{
    const proto=el.tagName==='TEXTAREA'?dom.window.HTMLTextAreaElement.prototype:dom.window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto,'value').set.call(el,val);
    el.dispatchEvent(new Event('input',{bubbles:true}));
   };
   const [titleInput,filenameInput]=document.querySelectorAll('.md-options input');
   await act(async()=>{document.querySelectorAll('.md-view-tabs button')[1].click()});
   const initialH1=document.querySelector('.md-source').value.match(/^#\s+(.+)/)?.[1].trim();
   assert.equal(titleInput.placeholder,initialH1);
   assert.equal(filenameInput.placeholder,initialH1);
   assert.ok(document.querySelector('.md-output').value.includes('<title>'+initialH1+'</title>'));

   await act(async()=>{setInput(titleInput,'Custom Page Title')});
   assert.ok(document.querySelector('.md-output').value.includes('<title>Custom Page Title</title>'));
   assert.equal(filenameInput.placeholder,'Custom Page Title');

   await act(async()=>{setInput(titleInput,'')});
   assert.ok(document.querySelector('.md-output').value.includes('<title>'+initialH1+'</title>'));

   await act(async()=>{setInput(document.querySelector('.md-source'),'No heading paragraph')});
   await act(async()=>new Promise(r=>setTimeout(r,220)));
   assert.equal(titleInput.placeholder,expectedDefault);
   assert.equal(filenameInput.placeholder,expectedDefault);
   assert.ok(document.querySelector('.md-output').value.includes('<title>'+expectedDefault+'</title>'));
  });
 }
});
