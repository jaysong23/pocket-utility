// Layout filler: Latin vocabulary and deliberately unrelated Korean/Japanese clauses.
const latin='lorem ipsum dolor sit amet consectetur adipiscing elit sed eiusmod tempor incididunt labore dolore magna aliqua enim minim veniam quis nostrud exercitation ullamco laboris nisi aliquip commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat proident culpa officia deserunt mollit anim laborum integer pretium vestibulum donec facilisis massa viverra pulvinar neque fermentum sagittis pellentesque tellus pharetra lectus posuere'.split(' ');
const ko={a:['고요한 모서리는','느린 여백이','투명한 계절은','둥근 문장이','가벼운 물결은','낯선 간격이','푸른 윤곽은','작은 오후가'],b:['접힌 온도 사이에서','네모난 바람 너머로','마른 메아리 아래에서','기울어진 순서 곁으로','먼 색깔 안에서','얇은 방향 사이로','남은 속도 위에서','비어 있는 소리 곁에서'],c:['부드러운 깊이를 접습니다.','흩어진 무게를 읽습니다.','낮은 색채를 건넵니다.','느슨한 어제를 펼칩니다.','둥근 침묵을 셉니다.','흐린 간격을 담습니다.','가벼운 순서를 두드립니다.','먼 투명함을 묶습니다.']};
const ja={a:['静かな輪郭は','丸い余白が','透明な季節は','小さな午後が','淡い順序は','遠い音色が','柔らかな角は','青い間隔が'],b:['折り畳んだ温度の中で','四角い風の向こうで','乾いた響きの下で','傾いた速度のそばで','薄い方向の間で','空っぽの色の上で','残された重さの中で','遠い形のそばで'],c:['軽い深さを並べます。','散らばった重さを読みます。','丸い静けさを数えます。','淡い昨日を広げます。','柔らかな順序を結びます。','小さな透明さを包みます。','細い響きを折り畳みます。','静かな間隔を運びます。']};
const bounded=(value,max)=>Number.isFinite(Number(value))?Math.min(max,Math.max(1,Math.floor(Number(value)))):1;
export function generateLorem(language='la',paragraphs=3,perParagraph=4,random=Math.random){
 const pick=bank=>bank[Math.min(bank.length-1,Math.max(0,Math.floor(random()*bank.length)))];let index=0;
 const sentence=()=>{index++;if(language==='ko'||language==='ja'){const bank=language==='ko'?ko:ja;return [pick(bank.a),pick(bank.b),pick(bank.c)].join(language==='ja'?'':' ')}
 if(index===1)return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
 const words=Array.from({length:8+Math.floor(random()*9)},()=>pick(latin));return words.join(' ').replace(/^./,c=>c.toUpperCase())+'.';};
 return Array.from({length:bounded(paragraphs,20)},()=>Array.from({length:bounded(perParagraph,10)},sentence).join(language==='ja'?'':' ')).join('\n\n');
}
export function generateFiller(language='la',mode='paragraphs',count=3,sentences=4,random=Math.random){
 if(mode==='paragraphs')return generateLorem(language,count,sentences,random);
 const size=bounded(count,mode==='words'?2000:10000);let result='';
 // Japanese word mode counts spaced phrase units, not a morphological analysis.
 while((mode==='words'?result.trim().split(/\s+/).filter(Boolean).length:Array.from(result).length)<size){
  const part=generateLorem(language,1,10,random);
  result+=(result?' ':'')+(mode==='words'&&language==='ja'?part.replace(/。/g,'。 '):part);
 }
 return mode==='words'?result.trim().split(/\s+/).slice(0,size).join(' '):Array.from(result).slice(0,size).join('');
}
