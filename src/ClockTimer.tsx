import {notificationPermission,notificationsEnabled,saveNotificationPreference,sendBrowserNotification} from './notifications.mjs';
import {routeHref,siteBase} from './routing.mjs';
import { t as tr, locale, getLanguage } from "./i18n.mjs";
import { useEffect, useRef, useState, useId } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Maximize, Volume2, Bell, PictureInPicture2, X, SkipForward, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { duration, remaining, change, restore, display, previewDuration, MAX } from './timer.mjs';
import { nextPomodoro } from './clock-sync.mjs';
import useServerTime from './useServerTime';
const zones = [['Asia/Seoul', '서울 · 한국'], ['Asia/Tokyo', '도쿄 · 일본'], ['America/New_York', '뉴욕 · 미국'], ['America/Los_Angeles', 'LA · 미국'], ['Europe/London', '런던 · 영국'], ['UTC', 'UTC']];
const phaseNames = {
  focus: '집중',
  short: '짧은 휴식',
  long: '긴 휴식'
};
const defaults = {
  focus: 25,
  short: 5,
  long: 15
};
function useCountdown(key: string, initial: number, onDone: () => void) {
  const [state, setState] = useState(() => {
      try {
        const raw = sessionStorage.getItem(key);
        return raw ? restore(raw, Date.now(), initial) : change({}, {
          type: 'set',
          ms: initial
        }, Date.now());
      } catch {
        return change({}, {
          type: 'set',
          ms: initial
        }, Date.now());
      }
    }),
    [now, setNow] = useState(Date.now);
  const done = useRef(onDone);
  done.current = onDone;
  const prev = useRef(state.status);
  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      setState(v => change(v, {
        type: 'tick'
      }, t));
    };
    const id = setInterval(tick, 200);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {}
    if (state.status === 'done' && prev.current === 'running') done.current();
    prev.current = state.status;
  }, [state, key]);
  return {
    state,
    left: remaining(state, now),
    add: (ms: number) => {
      setNow(Date.now());
      setState(v => change(v, {
        type: 'add',
        ms
      }, Date.now()));
    },
    set: (ms: number) => setState(v => change(v, {
      type: 'set',
      ms
    }, Date.now())),
    act: (type: string) => {
      setNow(Date.now());
      setState(v => change(v, {
        type
      }, Date.now()));
    }
  };
}
function readPomo() {
  try {
    const d = JSON.parse(sessionStorage.getItem('pocket-pomo-info') || 'null');
    if (d && Object.keys(defaults).includes(d.phase) && Number.isInteger(d.completed) && d.completed >= 0 && Object.keys(defaults).every(k => Number.isInteger(d.settings?.[k]) && d.settings[k] >= 1 && d.settings[k] <= 180)) return d;
  } catch {}
  return {
    phase: 'focus',
    completed: 0,
    settings: defaults
  };
}
function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max,
  disabled = false
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max: number;
  disabled?: boolean;
}) {
  const id = useId(),
    n = Number(value);
  const step = (delta: number) => onChange(String(Math.min(max, Math.max(min, (Number.isFinite(n) ? n : min) + delta))));
  return <div className="number-stepper-field"><label htmlFor={id}>{tr(label)}</label><div className="number-stepper"><input id={id} type="number" inputMode="numeric" min={min} max={max} step="1" value={value} disabled={disabled} onChange={e => onChange(e.target.value)} /><div className="number-stepper-arrows"><button type="button" aria-label={tr(`${tr(label)} ${tr('늘리기')}`)} disabled={disabled || n >= max} onClick={() => step(1)}><ChevronUp size={14} /></button><button type="button" aria-label={tr(`${tr(label)} ${tr('줄이기')}`)} disabled={disabled || n <= min} onClick={() => step(-1)}><ChevronDown size={14} /></button></div></div></div>;
}
export default function ClockTimer({showHeading=true,mode='clock'}:{showHeading?:boolean,mode?:string}) {
  const tab=mode;
  const [source,setSource]=useState('timeapi'),[address,setAddress]=useState(''),[serverURL,setServerURL]=useState('');
  const [notifications,setNotifications]=useState(notificationsEnabled),[permission,setPermission]=useState(notificationPermission),[notificationStatus,setNotificationStatus]=useState('');
  const [zone, setZone] = useState('Asia/Seoul'),
    [hour12, setHour12] = useState(false),
    [h, H] = useState('0'),
    [m, M] = useState('5'),
    [s, S] = useState('0');
  const [info, setInfo] = useState(readPomo),
    [error, setError] = useState(''),
    [sound, setSound] = useState(true),
    [alarm, setAlarm] = useState('');
  const audio = useRef<AudioContext | null>(null),
    panel = useRef<HTMLElement>(null),
    [pip, setPip] = useState<Window | null>(null),
    [floating, setFloating] = useState(false),
    [miniTab, setMiniTab] = useState('clock');
  const server = useServerTime(source,serverURL);
  function toggleNotifications(enabled:boolean){setNotifications(enabled);saveNotificationPreference(enabled);setNotificationStatus('')}
  async function notify(message:string,test=false){
    try{await sendBrowserNotification(tr(message),{base:siteBase(),url:new URL(routeHref(tab==='pomodoro'?'pomodoro':'timer'),location.origin).href});if(test)setNotificationStatus('테스트 알림을 요청했습니다. 보이지 않으면 OS 알림 설정과 집중 모드를 확인해 주세요.')}
    catch(e){setError((e as Error).message)}
  }
  function finish(message:string){setAlarm(message);if(notifications)void notify(message)}
  async function enableNotifications(){
    if(typeof Notification==='undefined')return;
    setError('');
    try{const result=await Notification.requestPermission();setPermission(result);toggleNotifications(result==='granted');if(result==='granted')await notify('브라우저 알림이 켜졌습니다. 타이머가 끝나면 알려드릴게요.',true)}
    catch{setError('브라우저 알림을 표시할 수 없습니다.')}
  }
  useEffect(()=>{
    const refresh=()=>{setPermission(notificationPermission());setNotifications(notificationsEnabled())};
    const failed=()=>setError('브라우저 알림을 표시할 수 없습니다.');
    window.addEventListener('focus',refresh);window.addEventListener('storage',refresh);document.addEventListener('visibilitychange',refresh);window.addEventListener('pocket:notification-error',failed);
    return()=>{window.removeEventListener('focus',refresh);window.removeEventListener('storage',refresh);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('pocket:notification-error',failed)};
  },[]);
  const timer = useCountdown('pocket-timer', 300000, () => finish('타이머가 종료되었습니다.'));
  const pomo = useCountdown('pocket-pomodoro', 1500000, () => finish(`뽀모도로 ${phaseNames[info.phase]} 시간이 끝났습니다. 다음 단계를 시작해 주세요.`));
  const Heading=showHeading?'h1':'h2';
  const draft = previewDuration(h, m, s);
  const shownTimerLeft = timer.state.status === 'idle' ? draft ?? 0 : timer.left;
  const active = tab === 'pomodoro' ? pomo : timer;
  const shownLeft = tab === 'pomodoro' ? pomo.left : shownTimerLeft;
  const shownTotal = tab === 'timer' && timer.state.status === 'idle' ? Math.max(1, draft ?? 0) : active.state.total;
  useEffect(() => {
    try {
      sessionStorage.setItem('pocket-pomo-info', JSON.stringify(info));
    } catch {}
  }, [info]);
  const prepare = async () => {
    try {
      const Audio = window.AudioContext || (window as any).webkitAudioContext;
      if (!Audio) throw Error();
      if (!audio.current) audio.current = new Audio();
      await audio.current.resume();
      return true;
    } catch {
      setError('알림 소리를 사용할 수 없습니다. 브라우저 소리 설정을 확인해 주세요.');
      return false;
    }
  };
  const beep = () => {
    const ctx = audio.current;
    if (!ctx || ctx.state !== 'running') return;
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator(),
        g = ctx.createGain(),
        at = ctx.currentTime + i * .25;
      o.frequency.value = 880;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(.15, at + .015);
      g.gain.exponentialRampToValueAtTime(.001, at + .17);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(at);
      o.stop(at + .18);
      o.onended = () => {
        o.disconnect();
        g.disconnect();
      };
    }
  };
  useEffect(() => {
    if (!alarm || !sound) return;
    beep();
    const interval = setInterval(beep, 1200),
      end = setTimeout(() => clearInterval(interval), 30000);
    return () => {
      clearInterval(interval);
      clearTimeout(end);
    };
  }, [alarm, sound]);
  useEffect(() => () => {
    void audio.current?.close();
  }, []);
  useEffect(() => {
    const n = timer.state.total / 1000;
    H(String(Math.floor(n / 3600)));
    M(String(Math.floor(n / 60) % 60));
    S(String(n % 60));
  }, [timer.state.total]);
  const start = (which: string) => {
    setError('');
    setAlarm('');
    if (sound) void prepare();
    if (which === 'pomodoro') {
      pomo.act('start');
      return;
    }
    try {
      if (timer.state.status === 'idle') {
        const ms = duration(h, m, s);
        timer.set(ms);
      }
      timer.act('start');
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const reset = (which: string) => {
    setAlarm('');
    if (which === 'pomodoro') {
      setInfo(v => ({
        ...v,
        phase: 'focus',
        completed: 0
      }));
      pomo.set(info.settings.focus * 60000);
    } else {
      timer.act('reset');
      const n = timer.state.total / 1000;
      H(String(Math.floor(n / 3600)));
      M(String(Math.floor(n / 60) % 60));
      S(String(n % 60));
    }
  };
  const next = () => {
    const n = nextPomodoro(info.phase, info.completed, info.settings);
    setInfo(v => ({
      ...v,
      phase: n.phase,
      completed: n.completed
    }));
    pomo.set(n.ms);
    pomo.act('start');
    setAlarm('');
    if (sound) void prepare();
  };
  const skip = () => {
    const phase = info.phase === 'focus' ? 'short' : 'focus';
    setInfo(v => ({
      ...v,
      phase
    }));
    pomo.set(info.settings[phase] * 60000);
    setAlarm('');
  };
  const clock = new Intl.DateTimeFormat(locale(), {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12
  }).format(server.now);
  const syncLabel = server.status === 'synced' ? (source==='timeapi'?'TimeAPI.io 서버 동기화':source==='naver'?'네이버 서버 동기화':'입력한 서버 동기화') : server.status === 'syncing' ? '서버 시각 동기화 중…' : server.status === 'stale' ? '재동기화 실패 · 마지막 서버 시각으로 진행' : '동기화 실패 · 임시 기기 시각';
  const closeMini = () => {
    pip?.close();
    setPip(null);
    setFloating(false);
  };
  const openMini = async () => {
    setMiniTab(tab);
    if (pip && !pip.closed) {
      pip.focus();
      return;
    }
    const api = (window as any).documentPictureInPicture;
    if (!api) {
      setFloating(true);
      return;
    }
    try {
      const w = await api.requestWindow({
        width: 280,
        height: 190,
        preferInitialWindowPlacement: true
      });
      w.document.title = tr('MY POCKET UTILITY · 미니 시계');
      for (const el of document.querySelectorAll('style,link[rel="stylesheet"]')) {
        const clone = el.cloneNode(true) as HTMLElement;
        if (el instanceof HTMLLinkElement) (clone as HTMLLinkElement).href = el.href;
        w.document.head.appendChild(clone);
      }
      w.document.documentElement.dataset.theme = document.documentElement.dataset.theme;
      w.document.body.className = 'pip-body';
      w.addEventListener('pagehide', () => setPip(null), {
        once: true
      });
      setFloating(false);
      setPip(w);
    } catch {
      setFloating(true);
      setError('PIP를 열지 못해 페이지 안의 미니 창으로 표시합니다.');
    }
  };
  useEffect(() => {
    if (!pip) return;
    const o = new MutationObserver(() => {
      pip.document.documentElement.dataset.theme = document.documentElement.dataset.theme;
    });
    o.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    return () => {
      o.disconnect();
      if (!pip.closed) pip.close();
    };
  }, [pip]);
  const controls = (which: string, small = false) => {
    const t = which === 'pomodoro' ? pomo : timer;
    return <div className="timer-actions">{tr(t.state.status === 'running' ? <button className="timer-primary" onClick={() => t.act('pause')}><Pause size={16} />{tr("일시정지")}</button> : which === 'pomodoro' && t.state.status === 'done' ? <button className="timer-primary" onClick={next}><Play size={16} />{tr("다음 단계")}</button> : <button className="timer-primary" onClick={() => start(which)}><Play size={16} />{tr(t.state.status === 'paused' ? '계속' : '시작')}</button>)}<button onClick={() => reset(which)} aria-label={tr("초기화")}><RotateCcw size={16} />{tr(!small && '초기화')}</button></div>;
  };
  const extraTime = (compact = false) => ['running', 'paused'].includes(timer.state.status) ? <div className={'timer-extend ' + (compact ? 'timer-extend-mini' : '')} role="group" aria-label={tr("타이머 시간 추가")}>{tr(!compact && <span>{tr("시간 추가")}</span>)}{tr([[30000, '+30초'], [60000, '+1분'], [300000, '+5분']].map(([ms, label]) => <button key={ms} disabled={timer.state.total + Number(ms) > MAX} onClick={() => {
      timer.add(Number(ms));
      setAlarm('');
      setError('');
    }}>{tr(label)}</button>))}</div> : null;
  const mini = pip || floating ? <div className={'clock-mini ' + (floating ? 'clock-floating' : '')}><div className="mini-toolbar"><select aria-label={tr("미니 창 도구 선택")} value={miniTab} onChange={e => setMiniTab(e.target.value)}><option value="clock">{tr("현재 시각")}</option><option value="timer">{tr("타이머")}</option><option value="pomodoro">{tr("뽀모도로")}</option></select><button aria-label={tr("미니 창 닫기")} onClick={closeMini}><X size={18} /></button></div><p>{tr(miniTab === 'clock' ? syncLabel : miniTab === 'pomodoro' ? `${phaseNames[info.phase]} · 집중 ${info.completed}회 완료` : timer.state.status === 'running' ? '진행 중' : '타이머')}</p><strong>{tr(miniTab === 'clock' ? clock : display(miniTab === 'pomodoro' ? pomo.left : shownTimerLeft))}</strong>{tr(miniTab !== 'clock' && controls(miniTab, true))}{tr(miniTab === 'timer' && extraTime(true))}{tr(alarm && <button className="mini-alarm" onClick={() => setAlarm('')}>{tr("종료 알림 끄기")}</button>)}{tr(floating && <small>{tr("페이지 안의 미니 창 · 다른 앱 위 표시 불가")}</small>)}</div> : null;
  return <><div className="tool-heading"><span className="eyebrow">{tab.toUpperCase()}</span><Heading>{tr(tab==='clock'?'현재 시각':tab==='timer'?'타이머':'뽀모도로')}</Heading><p>{tr(tab==='clock'?'수강 신청, 피켓팅을 위한 정확한 시간 네이버 시간 및 정보 제공.':tab==='timer'?'시간을 설정하고 종료 알림을 받으세요.':'집중과 휴식을 나누어 나만의 리듬을 만드세요.')}</p></div><section className="clock-workspace" ref={panel}><div className="clock-toolbar"><div className="symbol-tabs">{tr([['clock', '현재 시각'], ['timer', '타이머'], ['pomodoro', '뽀모도로']].map(([id, label]) => <a key={id} href={routeHref(id)} className={tab === id ? 'active' : ''} aria-current={tab===id?'page':undefined}>{tr(label)}</a>))}</div><div className="clock-window-actions"><button className="select" onClick={() => void openMini()}><PictureInPicture2 size={16} />{tr("PIP / 미니 창")}</button><button className="select" onClick={async () => {
            try {
              if (document.fullscreenElement) await document.exitFullscreen();else if (panel.current?.requestFullscreen) await panel.current.requestFullscreen();else setError('전체화면을 지원하지 않는 브라우저입니다.');
            } catch {
              setError('전체화면 전환에 실패했습니다.');
            }
          }}><Maximize size={16} />{tr("전체화면")}</button></div></div>
 {tr(tab === 'clock' ? <div className="clock-view"><div className="clock-options"><label>{tr('서버 동기화')}<select value={source} onChange={e=>setSource(e.target.value)}><option value="timeapi">TimeAPI.io</option><option value="naver">{tr('네이버 API')}</option><option value="custom">{tr('서버 주소 입력')}</option></select></label><label>{tr("기준 도시")}<select value={zone} onChange={e => setZone(e.target.value)}>{tr(zones.map(([v, n]) => <option key={v} value={v}>{tr(n)}</option>))}</select></label><label><input type="checkbox" checked={hour12} onChange={e => setHour12(e.target.checked)} />{tr("12시간 표시")}</label></div>{source==='custom'&&<form className="url-form" onSubmit={e=>{e.preventDefault();setServerURL(address)}}><input type="url" required value={address} aria-label={tr('서버 주소')} placeholder="https://example.com/" onChange={e=>setAddress(e.target.value)}/><button>{tr('서버 시간 조회')}</button></form>}{source!=='timeapi'&&<p className="clock-caption">{tr(source==='naver'?'네이버 서버의 HTTP Date 기준 · 초 단위 정밀도이며 네트워크 오차가 있을 수 있습니다.':'HTTP Date 헤더 기준 · 초 단위 정밀도. 외부 접근과 Date 헤더 공개를 허용한 서버만 조회할 수 있습니다.')}</p>}{server.error&&<p role="alert">{tr(server.error)}</p>}<p className="clock-caption">{tr(new Intl.DateTimeFormat(locale(), {
            timeZone: zone,
            dateStyle: 'full'
          }).format(server.now))}</p><div className="clock-digits">{tr(clock)}</div><div className="clock-sync"><span role="status">{tr(syncLabel)}</span><button disabled={server.status === 'syncing'} onClick={() => void server.sync()}><RefreshCw size={14} />{tr("재동기화")}</button></div><p className="clock-caption">{tr(server.status === 'synced' ? `왕복 응답 ${server.rtt}ms · 5분마다 동기화 · 네트워크 지연에 따른 오차 가능` : '서버 연결 상태를 확인해 주세요.')}</p></div> : <div className="timer-view"><p className="clock-caption">{tr(tab === 'pomodoro' ? `${phaseNames[info.phase]} · 집중 ${info.completed}회 완료` : '남은 시간')}</p><div className={'clock-digits ' + (active.state.status === 'done' ? 'timer-done' : '')} role="timer">{tr(display(shownLeft))}</div><progress className="timer-progress" max={shownTotal} value={shownLeft} aria-label={tr("남은 시간")} />
 {tr(tab === 'timer' ? <><div className="timer-fields">{tr([['시간', h, H, 99], ['분', m, M, 59], ['초', s, S, 59]].map(([label, value, set, max]: any) => <NumberStepper key={label} label={label} value={value} max={max} disabled={timer.state.status !== 'idle'} onChange={set} />))}</div><div className="timer-presets">{tr([1, 3, 5, 10, 15, 25, 30, 60].map(n => <button disabled={timer.state.status === 'running'} key={n} onClick={() => {
              timer.set(n * 60000);
              setAlarm('');
            }}>{tr(n)}{tr("분")}</button>))}</div></> : <><div className="pomo-settings">{tr(Object.entries(phaseNames).map(([key, label]) => <NumberStepper key={key} label={tr(label) + tr(' (분)')} min={1} max={180} value={info.settings[key]} disabled={pomo.state.status !== 'idle'} onChange={value => {
              const n = Number(value);
              if (!Number.isInteger(n) || n < 1 || n > 180) return;
              setInfo(v => ({
                ...v,
                settings: {
                  ...v.settings,
                  [key]: n
                }
              }));
              if (key === info.phase) pomo.set(n * 60000);
            }} />))}</div><p className="clock-caption">{tr("집중 → 짧은 휴식 · 집중 4회마다 긴 휴식")}</p><button className="pomo-skip" onClick={skip}><SkipForward size={15} />{tr("이 단계 건너뛰기")}</button></>)}
 {tr(controls(tab))}{tr(tab === 'timer' && extraTime())}<div className="timer-sound"><label><input type="checkbox" checked={sound} onChange={e => {
              setSound(e.target.checked);
              if (e.target.checked) void prepare();
            }} />{tr("종료 알림 소리")}</label><button onClick={async () => {
            if (await prepare()) beep();
          }}><Volume2 size={15} />{tr("소리 테스트")}</button><button disabled={permission==='unsupported'||permission==='denied'} onClick={()=>notifications?toggleNotifications(false):void enableNotifications()}><Bell size={15}/>{tr(notifications?'브라우저 알림 끄기':'브라우저 알림 켜기')}</button><button disabled={!notifications||permission!=='granted'} onClick={()=>{setError('');void notify('브라우저 알림 테스트입니다.',true)}}>{tr('알림 테스트')}</button><span role="status">{tr(permission==='denied'?'알림이 차단되어 있습니다. 브라우저 사이트 설정에서 허용해 주세요.':permission==='unsupported'?'이 브라우저는 알림을 지원하지 않습니다.':notifications?notificationStatus||'브라우저 알림 사용 중':'')}</span></div></div>)}
 {tr(alarm && <div className="timer-alert" role="status"><Bell size={18} /><span>{tr(alarm)}</span><button onClick={() => setAlarm('')}>{tr("알림 끄기")}</button></div>)}{tr(error && <p className="pdf-message" role="alert">{tr(error)}</p>)}</section><p className="text-tool-note">{tr("시각 출처: ")}<a href={source==='timeapi'?'https://timeapi.io/':source==='naver'?'https://api.searchad.naver.com/':serverURL.startsWith('https://')?serverURL:undefined} target="_blank" rel="noreferrer">{source==='timeapi'?'TimeAPI.io':source==='naver'?'Naver':serverURL}</a>{tr(". 국가 표준시 인증 서비스는 아니며, 통신 지연을 보정한 참고 시각입니다. 뽀모도로는 단계 종료 후 ‘다음 단계’를 누르면 이어집니다. PIP 미지원 브라우저는 페이지 안에 미니 창을 표시합니다. 타이머·뽀모도로는 같은 탭에서 새로고침해도 이어지지만, 탭 종료·기기 절전 중에는 알림이 울리지 않을 수 있습니다.")}</p>{tr(mini && createPortal(mini, pip?.document.body || document.body))}</>;
}
