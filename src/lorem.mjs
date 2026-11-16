const sentences={
 ko:['이곳은 디자인과 글의 흐름을 확인하기 위한 예시 문장입니다.','작은 아이디어가 모여 새로운 가능성을 만들어 갑니다.','여유로운 아침의 햇살이 창가에 조용히 내려앉습니다.','필요한 내용을 알맞게 배치하면 메시지가 더욱 또렷해집니다.','익숙한 풍경 속에서도 새로운 이야기를 발견할 수 있습니다.','서로 다른 생각이 만나 더 넓은 시야를 열어 줍니다.','이 문장은 실제 내용이 들어갈 자리를 미리 보여 줍니다.','차분한 색과 적절한 여백이 읽기 편한 화면을 만듭니다.'],
 en:['This sample text helps you explore the layout and rhythm of a page.','Small ideas come together to create new possibilities.','Morning light falls gently across the quiet room.','Clear structure makes the message easier to understand.','A familiar place can hold the beginning of a new story.','Different perspectives give us more room to imagine.','Replace these sentences with your own content when the design is ready.','Thoughtful spacing gives every word a little room to breathe.'],
 ja:['これは文章の流れとデザインを確認するためのサンプルです。','小さなアイデアが集まり、新しい可能性が生まれます。','朝の光が静かな部屋にやさしく差し込みます。','情報を整理すると、伝えたいことがより明確になります。','見慣れた風景の中にも、新しい物語が隠れています。','異なる視点が出会うことで、想像の世界が広がります。','デザインが完成したら、実際の文章に置き換えてください。','読みやすい文字と適度な余白が、心地よい画面を作ります。']
};
const bounded=(value,max)=>Number.isFinite(Number(value))?Math.min(max,Math.max(1,Math.floor(Number(value)))):1;
export function generateLorem(language='ko',paragraphs=3,perParagraph=4,random=Math.random){
 const bank=sentences[language]||sentences.ko;
 return Array.from({length:bounded(paragraphs,20)},()=>{let start=Math.floor(random()*bank.length)%bank.length;return Array.from({length:bounded(perParagraph,10)},(_,i)=>bank[(start+i)%bank.length]).join(language==='ja'?'':' ')}).join('\n\n');
}
