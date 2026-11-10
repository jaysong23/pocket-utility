import {useEffect,useRef,useState} from 'react';
import {FileText,Download,Upload,X} from 'lucide-react';
const PDF_BASE='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/';
type PageImage={url:string;name:string;width:number;height:number;size:number};
export default function PdfConverter(){
 const [file,setFile]=useState<File|null>(null),[scale,setScale]=useState('2'),[quality,setQuality]=useState(92),[password,setPassword]=useState(''),[pages,setPages]=useState<PageImage[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[progress,setProgress]=useState('');
 const urls=useRef<string[]>([]),job=useRef<any>(null),token=useRef(0),alive=useRef(true);
 const clear=()=>{urls.current.forEach(URL.revokeObjectURL);urls.current=[];setPages([])};
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;token.current++;void job.current?.destroy();urls.current.forEach(URL.revokeObjectURL)}},[]);
 const choose=(next:File|undefined)=>{if(!next||busy)return;setMessage('');if(!/\.pdf$/i.test(next.name)&&next.type!=='application/pdf'){setMessage('PDF 파일을 선택해 주세요.');return}if(next.size>50*1024*1024){setMessage('50MB 이하 PDF를 선택해 주세요.');return}clear();setFile(next);setPassword('');setProgress('')};
 const run=async()=>{if(!file||busy)return;const id=++token.current;clear();setBusy(true);setMessage('');setProgress('PDF 변환기를 준비하고 있어요…');let task:any;try{
  const moduleUrl=PDF_BASE+'legacy/build/pdf.mjs';const pdfjs=await import(moduleUrl);if(!alive.current||id!==token.current)return;
  pdfjs.GlobalWorkerOptions.workerSrc=PDF_BASE+'legacy/build/pdf.worker.mjs';
  const data=new Uint8Array(await file.arrayBuffer());if(!alive.current||id!==token.current)return;
  task=pdfjs.getDocument({data,password:password||undefined,cMapUrl:PDF_BASE+'cmaps/',cMapPacked:true,standardFontDataUrl:PDF_BASE+'standard_fonts/',wasmUrl:PDF_BASE+'wasm/',isEvalSupported:false});job.current=task;
  const pdf=await task.promise;if(pdf.numPages>100)throw Error('한 번에 최대 100페이지까지 변환할 수 있어요. PDF를 나누어 다시 선택해 주세요.');let totalBytes=0;
  for(let n=1;n<=pdf.numPages;n++){
   if(!alive.current||id!==token.current)break;setProgress(`${n} / ${pdf.numPages}페이지 변환 중`);
   const page=await pdf.getPage(n),viewport=page.getViewport({scale:Number(scale)});
   if(viewport.width*viewport.height>16000000||viewport.width>16000||viewport.height>16000)throw Error(`${n}페이지의 이미지가 너무 큽니다. 낮은 해상도로 다시 시도해 주세요.`);
   const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   try{const ctx=canvas.getContext('2d');if(!ctx)throw Error('브라우저가 이미지 변환을 지원하지 않습니다.');await page.render({canvas,canvasContext:ctx,viewport,background:'#ffffff'}).promise;
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 만들지 못했습니다.')),'image/jpeg',quality/100));
    if(!alive.current||id!==token.current)break;totalBytes+=blob.size;if(totalBytes>200*1024*1024)throw Error('결과 용량이 200MB를 넘었습니다. 완료된 페이지를 저장하고 PDF를 나누어 변환해 주세요.');
    const url=URL.createObjectURL(blob);urls.current.push(url);setPages(old=>[...old,{url,name:`${file.name.replace(/\.pdf$/i,'')}-${String(n).padStart(3,'0')}.jpg`,width:canvas.width,height:canvas.height,size:blob.size}]);
   }finally{canvas.width=0;canvas.height=0;page.cleanup()}
  }
  if(alive.current&&id===token.current)setProgress(`${pdf.numPages}페이지 변환 완료`);
 }catch(e){if(alive.current&&id===token.current){const err=e as Error;setMessage(err.name==='PasswordException'?'암호가 필요한 PDF입니다. 아래 암호를 입력하고 다시 변환해 주세요.':err.name==='InvalidPDFException'?'올바른 PDF가 아니거나 파일이 손상되었습니다.':err.message||'변환에 실패했습니다. 인터넷 연결과 PDF 파일을 확인해 주세요.');setProgress('변환이 중단되었습니다. 완료된 이미지는 저장할 수 있어요.')}}finally{if(task)await task.destroy().catch(()=>{});if(job.current===task)job.current=null;if(alive.current&&id===token.current)setBusy(false)}};
 const save=(p:PageImage)=>{const a=document.createElement('a');a.href=p.url;a.download=p.name;a.click()};
 return <><div className="tool-heading"><span className="eyebrow">PDF TO JPG</span><h1>PDF 한 장 한 장을 JPG로.</h1><p>문서의 모든 페이지를 이미지로 저장하세요. PDF는 서버로 전송하지 않습니다.</p></div>
 <section className="pdf-workspace"><div className="pdf-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files[0])}}><FileText size={38}/><h2>{file?file.name:'PDF 파일을 끌어다 놓으세요'}</h2><p>{file?`${(file.size/1024/1024).toFixed(1)} MB`:'최대 50MB · 100페이지 · 한 번에 PDF 한 개'}</p><label className="select"><Upload size={16}/>{file?'다른 PDF 선택':'PDF 선택'}<input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={e=>{choose(e.target.files?.[0]);e.target.value=''}}/></label></div>
 <div className="pdf-settings"><label>해상도<select disabled={busy} value={scale} onChange={e=>setScale(e.target.value)}><option value="1">기본 · 72 DPI</option><option value="2">선명하게 · 144 DPI</option><option value="3">고해상도 · 216 DPI</option></select></label><label>JPG 품질 · {quality}%<input disabled={busy} type="range" min="50" max="100" value={quality} onChange={e=>setQuality(Number(e.target.value))}/></label><label>PDF 암호 (필요한 경우)<input type="password" autoComplete="off" disabled={busy} value={password} onChange={e=>setPassword(e.target.value)} placeholder="암호 입력"/></label></div>
 <div className="pdf-actions"><button className="convert" disabled={!file||busy} onClick={()=>void run()}>{busy?'변환 중…':'JPG로 변환하기'}</button>{busy&&<button className="select" onClick={()=>{token.current++;void job.current?.destroy();setBusy(false);setProgress('변환을 중단했습니다. 완료된 이미지는 저장할 수 있어요.')}}><X size={15}/>중단</button>}<button className="select" disabled={!pages.length||busy} onClick={async()=>{for(const p of pages){if(!alive.current)break;save(p);await new Promise(r=>setTimeout(r,600))}if(alive.current)setMessage('여러 파일 저장이 차단되면 자동 다운로드를 허용하거나 페이지별 저장 버튼을 사용해 주세요.')}}><Download size={16}/>전체 다운로드{pages.length?` (${pages.length})`:''}</button></div>
 <p className="copy-feedback" role="status">{progress}</p>{message&&<p className="pdf-message" role="alert">{message}</p>}</section>
 <div className="pdf-pages">{pages.map((p,i)=><article key={p.url}><img src={p.url} alt={`${i+1}페이지 미리보기`} loading="lazy"/><div><span>{i+1}페이지<small>{p.width} × {p.height} px · {(p.size/1024).toFixed(0)} KB</small></span><button className="select" onClick={()=>save(p)} aria-label={`${i+1}페이지 JPG 저장`}><Download size={16}/>저장</button></div></article>)}</div><p className="text-tool-note">처음 사용 시 PDF.js 변환기를 다운로드하므로 인터넷 연결이 필요합니다. 페이지를 순서대로 처리하며, 투명 배경은 흰색으로 저장합니다. 암호와 문서 내용은 서버에 전송하지 않습니다.</p></>;
}
