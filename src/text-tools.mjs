const range=(start,n)=>Array.from({length:n},(_,i)=>String.fromCodePoint(start+i));
export const fontStyles=[
 {id:'bold',name:'볼드 세리프',upper:0x1d400,lower:0x1d41a,digits:0x1d7ce},
 {id:'bold-italic',name:'볼드 이탤릭',upper:0x1d468,lower:0x1d482},
 {id:'script',name:'볼드 손글씨',upper:0x1d4d0,lower:0x1d4ea},
 {id:'gothic',name:'볼드 고딕',upper:0x1d56c,lower:0x1d586},
 {id:'sans',name:'산세리프',upper:0x1d5a0,lower:0x1d5ba,digits:0x1d7e2},
 {id:'sans-bold',name:'볼드 산세리프',upper:0x1d5d4,lower:0x1d5ee,digits:0x1d7ec},
 {id:'sans-italic',name:'이탤릭 산세리프',upper:0x1d608,lower:0x1d622},
 {id:'sans-bold-italic',name:'볼드 이탤릭 산세리프',upper:0x1d63c,lower:0x1d656},
 {id:'mono',name:'타자기',upper:0x1d670,lower:0x1d68a,digits:0x1d7f6},
 {id:'full',name:'전각',upper:0xff21,lower:0xff41,digits:0xff10},
 {id:'circle',name:'동그라미',upper:0x24b6,lower:0x24d0},
 {id:'double',name:'더블 라인',upperChars:Array.from('𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ'),lower:0x1d552,digits:0x1d7d8}
];
export function stylize(text,id){const style=fontStyles.find(s=>s.id===id);if(!style)throw Error('알 수 없는 스타일');return Array.from(text,c=>{const code=c.codePointAt(0);if(code>=65&&code<=90)return style.upperChars?.[code-65]||String.fromCodePoint(style.upper+code-65);if(code>=97&&code<=122)return String.fromCodePoint(style.lower+code-97);if(code>=48&&code<=57&&style.digits)return String.fromCodePoint(style.digits+code-48);return c}).join('')}
export const symbolGroups=[
 {name:'별·하트·체크',hint:'별 하트 체크 불릿 즐겨찾기',chars:Array.from('☆★✩✪✫✬✭✮✯✰♡♥❤❥❦❧♧♣♤♠•◦∙※✓✔☑☒✕✖')},
 {name:'화살표',hint:'방향 이동 왼쪽 오른쪽 위 아래',chars:Array.from('←↑→↓↔↕↖↗↘↙⇄⇆⇐⇑⇒⇓⇔⇕➔➜➝➞➟➠➡➤➥➦☜☞')},
 {name:'도형',hint:'원 네모 삼각형 사각형 다이아',chars:Array.from('○●◎◉◌◍◐◑◒◓◔◕□■▢▣▤▥▦▧▨▩△▲▽▼◁◀▷▶◇◆◈')},
 {name:'숫자·원문자',hint:'번호 숫자 원문자 순서',chars:[...range(0x2460,20),...range(0x2776,10),'⓪',...range(0x2160,12)]},
 {name:'한글·영문 원문자',hint:'한글 영문 알파벳 원문자',chars:[...range(0x3260,28),...range(0x24b6,26),...range(0x24d0,26)]},
 {name:'괄호·문장부호',hint:'괄호 따옴표 말줄임표 문장',chars:Array.from('〈〉《》「」『』【】〔〕〖〗〘〙｛｝［］“”‘’«»‹›…‥·—–―¡¿§¶†‡')},
 {name:'수학·분수',hint:'수학 더하기 빼기 곱하기 나누기 무한 분수',chars:Array.from('±×÷≠≈≡≤≥≪≫∞∴∵√∛∜∑∏∫∬∮∂∇∈∉∋⊂⊃⊆⊇∩∪∅∀∃¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞')},
 {name:'통화·단위',hint:'돈 원 달러 엔 유로 파운드 온도 길이 무게',chars:['₩','$','€','£','¥','¢','₹','₽','₿','₫','₱','℃','℉','°','㎜','㎝','㎞','㎡','㎥','㎎','㎏','㎖','ℓ','㎐','㎑','㎒','㏈','%','‰']},
 {name:'키보드·업무',hint:'윈도우 맥 커맨드 옵션 컨트롤 시프트 키보드 회사 저작권',chars:Array.from('⌘⌥⌃⇧⇪⎋⌫⌦↩⏎⇥⇤⌨⌂©®™℠№㈜㉿☎☏✉✂✈')},
 {name:'날씨·음악',hint:'해 달 구름 날씨 음악 음표 체스',chars:Array.from('☀☁☂☃☄☼☽☾♨♩♪♫♬♭♮♯♀♂☯♔♕♖♗♘♙♚♛♜♝♞♟')}
];
