import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {guides} from '../src/guides.mjs';
test('static pages include guides, canonical URLs and assets for both hosting roots',()=>{
 for(const site of ['https://example.com/','https://jaysong23.github.io/pocket-utility/']){
  execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,SITE_URL:site}});
  for(const [id,g] of Object.entries(guides)){
   const html=readFileSync('dist/'+id+'/index.html','utf8');
   assert.ok(html.includes('<link rel="canonical" href="'+site+id+'/">'));
   assert.ok(html.includes(g[3]));assert.ok(html.includes('src="'+new URL(site).pathname+'entry.js"'));
  }
  const sitemap=readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,12);
  assert.ok(sitemap.includes(site+'webp/'));assert.ok(!sitemap.includes('#/'));
 }
});
