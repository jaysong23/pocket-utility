import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {mkdir} from 'node:fs/promises';import {JSDOM} from 'jsdom';import React,{act} from 'react';
await mkdir('node_modules/.cache/image-lifecycle',{recursive:true});await build({entryPoints:['src/Converter.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:'node_modules/.cache/image-lifecycle/app.mjs'});
test('image output invalidates after quality changes and pending conversion releases resources on unmount',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://mypocketutility.com/webp/'}),old={};
 for(const key of ['window','document','HTMLElement','Event']){old[key]=globalThis[key];globalThis[key]=dom.window[key]}
 const create=URL.createObjectURL,revoke=URL.revokeObjectURL,bitmap=globalThis.createImageBitmap;let counter=0,closed=0,pending=null,hold=false;const revoked=[];
 URL.createObjectURL=()=>`blob:test-${++counter}`;URL.revokeObjectURL=url=>revoked.push(url);
 globalThis.createImageBitmap=async()=>({width:2,height:2,close:()=>closed++});
 dom.window.HTMLCanvasElement.prototype.getContext=()=>({fillRect(){},drawImage(){}});
 dom.window.HTMLCanvasElement.prototype.toBlob=function(callback,type){if(hold)pending=()=>callback(new Blob(['encoded'],{type}));else callback(new Blob(['encoded'],{type}))};
 const {createRoot}=await import('react-dom/client');const {default:Converter}=await import('../node_modules/.cache/image-lifecycle/app.mjs');const root=createRoot(document.querySelector('#root'));let unmounted=false;
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 try{
  await act(async()=>root.render(React.createElement(Converter,{kind:'webp'})));
  const file=new File([new Uint8Array([137,80,78,71,13,10,26,10])],'image.png',{type:'image/png'}),input=document.querySelector('input[type=file]');
  Object.defineProperty(input,'files',{value:[file]});await act(async()=>input.dispatchEvent(new Event('change',{bubbles:true})));
  await act(async()=>document.querySelector('.convert').click());assert.equal(document.querySelector('.complete').textContent,'변환 완료');assert.equal(document.querySelector('.download').disabled,false);assert.equal(closed,1);
  const slider=document.querySelector('.slider');await act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(slider,'75');slider.dispatchEvent(new Event('input',{bubbles:true}))});
  assert.equal(document.querySelector('.download').disabled,true);assert.equal(document.querySelector('.complete'),null);assert.ok(revoked.includes('blob:test-2'));
  hold=true;await act(async()=>document.querySelector('.convert').click());assert.ok(pending);await act(async()=>root.unmount());unmounted=true;await act(async()=>pending());
  assert.equal(counter,2,'no output URL allocated after unmount');assert.equal(closed,2);assert.ok(revoked.includes('blob:test-1'));
 }finally{if(!unmounted)await act(async()=>root.unmount());URL.createObjectURL=create;URL.revokeObjectURL=revoke;globalThis.createImageBitmap=bitmap;delete globalThis.IS_REACT_ACT_ENVIRONMENT;for(const key of Object.keys(old)){if(old[key]===undefined)delete globalThis[key];else globalThis[key]=old[key]}dom.window.close()}
});
