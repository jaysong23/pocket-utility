import {fillerLocales} from './lorem-locales.mjs';
// Layout filler: Latin vocabulary and deliberately unrelated Korean/Japanese clauses.
const latin='lorem ipsum dolor sit amet consectetur adipiscing elit sed eiusmod tempor incididunt labore dolore magna aliqua enim minim veniam quis nostrud exercitation ullamco laboris nisi aliquip commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat proident culpa officia deserunt mollit anim laborum integer pretium vestibulum donec facilisis massa viverra pulvinar neque fermentum sagittis pellentesque tellus pharetra lectus posuere'.split(' ');
const bounded=(value,max)=>Number.isFinite(Number(value))?Math.min(max,Math.max(1,Math.floor(Number(value)))):1;
function sentenceGenerator(language,random){
 const pick=bank=>bank[Math.min(bank.length-1,Math.max(0,Math.floor(random()*bank.length)))];let index=0;
 const bank=fillerLocales[language],decks=new Map(),last=new Map();
 // Draw each phrase once before refilling, including across long word/character output.
 const draw=key=>{
  if(!decks.get(key)?.length)decks.set(key,[...bank[key]]);
  const deck=decks.get(key);let i=Math.min(deck.length-1,Math.max(0,Math.floor(random()*deck.length)));
  if(deck.length>1&&deck[i]===last.get(key))i=(i+1)%deck.length;
  const value=deck.splice(i,1)[0];last.set(key,value);return value;
 };
 let patterns=[];
 return ()=>{
  index++;
  if(bank){
   if(!patterns.length)patterns=[['a','c'],['a','b','c'],['b','a','c'],['intro','a','b','c'],['a','b','bridge','c'],['intro','a','bridge','c']];
   const i=Math.min(patterns.length-1,Math.max(0,Math.floor(random()*patterns.length)));
   return patterns.splice(i,1)[0].map(draw).join(language==='ja'?'':' ');
  }
  if(index===1)return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
  const words=Array.from({length:8+Math.floor(random()*9)},()=>pick(latin));return words.join(' ').replace(/^./,c=>c.toUpperCase())+'.';
 };
}
export function generateLorem(language='la',paragraphs=3,perParagraph=4,random=Math.random){
 const sentence=sentenceGenerator(language,random);
 return Array.from({length:bounded(paragraphs,20)},()=>Array.from({length:bounded(perParagraph,10)},sentence).join(language==='ja'?'':' ')).join('\n\n');
}
export function generateFiller(language='la',mode='paragraphs',count=3,sentences=4,random=Math.random){
 if(mode==='paragraphs')return generateLorem(language,count,sentences,random);
 const size=bounded(count,mode==='words'?2000:10000);let result='';const sentence=sentenceGenerator(language,random);
 // Japanese word mode counts spaced phrase units, not a morphological analysis.
 while((mode==='words'?result.trim().split(/\s+/).filter(Boolean).length:Array.from(result).length)<size){
  const part=Array.from({length:10},sentence).join(language==='ja'?'':' ');
  result+=(result?' ':'')+(mode==='words'&&language==='ja'?part.replace(/。/g,'。 '):part);
 }
 return mode==='words'?result.trim().split(/\s+/).slice(0,size).join(' '):Array.from(result).slice(0,size).join('');
}
