import { t as tr, locale, getLanguage } from "./i18n.mjs";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, Upload, FileCode2 } from 'lucide-react';
import { createMarkdownConverter, htmlDocument, plainTextFromHTML, MAX_MARKDOWN } from './markdown.mjs';
const fence = String.fromCharCode(96).repeat(3);
const sampleText = () => tr('# 마크다운을 HTML로\n\n문서를 **간편하게** 작성하고 웹페이지로 저장하세요.\n\n## 할 일\n\n- [x] 마크다운 입력하기\n- [ ] HTML로 저장하기\n\n## 표\n\n| 도구 | 기능 |\n| --- | --- |\n| Pocket Utility | 일상 도구 모음 |\n| MD → HTML | 문서 변환 |\n\n> 표, 체크리스트, 인용문, 코드블록을 지원합니다.\n\n') + fence + 'javascript\nconst message = "Hello, Pocket Utility!";\nconsole.log(message);\n' + fence + tr('\n\n[링크 예시](https://example.com)\n');
export default function MarkdownConverter() {
  const [input, setInput] = useState(sampleText),
    [settled, setSettled] = useState(sampleText),
    [tab, setTab] = useState('preview'),
    [mode, setMode] = useState('document'),
    [title, setTitle] = useState(()=>tr('Markdown 문서')),
    [filename, setFilename] = useState('document'),
    [images, setImages] = useState(false),
    [status, setStatus] = useState(''),
    [fileError, setFileError] = useState('');
  const fileRead = useRef(0);
  useEffect(() => () => {
    fileRead.current++;
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setSettled(input), 180);
    return () => clearTimeout(t);
  }, [input]);
  const convert = useMemo(() => createMarkdownConverter(window), []);
  const result = useMemo(() => {
    try {
      return {
        body: convert(settled),
        error: ''
      };
    } catch (e) {
      return {
        body: '',
        error: (e as Error).message
      };
    }
  }, [convert, settled]);
  const {
    body,
    error
  } = result;
  const plain=useMemo(()=>plainTextFromHTML(body,window),[body]);
  const pending = input !== settled,
    output = mode === 'plain' ? plain : mode === 'document' ? htmlDocument(body, title,true,getLanguage()) : body;
  const preview = useMemo(() => htmlDocument(body, title, images,getLanguage()), [body, title, images,getLanguage()]);
  const change = (text: string) => {
    fileRead.current++;
    setInput(text);
    setStatus('');
    setFileError('');
  };
  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    const id = ++fileRead.current;
    setFileError('');
    if (!/\.(md|markdown|txt)$/i.test(file.name)) {
      setFileError('.md, .markdown, .txt 파일을 선택해 주세요.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setFileError('1MB 이하의 텍스트 파일을 선택해 주세요.');
      return;
    }
    try {
      const text = await file.text();
      if (id !== fileRead.current) return;
      if (text.length > MAX_MARKDOWN) {
        setFileError('20만 자 이하의 문서를 선택해 주세요.');
        return;
      }
      setInput(text);
      setFilename(file.name.replace(/\.[^.]+$/, ''));
      setTitle(file.name.replace(/\.[^.]+$/, ''));
      setStatus('파일을 불러왔어요.');
    } catch {
      if (id === fileRead.current) setFileError('파일을 읽지 못했습니다. UTF-8 텍스트 파일을 확인해 주세요.');
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([output], {
      type: mode==='plain'?'text/plain;charset=utf-8':'text/html;charset=utf-8'
    }));
    const a = document.createElement('a');
    a.href = url;
    a.download = (filename.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim() || 'document') + (mode==='plain'?'.txt':'.html');
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setStatus('HTML 파일을 저장했어요.');
  };
  return <><div className="tool-heading"><span className="eyebrow">MARKDOWN CONVERTER</span><h1>{tr("마크다운 변환")}</h1><p>{tr("마크다운을 HTML 또는 일반 텍스트로 변환하세요.")}</p></div>
 <div className="md-options"><label>{tr("출력 형식")}<select value={mode} onChange={e => {
          setMode(e.target.value);
          setStatus('');
        }}><option value="document">{tr("스타일 포함 완성형 HTML")}</option><option value="body">{tr("본문 HTML만")}</option><option value="plain">Plain Text (.txt)</option></select></label><label>{tr("문서 제목")}<input disabled={mode==='plain'} value={title} maxLength={160} onChange={e => {
          setTitle(e.target.value);
          setStatus('');
        }} /></label><label>{tr("파일 이름")}<input value={filename} maxLength={100} onChange={e => setFilename(e.target.value)} /><span>{mode==='plain'?'.txt':'.html'}</span></label></div>
 <div className="md-editor"><section className="md-pane"><div className="md-pane-head"><h2><FileCode2 size={17} />Markdown</h2><label className="md-upload"><Upload size={14} />{tr("파일 불러오기")}<input type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={e => {
              void loadFile(e.target.files?.[0]);
              e.target.value = '';
            }} /></label></div><textarea className="md-source" aria-label={tr("마크다운 입력")} spellCheck={false} value={input} onChange={e => change(e.target.value)} placeholder={tr("# 제목을 입력하세요")} maxLength={MAX_MARKDOWN} /><div className="md-input-footer"><span>{tr(input.length.toLocaleString())}{tr(" / 200,000자")}</span><button onClick={() => change('')}>{tr("비우기")}</button><button onClick={() => change(sampleText())}>{tr("예시")}</button></div></section>
 <section className="md-pane"><div className="md-pane-head"><div className="md-view-tabs" role="group" aria-label={tr("출력 보기")}><button aria-pressed={tab === 'preview'} className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>{tr("미리보기")}</button><button aria-pressed={tab === 'code'} className={tab === 'code' ? 'active' : ''} onClick={() => setTab('code')}>{tr(mode==='plain'?'일반 텍스트':'HTML 코드')}</button></div><span>{tr(pending ? '변환 중…' : mode==='plain'?'일반 텍스트':mode === 'body' ? '본문 HTML' : '완성형 HTML')}</span></div>{tr(tab === 'preview' && mode!=='plain' ? <iframe title={tr("마크다운 HTML 미리보기")} sandbox="" referrerPolicy="no-referrer" srcDoc={preview} className="md-preview" /> : <textarea className="md-source md-output" aria-label={tr(mode==='plain'?'일반 텍스트':'변환된 HTML 코드')} readOnly value={output} spellCheck={false} />)}<div className="md-input-footer"><label><input type="checkbox" disabled={mode==='plain'} checked={images} onChange={e => setImages(e.target.checked)} />{tr("미리보기 외부 이미지 허용")}</label></div></section></div>
 <div className="md-save"><button disabled={pending || !!error || !input.trim()} onClick={async () => {
        try {
          await navigator.clipboard.writeText(output);
          setStatus('복사했어요.');
        } catch {
          setTab('code');
          setStatus('자동 복사를 사용할 수 없어요. HTML 코드를 선택해 복사해 주세요.');
        }
      }}><Copy size={16} />{tr(mode==='plain'?'텍스트 복사':'HTML 복사')}</button><button className="md-primary" disabled={pending || !!error || !input.trim()} onClick={download}><Download size={16} />{tr(mode==='plain'?'.txt 다운로드':'.html 다운로드')}</button></div><p className="copy-feedback" role="status">{tr(status || '입력한 내용은 서버에 전송하거나 저장하지 않습니다.')}</p>{tr((error || fileError) && <p className="pdf-message" role="alert">{tr(error || fileError)}</p>)}
 <p className="text-tool-note">{mode==='plain'?tr("서식을 제거하고 문단·목록·표의 텍스트를 유지합니다. 링크는 주소를 함께 남기고 이미지는 대체 텍스트만 남깁니다."):tr("표·체크리스트·코드블록을 지원합니다. 본문 HTML은 스타일을 제외하고, 완성형 HTML은 문서 구조와 기본 스타일을 포함합니다. 스크립트·이벤트 속성·사용자 CSS는 제거됩니다. 미리보기의 외부 이미지는 기본 차단되며, 허용 시 이미지 서버에 요청합니다. 저장한 HTML의 이미지는 링크로 연결되어 별도 파일로 포함되지 않습니다.")}</p></>;
}
