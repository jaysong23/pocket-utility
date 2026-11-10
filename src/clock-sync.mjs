export function serverSample(data,start,end){
 if(data.timeZone!=='UTC'||!Number.isFinite(start)||!Number.isFinite(end)||end<start||end-start>10000)throw Error('Invalid time sample');
 const a=[data.year,data.month,data.day,data.hour,data.minute,data.seconds,data.milliSeconds??0];
 if(a.some(x=>!Number.isInteger(x))||a[0]<2020||a[0]>2200||a[1]<1||a[1]>12||a[2]<1||a[2]>31||a[3]<0||a[3]>23||a[4]<0||a[4]>59||a[5]<0||a[5]>59||a[6]<0||a[6]>999)throw Error('Invalid timestamp');
 const utc=Date.UTC(a[0],a[1]-1,a[2],a[3],a[4],a[5],a[6]);if(new Date(utc).getUTCDate()!==a[2])throw Error('Invalid date');
 return {epoch:utc+(end-start)/2,mono:end,rtt:end-start};
}
export const synchronizedNow=(sample,mono)=>sample.epoch+(mono-sample.mono);
export function nextPomodoro(phase,completed,settings){const count=completed+(phase==='focus'?1:0);const next=phase==='focus'?(count%4===0?'long':'short'):'focus';return {phase:next,completed:count,ms:settings[next]*60000}}
