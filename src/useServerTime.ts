import {useCallback,useEffect,useRef,useState} from 'react';
import {serverSample,synchronizedNow} from './clock-sync.mjs';
export default function useServerTime(){
 const sample=useRef<any>(null),request=useRef<AbortController|null>(null),alive=useRef(true);
 const [now,setNow]=useState(Date.now),[status,setStatus]=useState('syncing'),[rtt,setRtt]=useState(0);
 const sync=useCallback(async()=>{if(request.current)return;const ctl=new AbortController();request.current=ctl;setStatus('syncing');const timeout=setTimeout(()=>ctl.abort(),9000);try{const start=performance.now();const res=await fetch('https://timeapi.io/api/time/current/zone?timeZone=UTC',{cache:'no-store',credentials:'omit',signal:ctl.signal});if(!res.ok)throw Error();const data=await res.json();const end=performance.now();const next=serverSample(data,start,end);if(alive.current){sample.current=next;setNow(next.epoch);setRtt(Math.round(next.rtt));setStatus('synced')}}catch{if(alive.current)setStatus(sample.current?'stale':'failed')}finally{clearTimeout(timeout);if(request.current===ctl)request.current=null}},[]);
 useEffect(()=>{alive.current=true;void sync();const tick=setInterval(()=>setNow(sample.current?synchronizedNow(sample.current,performance.now()):Date.now()),200);const refresh=setInterval(()=>void sync(),300000);const visible=()=>{if(document.visibilityState==='visible')void sync()};document.addEventListener('visibilitychange',visible);return()=>{alive.current=false;request.current?.abort();clearInterval(tick);clearInterval(refresh);document.removeEventListener('visibilitychange',visible)}},[sync]);
 return {now,status,rtt,sync};
}
