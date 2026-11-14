import test from 'node:test';
import assert from 'node:assert/strict';
import {detectImageType,imageMime} from '../src/image-type.mjs';
test('image bytes take precedence over filename and MIME', async()=>{
 const jpeg=new File([Uint8Array.from([255,216,255,224,0,16])],'photo.heic',{type:'image/heic'});
 assert.equal(await detectImageType(jpeg),'jpg');
 assert.equal(await detectImageType(new File([Uint8Array.from([137,80,78,71,13,10,26,10])],'download')),'png');
 assert.equal(await detectImageType(new Blob(['RIFF0000WEBP'])),'webp');
 assert.equal(await detectImageType(new Blob(['<html>error</html>'])),'');
 assert.equal(imageMime('jpg'),'image/jpeg');
});
test('HEIC brands are read from the file type box', async()=>{
 const bytes=new Uint8Array(24);new DataView(bytes.buffer).setUint32(0,24);
 bytes.set(new TextEncoder().encode('ftypmif1'),4);bytes.set(new TextEncoder().encode('heic'),16);
 assert.equal(await detectImageType(new Blob([bytes])),'heic');
 bytes.set(new TextEncoder().encode('avif'),16);
 assert.equal(await detectImageType(new Blob([bytes])),'');
});
