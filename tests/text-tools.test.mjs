import test from 'node:test';
import assert from 'node:assert/strict';
import {fontStyles,stylize,symbolGroups} from '../src/text-tools.mjs';
test('every style preserves Korean, emoji, whitespace and all letters',()=>{
 for(const s of fontStyles){assert.equal(stylize('한글 🥰\n',s.id),'한글 🥰\n');const text='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';const out=stylize(text,s.id);assert.equal(Array.from(out).length,text.length);assert.ok(!out.includes('undefined'));assert.notEqual(out,text)}
 assert.equal(stylize('CHNPQRZ','double'),'ℂℍℕℙℚℝℤ');assert.equal(stylize('Ab 12','bold'),'𝐀𝐛 𝟏𝟐');
});
test('symbol groups contain only populated unique entries',()=>{for(const g of symbolGroups){assert.ok(g.chars.length);assert.equal(new Set(g.chars).size,g.chars.length);assert.ok(g.chars.every(x=>x.trim()))}});
