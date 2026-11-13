import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {guides} from '../src/guides.mjs';
await mkdir('node_modules/.cache/pocket-ui',{recursive:true});
await build({entryPoints:['src/App.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:'node_modules/.cache/pocket-ui/app.mjs'});
const {default:App}=await import('../node_modules/.cache/pocket-ui/app.mjs');
test('all localized tool screens render with one H1 and translated UI',()=>{
 const failures=[];
 for(const lang of ['ko','en','ja'])for(const route of ['',...Object.keys(guides)]){
  const dom=new JSDOM('<meta name="site-base" content="/pocket-utility/">',{url:'https://example.com/pocket-utility/'+(lang==='ko'?'':lang+'/')+(route?route+'/':'')});
  const previous={};for(const key of ['window','document','localStorage','sessionStorage']){previous[key]=globalThis[key];globalThis[key]=dom.window[key]}
  try{
   const html=renderToStaticMarkup(React.createElement(App));const output=new JSDOM(html);const d=output.window.document;
   assert.equal(d.querySelectorAll('h1').length,1,lang+'/'+route);assert.equal(d.querySelectorAll('.category-nav details').length,4);
   if(lang!=='ko'){
    d.querySelectorAll('select.language-switch, .language-switch, [hidden], textarea, .symbol-grid').forEach(n=>n.remove());
    const walker=d.createTreeWalker(d.body,dom.window.NodeFilter.SHOW_TEXT);while(walker.nextNode()){const value=walker.currentNode.textContent.trim();if(/[가-힣]/.test(value))failures.push(lang+'/'+route+': '+value)}
   }
   output.window.close();
  }finally{for(const key of Object.keys(previous)){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key]}dom.window.close()}
 }
 assert.deepEqual(failures,[]);
});
