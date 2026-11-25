import {Marked} from 'marked';
import createDOMPurify from 'dompurify';
export const MAX_MARKDOWN=200000;
const CJK='[\\p{sc=Hangul}\\p{sc=Hiragana}\\p{sc=Katakana}\\p{sc=Han}]';
const CJK_RE=new RegExp(CJK,'u');
const CJK_PUNCT=new RegExp('^((?![*_])[\\s\\p{P}\\p{S}'+CJK.slice(1,-1)+'])','u');
const CJK_EM_R_AST=new RegExp('^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)(?!~)[\\p{P}\\p{S}](?:(?<=[\\p{Ps}\\p{Pi}])(?=\\*+(?:[\\s]|$))|(?<![\\p{Ps}\\p{Pi}])(?=\\*+(?:[\\s]|$|'+CJK+')))(\\*+)(?!\\*)|(?:[^\\s\\p{P}\\p{S}]|~)(\\*+)(?!\\*)(?=(?!~)[\\s\\p{P}\\p{S}]|$)|(?!\\*)(?!~)[\\s\\p{P}\\p{S}](\\*+)(?=(?:[^\\s\\p{P}\\p{S}]|~))|[\\s](\\*+)(?!\\*)(?=(?!~)[\\p{P}\\p{S}])|(?!\\*)(?!~)[\\p{P}\\p{S}](\\*+)(?!\\*)(?=(?!~)[\\p{P}\\p{S}])|(?:[^\\s\\p{P}\\p{S}]|~)(\\*+)(?=(?:[^\\s\\p{P}\\p{S}]|~))','gu');
const CJK_DEL_R=new RegExp('^[^~]+(?=[^~])|(?!~)[\\p{P}\\p{S}](?:(?<=[\\p{Ps}\\p{Pi}])(?=~~?(?:[\\s]|$))|(?<![\\p{Ps}\\p{Pi}])(?=~~?(?:[\\s]|$|'+CJK+')))(~~?)(?!~)|[^\\s\\p{P}\\p{S}](~~?)(?!~)(?=[\\s\\p{P}\\p{S}]|$)|(?!~)[\\s\\p{P}\\p{S}](~~?)(?=[^\\s\\p{P}\\p{S}])|[\\s](~~?)(?!~)(?=[\\p{P}\\p{S}])|(?!~)[\\p{P}\\p{S}](~~?)(?!~)(?=[\\p{P}\\p{S}])|[^\\s\\p{P}\\p{S}](~~?)(?=[^\\s\\p{P}\\p{S}])','gu');
function createCjkMarked(){
 const parser=new Marked({gfm:true,breaks:false,async:false});
 const baseEmStrong=parser.Tokenizer.prototype.emStrong,baseDel=parser.Tokenizer.prototype.del,basePunct=new WeakMap();
 const patchRules=tok=>{
  if(basePunct.has(tok.rules))return basePunct.get(tok.rules);
  const orig=tok.rules.inline.punctuation;
  tok.rules={...tok.rules,inline:{...tok.rules.inline,emStrongRDelimAst:CJK_EM_R_AST,delRDelim:CJK_DEL_R}};
  basePunct.set(tok.rules,orig);return orig;
 };
 parser.use({tokenizer:{
  emStrong(src,maskedSrc,prevChar=''){
   const orig=patchRules(this),idx=maskedSrc.length-src.length;
   const before=idx>0?[...maskedSrc.slice(0,idx).replace(/\*+$/,'')].at(-1)||'':prevChar;
   const cjkOpen=src[0]==='*'&&!!this.rules.inline.emStrongLDelim.exec(src)?.[1]&&(CJK_RE.test(prevChar)||(prevChar==='*'&&CJK_RE.test(before)));
   const saved=this.rules.inline.punctuation;this.rules.inline.punctuation=cjkOpen?CJK_PUNCT:orig;
   try{return baseEmStrong.call(this,src,maskedSrc,prevChar)}finally{this.rules.inline.punctuation=saved}
  },
  del(src,maskedSrc,prevChar=''){
   const orig=patchRules(this);
   const cjkOpen=src[0]==='~'&&!!this.rules.inline.delLDelim.exec(src)?.[1]&&CJK_RE.test(prevChar);
   const saved=this.rules.inline.punctuation;this.rules.inline.punctuation=cjkOpen?CJK_PUNCT:orig;
   try{return baseDel.call(this,src,maskedSrc,prevChar)}finally{this.rules.inline.punctuation=saved}
  }
 }});
 return parser;
}
const cjkMarked=createCjkMarked();
export const documentStyle='body{margin:0;background:#fff;color:#24292f;font:16px/1.75 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:860px;margin:auto;padding:40px 24px;overflow-wrap:anywhere}h1,h2,h3{line-height:1.35;margin:1.5em 0 .65em}h1,h2{padding-bottom:.3em;border-bottom:1px solid #d8dee4}a{color:#0969da}pre{padding:16px;background:#f6f8fa;border-radius:6px;overflow:auto;line-height:1.5}code{font-family:ui-monospace,monospace;font-size:.9em;background:#f6f8fa;padding:.12em .3em}pre code{padding:0}blockquote{margin-left:0;padding:0 16px;color:#57606a;border-left:4px solid #d0d7de}table{display:block;max-width:100%;overflow:auto;border-collapse:collapse}th,td{border:1px solid #d0d7de;padding:6px 13px}th{background:#f6f8fa}img{max-width:100%;height:auto}hr{border:0;border-top:1px solid #d0d7de;margin:24px 0}input[type=checkbox]{margin-right:6px}li{margin:.3em 0}@media print{main{padding:0}pre{white-space:pre-wrap}}';
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function createMarkdownConverter(windowObject){
 const purify=createDOMPurify(windowObject);
 purify.addHook('afterSanitizeAttributes',node=>{if(node.nodeName==='INPUT'){node.setAttribute('type','checkbox');node.setAttribute('disabled','')}});
 return markdown=>{
  if(markdown.length>MAX_MARKDOWN)throw Error('마크다운은 최대 20만 자까지 변환할 수 있습니다.');
  const raw=cjkMarked.parse(markdown.replace(/^\uFEFF/,''),{gfm:true,breaks:false,async:false});
  return purify.sanitize(raw,{ALLOWED_TAGS:['h1','h2','h3','h4','h5','h6','p','br','hr','strong','b','em','i','del','s','blockquote','ul','ol','li','pre','code','a','img','table','thead','tbody','tfoot','tr','th','td','input','sup','sub','dl','dt','dd','details','summary','kbd'],ALLOWED_ATTR:['href','src','alt','title','class','start','reversed','colspan','rowspan','align','type','checked','disabled','open'],ALLOW_DATA_ATTR:false,ALLOW_ARIA_ATTR:false});
 };
}
export const DEFAULT_DOCUMENT_TITLES={ko:'Markdown 문서',en:'Markdown Document',ja:'マークダウン文書'};
export function defaultDocumentTitle(lang='ko'){return DEFAULT_DOCUMENT_TITLES[lang]||DEFAULT_DOCUMENT_TITLES.ko}
export function extractDocumentTitle(body,windowObject){
 if(!body||!windowObject)return '';
 const doc=new windowObject.DOMParser().parseFromString(body,'text/html');
 const h1=Array.from(doc.body.children).find(el=>el.tagName==='H1');
 return h1?h1.textContent.replace(/\s+/g,' ').trim().slice(0,160).trim():'';
}
export function sanitizeFilename(name,fallback='document'){
 const cleaned=String(name??'').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/\s+/g,' ').replace(/^[.\s]+|[.\s]+$/g,'').slice(0,100).trim();
 return cleaned||fallback;
}
export function htmlDocument(body,title='',images=true,lang='ko'){const safeLang=['ko','en','ja'].includes(lang)?lang:'ko';const resolvedTitle=String(title??'').trim()||defaultDocumentTitle(safeLang);const policy="default-src 'none'; style-src 'unsafe-inline'; img-src "+(images?"https: http: data:":"data:")+"; base-uri 'none'; form-action 'none';";return '<!doctype html>\n<html lang="'+safeLang+'">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta http-equiv="Content-Security-Policy" content="'+escapeHTML(policy)+'">\n<meta name="referrer" content="no-referrer">\n<title>'+escapeHTML(resolvedTitle)+'</title>\n<style>'+documentStyle+'</style>\n</head>\n<body>\n<main>\n'+body+'\n</main>\n</body>\n</html>\n'}

