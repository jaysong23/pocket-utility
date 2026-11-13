// Explicit aliases only: avoid ambiguous locale-specific numeric date guessing.
export function normalizeWeekQuery(input){
 let s=input.normalize('NFKC').trim();
 const exact={'today':'오늘','tomorrow':'내일','yesterday':'어제','day after tomorrow':'모레','day before yesterday':'그제','this week':'이번주','next week':'다음주','last week':'지난주','今日':'오늘','明日':'내일','昨日':'어제','明後日':'모레','一昨日':'그제','今週':'이번주','来週':'다음주','先週':'지난주','再来週':'다다음주'};
 if(exact[s.toLowerCase()])return exact[s.toLowerCase()];
 s=s.replace(/^(next year|this year|last year)\s+/i,(_,x)=>({'next year':'내년','this year':'올해','last year':'작년'}[x.toLowerCase()]));
 s=s.replace(/^(来年|今年|去年|昨年)の?/,(_,x)=>({'来年':'내년','今年':'올해','去年':'작년','昨年':'작년'}[x]));
 const aliases={'Christmas Eve':'크리스마스이브','Christmas':'크리스마스','Chuseok':'추석','Seollal':'설날',"New Year's Day":'신정',"Children's Day":'어린이날',"Buddha's Birthday":'부처님오신날','クリスマスイブ':'크리스마스이브','クリスマス':'크리스마스','秋夕':'추석','旧正月':'설날','元日':'신정','こどもの日':'어린이날','釈迦誕生日':'부처님오신날'};
 for(const [a,b] of Object.entries(aliases))s=s.replace(new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i'),b);
 s=s.replace(/^(\d{2}|\d{4})\s+(?=week|w\d)/i,'$1년');
 s=s.replace(/^(?:week\s*|w)(\d{1,2})\s*,?\s+(\d{4})$/i,'$2년$1주차');
 s=s.replace(/(?:week\s*|第)(\d{1,2})(?:週)?$/i,'$1주차');
 s=s.replace(/年/g,'년').replace(/月/g,'월').replace(/日$/,'일');
 const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
 const date=s.match(/^([a-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?$/i);
 if(date){const m=months.findIndex(v=>v===date[1].toLowerCase()||v.slice(0,3)===date[1].toLowerCase());if(m>=0)s=(date[3]?date[3]+'년':'')+(m+1)+'월'+date[2]+'일'}
 return s;
}
