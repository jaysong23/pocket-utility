import {build} from 'esbuild';
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {guides,guideHTML,escapeHTML as esc} from '../src/guides.mjs';
const raw=process.env.SITE_URL||(process.env.CF_PAGES_URL?process.env.CF_PAGES_URL:'https://jaysong23.github.io/pocket-utility/');
const site=new URL(raw);if(!['http:','https:'].includes(site.protocol)||site.search||site.hash)throw Error('SITE_URL must be an HTTP(S) site root without query or hash');
site.pathname=site.pathname.replace(/\/?$/,'/');const base=site.pathname;
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},outdir:'dist',entryNames:'entry'});
const template=await readFile('index.html','utf8');
const routes=['',...Object.keys(guides)];
const description='이미지 변환, 날짜와 주차 검색, 텍스트 도구와 계산기를 한곳에서 사용하세요.';
for(const route of routes){
 const g=guides[route],title=(g?.[0]||'작고 편리한 온라인 도구')+' | Pocket Utility',desc=g?.[1]||description,url=new URL(route?route+'/':'',site).href;
 const nav='<nav aria-label="도구 목록"><a href="'+base+'">모든 도구</a>'+Object.entries(guides).map(([id,v])=>'<a href="'+base+id+'/">'+esc(v[0])+'</a>').join('')+'</nav>';
 const initial='<div class="static-intro">'+nav+'<h1>'+esc(title)+'</h1><p>'+esc(desc)+'</p><noscript>변환 기능은 자바스크립트를 켜야 사용할 수 있습니다.</noscript>'+guideHTML(route)+'</div>';
 let html=template.replace(/<title>.*?<\/title>/,'<title>'+esc(title)+'</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+esc(desc)+'">').replace('href="entry.css"','href="'+base+'entry.css"').replace('src="entry.js"','src="'+base+'entry.js"').replace('<div id="root"></div>','<div id="root">'+initial+'</div>');
 html=html.replace('</head>','<meta name="site-base" content="'+esc(base)+'"><link rel="canonical" href="'+esc(url)+'"><meta property="og:type" content="website"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(desc)+'"><meta property="og:url" content="'+esc(url)+'"></head>');
 const dir='dist'+(route?'/'+route:'');await mkdir(dir,{recursive:true});await writeFile(dir+'/index.html',html);
}
await writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(r=>'<url><loc>'+esc(new URL(r?r+'/':'',site).href)+'</loc></url>').join('')+'</urlset>');
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: '+new URL('sitemap.xml',site).href+'\n');
await writeFile('dist/404.html','<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="robots" content="noindex"><title>페이지를 찾을 수 없습니다</title><h1>페이지를 찾을 수 없습니다.</h1><a href="'+base+'">모든 도구로 돌아가기</a></html>');
await writeFile('dist/.nojekyll','');
console.log('Generated '+routes.length+' static pages for '+site.href);