// Walk a detached, sanitized document. Never fetch images or execute source HTML.
export function plainTextFromHTML(body,windowObject){
 const doc=new windowObject.DOMParser().parseFromString(body,'text/html');
 const walk=node=>{
  if(node.nodeType===3)return /^\s*$/.test(node.textContent)&&['BODY','UL','OL','TABLE','THEAD','TBODY','TFOOT','TR'].includes(node.parentElement?.tagName)?'':node.textContent;
  if(node.nodeType!==1)return '';
  const tag=node.tagName,children=()=>Array.from(node.childNodes).map(walk).join('');
  if(tag==='BR')return '\n';if(tag==='HR')return '\n\n';if(tag==='IMG')return node.getAttribute('alt')||'';
  if(tag==='INPUT')return node.hasAttribute('checked')?'☑ ':'☐ ';
  if(tag==='PRE')return '\n'+node.textContent.replace(/\n$/,'')+'\n\n';
  if(tag==='A'){const label=children(),href=node.getAttribute('href');return href&&label!==href?label+' ('+href+')':label}
  if(tag==='TR')return Array.from(node.children).map(n=>walk(n).trim()).join('\t')+'\n';
  if(tag==='LI'){const parent=node.parentElement;const prefix=parent?.tagName==='OL'?(Number(parent.getAttribute('start')||1)+Array.from(parent.children).indexOf(node))+'. ':'• ';return prefix+children().trim().replace(/([☑☐])\s*/g,'$1 ')+'\n'}
  if(['UL','OL','TABLE'].includes(tag))return '\n'+children()+'\n';
  if(/^(H[1-6]|P|BLOCKQUOTE|DIV|DL|DT|DD|DETAILS|SUMMARY)$/.test(tag))return children()+'\n\n';
  return children();
 };
 return Array.from(doc.body.childNodes).map(walk).join('').replace(/\n[ \t]+\n/g,'\n\n').replace(/\n{3,}/g,'\n\n').replace(/^\n+|\n+$/g,'');
}
