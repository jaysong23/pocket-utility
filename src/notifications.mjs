export const notificationPreferenceKey='pocket-browser-notifications';
export function notificationPermission(){return typeof Notification==='undefined'?'unsupported':Notification.permission}
export function notificationsEnabled(){if(notificationPermission()!=='granted')return false;try{return localStorage.getItem(notificationPreferenceKey)!=='off'}catch{return true}}
export function saveNotificationPreference(enabled){try{localStorage.setItem(notificationPreferenceKey,enabled?'on':'off')}catch{}}
function timeout(promise,ms){let id;return Promise.race([promise,new Promise((_,reject)=>{id=setTimeout(()=>reject(Error('Notification timeout')),ms)})]).finally(()=>clearTimeout(id))}
export async function sendBrowserNotification(body,{base='/',url=location.href}={}){
 if(notificationPermission()!=='granted')throw Error('알림 권한이 없습니다. 브라우저 사이트 설정에서 허용해 주세요.');
 const options={body,tag:'pocket-'+Date.now(),icon:base+'icons/pocket-192.png',requireInteraction:true,data:{url}};
 if(navigator.serviceWorker){
  try{
   const registration=await timeout(navigator.serviceWorker.register(base+'notification-sw.js',{scope:base}),5000);
   if(!registration.active)await timeout(navigator.serviceWorker.ready,5000);
   await registration.showNotification('MY POCKET UTILITY',options);return;
  }catch{/* Desktop fallback when service worker registration is unavailable. */}
 }
 try{const notice=new Notification('MY POCKET UTILITY',options);notice.onclick=()=>{window.focus();notice.close()};notice.onerror=()=>window.dispatchEvent(new Event('pocket:notification-error'))}
 catch{throw Error('브라우저 알림을 표시할 수 없습니다.')}
}
