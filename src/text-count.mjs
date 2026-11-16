export function countText(text){
 const points=Array.from(text);const graphemes=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(v=>v.segment):points;
 const words=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'word'}).segment(text)].filter(v=>v.isWordLike).length:(text.trim()?text.trim().split(/\s+/u).length:0);
 const legacy=points.reduce((sum,c)=>sum+(c.codePointAt(0)<=127?1:2),0);
 return {characters:graphemes.length,noSpaces:graphemes.filter(c=>!/^\s+$/u.test(c)).length,codePoints:points.length,utf16:text.length,utf16Bytes:text.length*2,utf8:new TextEncoder().encode(text).length,legacy,words,lines:text?text.split(/\r\n|\r|\n/).length:0};
}
