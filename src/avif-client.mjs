import {siteBase} from './routing.mjs';
export function runAVIF(operation,payload,signal){
 return new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(new DOMException('Aborted','AbortError'));return;}
  const worker=new Worker(siteBase()+'codecs/avif-worker.js',{type:'module'});
  const clean=()=>{clearTimeout(timer);worker.terminate();signal?.removeEventListener('abort',abort);};
  const abort=()=>{clean();reject(new DOMException('Aborted','AbortError'));};
  const fail=()=>{clean();reject(new Error('AVIF 변환에 실패했습니다. 파일과 인터넷 연결을 확인하거나 더 작은 이미지를 사용해 주세요.'));};
  const timer=setTimeout(fail,120000);
  signal?.addEventListener('abort',abort,{once:true});
  worker.onmessage=({data})=>{if(data.error){fail();return;}clean();resolve(data.result);};
  worker.onerror=fail;
  try{worker.postMessage({operation,...payload},operation==='encode'?[payload.pixels.data.buffer]:[payload.buffer]);}catch{fail();}
 });
}
