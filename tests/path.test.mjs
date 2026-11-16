import test from 'node:test';
import assert from 'node:assert/strict';
import {convertPath} from '../src/path.mjs';
test('UNC network paths round trip with Korean and spaces',()=>{
 const input='\\\\NAS\\공유폴더\\프로젝트 2026';
 for(const protocol of ['smb','afp','none']){
  const mac=convertPath(input,protocol);assert.equal(mac.direction,'Windows → Mac');
  assert.equal(convertPath(mac.output).output,input);
 }
 assert.equal(convertPath(input).output,'smb://NAS/공유폴더/프로젝트 2026');
});
test('protocol detection, quotes, and local paths',()=>{
 assert.equal(convertPath('"\\\\server\\share"').output,'smb://server/share');
 assert.equal(convertPath('SMB://server/share').output,'\\\\server\\share');
 assert.equal(convertPath('C:\\Users\\name').output,'C:/Users/name');
 assert.equal(convertPath('/Volumes/share').output,'\\Volumes\\share');
 assert.equal(convertPath('').output,'');
});
test('web URLs and multiple paths are rejected',()=>{
 assert.throws(()=>convertPath('https://example.com/a'));
 assert.throws(()=>convertPath('file:///Users/name'));
 assert.throws(()=>convertPath('smb://a/b\nsmb://c/d'));
});
test('custom protocols normalize and round trip without opening links',()=>{
 const unc='\\\\NAS\\공유 폴더';
 for(const protocol of ['nfs','NFS://','my-app+v1.2']){
  const forward=convertPath(unc,'custom',protocol);
  assert.equal(convertPath(forward.output,'custom',protocol).output,unc);
 }
 assert.equal(convertPath(unc,'custom','NFS://').output,'nfs://NAS/공유 폴더');
 for(const invalid of ['', '1nfs','nfs/path','nfs host'])assert.throws(()=>convertPath(unc,'custom',invalid));
});
test('server-only SMB input ignores unrelated custom output settings',()=>{
 for(const [protocol,custom] of [['smb',''],['afp',''],['none',''],['custom',''],['custom','1invalid']]){
  const result=convertPath('smb://asdfsaf',protocol,custom);
  assert.equal(result.output,'\\\\asdfsaf');assert.equal(result.direction,'Mac → Windows');
  assert.equal(convertPath('afp://asdfsaf',protocol,custom).output,'\\\\asdfsaf');
 }
 assert.equal(convertPath('\\\\asdfsaf').output,'smb://asdfsaf');
 assert.equal(convertPath('//asdfsaf','custom','').output,'\\\\asdfsaf');
 assert.throws(()=>convertPath('\\\\asdfsaf','custom',''));
});

test('reported AFP host converts to UNC without requiring a share',()=>{
 for(const protocol of ['smb','afp','none','custom']){
  assert.equal(convertPath('afp://naver.com',protocol,'').output,String.raw`\\naver.com`);
 }
});
