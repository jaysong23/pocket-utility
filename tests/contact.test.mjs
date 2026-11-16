import test from 'node:test';import assert from 'node:assert/strict';
import {contactMailto,contactSubject,CONTACT_EMAIL,infoHTML} from '../src/info-pages.mjs';
test('contact drafts use the fixed recipient, MPU subject and safely encoded body',()=>{
 const body='한글 日本語 & bcc=other@example.com\nSecond line';
 const link=new URL(contactMailto('[MPU] 오류 & 도움\r\nbcc:someone',body));
 assert.equal(link.pathname,CONTACT_EMAIL);assert.equal(link.searchParams.get('subject'),'[MPU] 오류 & 도움  bcc:someone');assert.equal(link.searchParams.get('body'),body);assert.equal(link.searchParams.has('bcc'),false);
 assert.equal(contactSubject('[MPU] [MPU] Test'),'[MPU] Test');
 for(const lang of ['ko','en','ja'])assert.ok(infoHTML('contact',lang).includes(CONTACT_EMAIL));
});
