import { useEffect, useState } from 'react';
import { ArrowLeftRight, Copy } from 'lucide-react';
import { t as tr, locale } from './i18n.mjs';
import { parseAmount } from './measure.mjs';
import { PIXEL_UNITS, DPI_PRESETS, parseDpi, convertPixelUnit, compareByDpi, formatPixelResult, formatInteger } from './pixel.mjs';

export default function PixelConverter() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('mm');
  const [to, setTo] = useState('px');
  const [dpiInput, setDpiInput] = useState('96');
  const [status, setStatus] = useState('');

  const loc = locale();
  let parsedAmount: number | null = null;
  let parsedDpi: number | null = null;
  let value: number | null = null;
  let error = '';

  try {
    parsedAmount = parseAmount(amount);
    if (parsedAmount !== null && parsedAmount < 0) {
      throw Error('길이와 픽셀은 0 이상으로 입력해 주세요.');
    }
    parsedDpi = parseDpi(dpiInput);
    if (parsedAmount !== null) {
      value = convertPixelUnit(parsedAmount, from, to, parsedDpi);
    }
  } catch (e) {
    error = (e as Error).message;
  }

  useEffect(() => setStatus(''), [value, to, dpiInput]);

  const rows = parsedAmount !== null && parsedAmount >= 0 ? compareByDpi(parsedAmount, from, to) : [];
  const activePreset = parsedDpi !== null ? DPI_PRESETS.find(p => p.dpi === parsedDpi) : null;
  const formattedMain = value === null ? '—' : formatPixelResult(value, to, loc);
  const roundedPx = value !== null && to === 'px' ? formatInteger(value, loc) : null;

  return (
    <>
      <div className="tool-heading">
        <span className="eyebrow">PIXEL / MM CONVERTER</span>
        <h1>{tr('픽셀·mm 변환')}</h1>
        <p>{tr('mm·cm·인치와 픽셀(px)을 DPI 해상도 기준으로 계산하고 품질별 결과를 비교하세요.')}</p>
      </div>

      <section className="calc-workspace">
        <label className="calc-amount">
          {tr('변환할 값')}
          <input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder={tr('숫자 입력')} />
        </label>

        <div className="calc-pair">
          <label>
            FROM
            <select value={from} onChange={e => setFrom(e.target.value)}>
              {PIXEL_UNITS.map(([code, name]) => (
                <option key={code} value={code}>{tr(name)} ({code})</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="calc-swap"
            aria-label={tr('단위 서로 바꾸기')}
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          >
            <ArrowLeftRight size={20} />
          </button>
          <label>
            TO
            <select value={to} onChange={e => setTo(e.target.value)}>
              {PIXEL_UNITS.map(([code, name]) => (
                <option key={code} value={code}>{tr(name)} ({code})</option>
              ))}
            </select>
          </label>
        </div>

        <div className="dpi-controls">
          <div className="dpi-head">
            <span>{tr('해상도 (DPI / PPI)')}</span>
            <label className="dpi-custom">
              <span>{tr('직접 입력')}</span>
              <input
                inputMode="decimal"
                aria-label={tr('DPI 직접 입력')}
                value={dpiInput}
                onChange={e => setDpiInput(e.target.value)}
              />
              <em>DPI</em>
            </label>
          </div>
          <div className="dpi-presets" role="group" aria-label={tr('해상도 프리셋')}>
            {DPI_PRESETS.map(p => (
              <button
                type="button"
                key={p.dpi}
                aria-pressed={parsedDpi === p.dpi}
                className={parsedDpi === p.dpi ? 'active' : ''}
                onClick={() => setDpiInput(String(p.dpi))}
              >
                <b>{p.dpi} DPI</b>
                <small>{tr(p.label)}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="calc-result" aria-live="polite">
          {error ? (
            <p role="alert">{tr(error)}</p>
          ) : (
            <>
              <span>
                {tr('변환 결과')}
                {parsedDpi !== null ? ` · ${parsedDpi} DPI${activePreset ? ` (${tr(activePreset.label)})` : ''}` : ''}
              </span>
              <strong>
                {formattedMain} <small>{to}</small>
                {roundedPx !== null && <em className="px-rounded">({roundedPx}px)</em>}
              </strong>
              <button
                type="button"
                disabled={value === null || !Number.isFinite(value)}
                onClick={async () => {
                  try {
                    const copyText = to === 'px' && value !== null ? `${Math.round(value)}px` : `${formattedMain} ${to}`;
                    await navigator.clipboard.writeText(copyText);
                    setStatus('복사했어요.');
                  } catch {
                    setStatus('결과를 직접 선택해 복사해 주세요.');
                  }
                }}
              >
                <Copy size={15} />{tr(' 결과 복사')}
              </button>
              <small role="status">{tr(status)}</small>
            </>
          )}
        </div>

        {rows.length > 0 && (
          <div className="dpi-compare">
            <h2>{tr('품질(DPI)별 변환 비교')}</h2>
            <p>{tr('항목을 누르면 해당 DPI로 기준 해상도가 바뀝니다.')}</p>
            <div className="dpi-list">
              {rows.map(row => (
                <button
                  type="button"
                  key={row.dpi}
                  className={`dpi-row${parsedDpi === row.dpi ? ' active' : ''}`}
                  aria-pressed={parsedDpi === row.dpi}
                  onClick={() => setDpiInput(String(row.dpi))}
                >
                  <span className="dpi-meta">
                    <b>{row.dpi} DPI</b>
                    <small>{tr(row.label)}</small>
                  </span>
                  <span className="dpi-val">
                    <strong>{formatPixelResult(row.value, row.unit, loc)} {row.unit}</strong>
                    {row.rounded !== null && <small>({formatInteger(row.rounded, loc)}px)</small>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <p className="text-tool-note">
        {tr('1 inch = 25.4 mm 기준입니다. px = mm ÷ 25.4 × DPI 공식으로 기기 안에서 계산합니다. 실제 인쇄·배너 제작 시에는 업체의 권장 DPI와 재단 여백을 함께 확인해 주세요.')}
      </p>
    </>
  );
}
