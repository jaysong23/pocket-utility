import {encodeAVIF,decodeAVIF} from './avif-codec.mjs';
self.onmessage=async({data})=>{
 try{
  const file=data.operation==='encode'?'avif_enc.wasm':'avif_dec.wasm';
  const response=await fetch(new URL(file,import.meta.url));if(!response.ok)throw Error('LOAD_FAILED');
  const wasm=await WebAssembly.compile(await response.arrayBuffer());
  const result=data.operation==='encode'?await encodeAVIF(data.pixels,data.quality,wasm):await decodeAVIF(data.buffer,wasm);
  self.postMessage({result},[data.operation==='encode'?result:result.data.buffer]);
 }catch{self.postMessage({error:true});}
};
