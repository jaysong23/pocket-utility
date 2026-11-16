import {useCallback,useEffect,useRef,useState} from 'react';
import {serverSample,synchronizedNow,httpDateSample} from './clock-sync.mjs';
export default function useServerTime(source='timeapi',address=''){
 const sample=useRef<any>(null),request=useRef<AbortController|null>(null);
 const [now,setNow]=useState(Date.now),[status,setStatus]=useState('syncing'),[rtt,setRtt]=useState(0),[error,setError]=useState('');
 const sync=useCallback(async()=>{
  if(request.current)return;
  if(source==='custom'&&!address){setStatus('failed');return}
  const ctl=new AbortController();request.current=ctl;setStatus('syncing');setError('');
  const timeout=setTimeout(()=>ctl.abort(),9000);
  try{
   const url=new URL(source==='timeapi'?'https://timeapi.io/api/time/current/zone?timeZone=UTC':source==='naver'?'https://api.searchad.naver.com/':address);
   if(url.protocol!=='https:'||url.username||url.password)throw Error('HTTPS 서버 주소를 입력해 주세요.');
   const start=performance.now();
   const res=source==='naver'?await fetch('/api/naver-time',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',cache:'no-store',credentials:'omit',signal:ctl.signal}):await fetch(url.href,{method:source==='timeapi'?'GET':'HEAD',mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:ctl.signal});
   let next;
   if(source==='timeapi'){if(!res.ok)throw Error();next=serverSample(await res.json(),start,performance.now())}
   else if(source==='naver'){if(!res.ok)throw Error();const data=await res.json();next=httpDateSample(data.date,data.age,start,performance.now())}
   else next=httpDateSample(res.headers.get('date'),res.headers.get('age'),start,performance.now());
   if(request.current===ctl&&!ctl.signal.aborted){sample.current=next;setNow(next.epoch);setRtt(Math.round(next.rtt));setStatus('synced')}
  }catch(e){if(request.current===ctl){setStatus(sample.current?'stale':'failed');setError(source==='timeapi'?'서버 연결 상태를 확인해 주세요.':source==='naver'?'네이버 시각을 불러오지 못했습니다. 잠시 후 재동기화해 주세요.':'서버 시간을 읽을 수 없습니다. HTTPS 주소, 외부 접근 허용 및 Date 헤더 공개 설정을 확인해 주세요.')}}
  finally{clearTimeout(timeout);if(request.current===ctl)request.current=null}
 },[source,address]);
 useEffect(()=>{sample.current=null;setNow(Date.now());setRtt(0);setError('');void sync();const tick=setInterval(()=>setNow(sample.current?synchronizedNow(sample.current,performance.now()):Date.now()),200);const refresh=setInterval(()=>void sync(),300000);const visible=()=>{if(document.visibilityState==='visible')void sync()};document.addEventListener('visibilitychange',visible);return()=>{request.current?.abort();request.current=null;clearInterval(tick);clearInterval(refresh);document.removeEventListener('visibilitychange',visible)}},[sync]);
 return {now,status,rtt,sync,error};
}
