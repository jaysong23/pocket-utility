import test from 'node:test';import assert from 'node:assert/strict';import {generateLorem} from '../src/lorem.mjs';
test('localized placeholder paragraphs honor counts and stay bounded',()=>{
 for(const lang of ['ko','en','ja']){const text=generateLorem(lang,3,4,()=>0),parts=text.split('\n\n');assert.equal(parts.length,3);assert.equal(parts[0].split(lang==='ja'?'。':'.').filter(Boolean).length,4);assert.match(text,{ko:/[가-힣]/,en:/This sample text/,ja:/これは/}[lang])}
 assert.equal(generateLorem('ko',Infinity).split('\n\n').length,1);assert.equal(generateLorem('en',100).split('\n\n').length,20);assert.equal(generateLorem('en',0).split('\n\n').length,1);
});
