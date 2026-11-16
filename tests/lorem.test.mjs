import test from 'node:test';import assert from 'node:assert/strict';import {generateLorem,generateFiller} from '../src/lorem.mjs';
test('localized placeholder paragraphs honor counts and stay bounded',()=>{
 for(const lang of ['ko','la','ja']){const text=generateLorem(lang,3,4,()=>0),parts=text.split('\n\n');assert.equal(parts.length,3);assert.equal(parts[0].split(lang==='ja'?'。':'.').filter(Boolean).length,4);assert.match(text,{ko:/[가-힣]/,la:/Lorem ipsum dolor sit amet/,ja:/静かな/}[lang])}
 assert.equal(generateLorem('ko',Infinity).split('\n\n').length,1);assert.equal(generateLorem('en',100).split('\n\n').length,20);assert.equal(generateLorem('en',0).split('\n\n').length,1);
});

test('default filler is Latin and word/character limits are exact',()=>{
 assert.match(generateFiller(),/^Lorem ipsum dolor sit amet/);
 for(const lang of ['la','ko','ja']){
  assert.equal(generateFiller(lang,'words',25).split(/\s+/).length,25);
  assert.equal(Array.from(generateFiller(lang,'characters',123)).length,123);
 }
 assert.equal(generateFiller('la','words',Infinity).split(/\s+/).length,1);
 assert.equal(Array.from(generateFiller('ko','characters',20000)).length,10000);
});

test('localized long output varies structures and avoids repeated sentences',()=>{
 const seeded=()=>{let seed=731;return ()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}};
 for(const language of ['ko','ja']){
  const text=generateLorem(language,20,10,seeded());
  const sentences=text.split(language==='ja'?'。':'.').map(s=>s.trim()).filter(Boolean);
  assert.equal(sentences.length,200);assert.equal(new Set(sentences).size,200);
  const lengths=sentences.map(s=>Array.from(s).length);assert.ok(Math.max(...lengths)-Math.min(...lengths)>25);
  assert.ok(!text.includes('undefined'));assert.ok(!/[a-z]/i.test(text));
  const words=generateFiller(language,'words',1000,4,seeded());assert.equal(words.split(/\s+/).length,1000);
 }
});
