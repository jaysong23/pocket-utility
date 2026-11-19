import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {encodeAVIF,decodeAVIF} from '../src/avif-codec.mjs';import {detectImageType} from '../src/image-type.mjs';
test('real AVIF WASM encodes, decodes, preserves dimensions and alpha',async()=>{
 const width=16,height=16,data=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<data.length;i+=4){data[i]=200;data[i+1]=60;data[i+2]=30;data[i+3]=i<512?0:255;}
 const enc=await WebAssembly.compile(await readFile('node_modules/@jsquash/avif/codec/enc/avif_enc.wasm'));
 const dec=await WebAssembly.compile(await readFile('node_modules/@jsquash/avif/codec/dec/avif_dec.wasm'));
 const result=await encodeAVIF({width,height,data},90,enc);assert.equal(await detectImageType(new Blob([result])),'avif');
 const decoded=await decodeAVIF(result,dec);assert.equal(decoded.width,width);assert.equal(decoded.height,height);assert.equal(decoded.data[3],0);assert.equal(decoded.data.at(-1),255);
 await assert.rejects(()=>decodeAVIF(new Uint8Array([1,2,3]).buffer,dec));
});
