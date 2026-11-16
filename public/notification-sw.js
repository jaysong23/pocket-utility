// Only displays user-requested notifications. No caching, tracking, or background timer.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const base=self.registration.scope;
  let target=new URL(base);
  try{const candidate=new URL(event.notification.data?.url,base);if(candidate.origin===target.origin&&candidate.pathname.startsWith(target.pathname))target=candidate}catch{}
  const tabs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const tab=tabs.find(client=>client.url===target.href);
  if(tab){await tab.focus();return}
  await self.clients.openWindow(target.href);
 })());
});
