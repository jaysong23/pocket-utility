import {infoPages} from '../src/info-pages.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {guides} from '../src/guides.mjs';
import {t} from '../src/i18n.mjs';
import {pagePath} from '../src/seo.mjs';
test('66 localized static pages have unique metadata, semantic content and share images',()=>{
 for(const site of ['https://example.com/','https://jaysong23.github.io/pocket-utility/']){
  execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,SITE_URL:site}});
  const version=JSON.parse(readFileSync('dist/version.json','utf8'));assert.match(version.commit,/^[a-f0-9]{40}$/);assert.ok(Number.isFinite(Date.parse(version.builtAt)));
  const canonicals=new Set();
  for(const lang of ['ko','en','ja'])for(const id of ['',...Object.keys(guides),...Object.keys(infoPages)]){
   const html=readFileSync('dist/'+pagePath(id,lang)+'index.html','utf8'),dom=new JSDOM(html);const d=dom.window.document;
   assert.equal(d.documentElement.lang,lang);assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelectorAll('main').length,1);
   const url=d.querySelector('link[rel=canonical]').href;assert.equal(url,site+pagePath(id,lang));canonicals.add(url);
   assert.equal(d.querySelectorAll('link[hreflang]').length,4);assert.equal(d.querySelector('meta[property="og:url"]').content,url);
   assert.equal(d.querySelector('meta[property="og:title"]').content,d.title);
   assert.ok(existsSync('public/og/'+lang+'-'+(id||'home')+'.png'));
   assert.equal(d.querySelector('meta[property="og:image"]').content,site+'og/'+lang+'-'+(id||'home')+'.png');
   assert.ok(JSON.parse(d.querySelector('#page-schema').textContent)['@graph']);
   if(guides[id]){assert.ok(html.includes(t(guides[id][3],lang)));assert.ok(d.querySelector('.tool-guide ol li'));assert.ok(d.querySelector('.breadcrumbs'))}
   if(infoPages[id]){assert.ok(d.querySelector('.info-content'));assert.ok(d.querySelector('.breadcrumbs'))}
   if(lang!=='ko'){assert.doesNotMatch(d.querySelector('main').textContent,/[가-힣]/)}
   assert.ok(html.includes('src="'+new URL(site).pathname+'entry.js"'));dom.window.close();
  }
  assert.equal(canonicals.size,66);const sitemap=readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,66);assert.ok(!sitemap.includes('#/'));assert.ok(!sitemap.includes('md-to-html'));
  assert.ok(readFileSync('dist/md-to-html/index.html','utf8').includes('href="'+site+'markdown/"'));
  for(const [lang,title] of [['ko','위크넘버 계산기'],['en','Week number calculator'],['ja','週番号計算ツール']]){
   const wdom=new JSDOM(readFileSync('dist/'+pagePath('weeknumber',lang)+'index.html','utf8'));const wd=wdom.window.document;
   assert.equal(wd.title,title+' | MY POCKET UTILITY');assert.equal(wd.querySelector('h1').textContent,title);
   assert.equal(wd.querySelector('meta[property="og:title"]').content,title+' | MY POCKET UTILITY');
   assert.equal(wd.querySelector('meta[name="twitter:title"]').content,title+' | MY POCKET UTILITY');
   const graph=JSON.parse(wd.querySelector('#page-schema').textContent)['@graph'];
   assert.equal(graph.find(n=>n['@type']==='BreadcrumbList').itemListElement[1].name,title);
   wdom.window.close();
  }
 }
});

test('verification and icons are present in built HTML and ICO contains small sizes',()=>{
 const html=readFileSync('dist/index.html','utf8');assert.ok(html.includes('name="naver-site-verification" content="a35bf882b515b12fcc10b239dcc8be5aaeb63caf"'));
 assert.ok(html.includes('rel="apple-touch-icon"'));assert.ok(html.includes('favicon.ico'));assert.ok(html.includes('icons/pocket-64.png'));
 const ico=readFileSync('dist/favicon.ico');assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),3);assert.deepEqual([ico[6],ico[22],ico[38]],[16,32,48]);
});
