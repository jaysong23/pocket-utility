import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},outdir:'dist',entryNames:'entry'});
await writeFile('dist/index.html',await readFile('index.html','utf8'));
await writeFile('dist/.nojekyll','');
