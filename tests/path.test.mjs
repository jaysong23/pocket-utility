import test from 'node:test';
import assert from 'node:assert/strict';
import {convertPath} from '../src/path.mjs';
test('explicit output format applies to every network input',()=>{
 for(const input of ['afp://naver.com','smb://naver.com',String.raw`\\naver.com`,'//naver.com','nfs://naver.com']){
  assert.equal(convertPath(input,'smb').output,'smb://naver.com');
  assert.equal(convertPath(input,'afp').output,'afp://naver.com');
  assert.equal(convertPath(input,'windows').output,String.raw`\\naver.com`);
  assert.equal(convertPath(input,'none').output,'//naver.com');
  assert.equal(convertPath(input,'custom','NFS://').output,'nfs://naver.com');
 }
});
test('network folders preserve spaces and round trip by explicit target',()=>{
 const input=String.raw`\\NAS\공유 폴더\2026 프로젝트`;
 for(const target of ['smb','afp','none','custom']){
  const forward=convertPath(input,target,'my-app+v1.2');
  assert.equal(convertPath(forward.output,'windows').output,input);
  assert.equal(convertPath(forward.output,target,'my-app+v1.2').output,forward.output);
 }
});
test('local paths remain local and quotes are removed',()=>{
 assert.equal(convertPath('"smb://NAS/share"','afp').output,'afp://NAS/share');
 assert.equal(convertPath(String.raw`C:\Users\name`,'smb').output,'C:/Users/name');
 assert.equal(convertPath('C:/Users/name','windows').output,String.raw`C:\Users\name`);
 assert.equal(convertPath('/Volumes/share','windows').output,String.raw`\Volumes\share`);
 assert.equal(convertPath('','custom','').output,'');
});
test('invalid input and custom targets fail clearly',()=>{
 for(const invalid of ['https://example.com/a','file:///Users/name','smb://','smb://a/b\nsmb://c/d'])assert.throws(()=>convertPath(invalid));
 for(const invalid of ['','1nfs','nfs/path','nfs host'])assert.throws(()=>convertPath('afp://host','custom',invalid));
 assert.equal(convertPath('afp://host','windows','invalid').output,String.raw`\\host`);
});
