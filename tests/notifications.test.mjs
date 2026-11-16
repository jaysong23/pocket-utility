import test from 'node:test';import assert from 'node:assert/strict';
import {notificationsEnabled,saveNotificationPreference,sendBrowserNotification} from '../src/notifications.mjs';
test('notification preference survives reload and explicit opt-out overrides permission',()=>{
 const oldN=globalThis.Notification,oldL=globalThis.localStorage;const values=new Map();
 try{globalThis.Notification={permission:'granted'};globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 assert.equal(notificationsEnabled(),true);saveNotificationPreference(false);assert.equal(notificationsEnabled(),false);saveNotificationPreference(true);assert.equal(notificationsEnabled(),true);
 Notification.permission='denied';assert.equal(notificationsEnabled(),false);
 }finally{globalThis.Notification=oldN;globalThis.localStorage=oldL}
});
test('notifications use active service worker, fall back on desktop and reject denied permission',async()=>{
 const oldN=globalThis.Notification,oldNav=Object.getOwnPropertyDescriptor(globalThis,'navigator');let desktop=0,worker=0,registered;
 try{
 globalThis.Notification=class{static permission='granted';constructor(){desktop++}};
 const registration={active:{},showNotification:async(title,options)=>{worker++;assert.equal(title,'MY POCKET UTILITY');assert.equal(options.body,'Done');assert.equal(options.icon,'/pocket/icons/pocket-192.png')}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{register:async(path,options)=>{registered={path,...options};return registration}}}});
 await sendBrowserNotification('Done',{base:'/pocket/',url:'https://example.com/pocket/timer/'});assert.equal(worker,1);assert.equal(desktop,0);assert.deepEqual(registered,{path:'/pocket/notification-sw.js',scope:'/pocket/'});
 navigator.serviceWorker.register=async()=>{throw Error('offline')};await sendBrowserNotification('Done',{url:'https://example.com/timer/'});assert.equal(desktop,1);
 Notification.permission='denied';await assert.rejects(()=>sendBrowserNotification('Done',{url:'https://example.com/timer/'}),/권한/);assert.equal(desktop,1);
 }finally{globalThis.Notification=oldN;if(oldNav)Object.defineProperty(globalThis,'navigator',oldNav);else delete globalThis.navigator}
});
