import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {guides} from '../src/guides.mjs';
import {t} from '../src/i18n.mjs';
import {pagePath} from '../src/seo.mjs';
test('36 localized static pages have unique metadata, semantic content and share images',()=>{
 for(const site of ['https://example.com/','https://jaysong23.github.io/pocket-utility/']){
  execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,SITE_URL:site}});
  const canonicals=new Set();
  for(const lang of ['ko','en','ja'])for(const id of ['',...Object.keys(guides)]){
   const html=readFileSync('dist/'+pagePath(id,lang)+'index.html','utf8'),dom=new JSDOM(html);const d=dom.window.document;
   assert.equal(d.documentElement.lang,lang);assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelectorAll('main').length,1);
   const url=d.querySelector('link[rel=canonical]').href;assert.equal(url,site+pagePath(id,lang));canonicals.add(url);
   assert.equal(d.querySelectorAll('link[hreflang]').length,4);assert.equal(d.querySelector('meta[property="og:url"]').content,url);
   assert.equal(d.querySelector('meta[property="og:title"]').content,d.title);
   assert.ok(existsSync('public/og/'+lang+'-'+(id||'home')+'.png'));
   assert.equal(d.querySelector('meta[property="og:image"]').content,site+'og/'+lang+'-'+(id||'home')+'.png');
   assert.ok(JSON.parse(d.querySelector('#page-schema').textContent)['@graph']);
   if(id){assert.ok(html.includes(t(guides[id][3],lang)));assert.ok(d.querySelector('.tool-guide ol li'));assert.ok(d.querySelector('.breadcrumbs'))}
   if(lang!=='ko'){assert.doesNotMatch(d.querySelector('main').textContent,/[가-힣]/)}
   assert.ok(html.includes('src="'+new URL(site).pathname+'entry.js"'));dom.window.close();
  }
  assert.equal(canonicals.size,36);const sitemap=readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,36);assert.ok(!sitemap.includes('#/'));assert.ok(!sitemap.includes('md-to-html'));
  assert.ok(readFileSync('dist/md-to-html/index.html','utf8').includes('href="'+site+'markdown/"'));
 }
});
