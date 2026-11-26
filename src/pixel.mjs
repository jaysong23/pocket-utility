import { parseAmount } from './measure.mjs';

export const MM_PER_INCH = 25.4;
export const MIN_DPI = 1;
export const MAX_DPI = 10000;

export const PIXEL_UNITS = [
  ['mm', '밀리미터'],
  ['cm', '센티미터'],
  ['in', '인치'],
  ['px', '픽셀']
];

export const DPI_PRESETS = [
  { dpi: 72, label: '일부 레거시/화면 기준' },
  { dpi: 96, label: 'CSS/웹 표준 기준' },
  { dpi: 150, label: '초안/배너 등' },
  { dpi: 300, label: '표준 인쇄 기준' },
  { dpi: 600, label: '고품질 인쇄 기준' }
];

export function parseDpi(text) {
  const value = parseAmount(String(text ?? ''));
  if (value === null || !Number.isFinite(value) || value < MIN_DPI || value > MAX_DPI) {
    throw Error('DPI는 1~10,000 사이의 숫자로 입력해 주세요.');
  }
  return value;
}

export function convertPixelUnit(value, from, to, dpi = 96) {
  if (!Number.isFinite(value)) throw Error('유효한 숫자를 입력해 주세요.');
  if (value < 0) throw Error('길이와 픽셀은 0 이상으로 입력해 주세요.');
  if (!Number.isFinite(dpi) || dpi < MIN_DPI || dpi > MAX_DPI) {
    throw Error('DPI는 1~10,000 사이의 숫자로 입력해 주세요.');
  }
  const valid = PIXEL_UNITS.some(u => u[0] === from) && PIXEL_UNITS.some(u => u[0] === to);
  if (!valid) throw Error('단위를 확인해 주세요.');
  if (from === to) return value;

  let inches;
  if (from === 'in') inches = value;
  else if (from === 'mm') inches = value / MM_PER_INCH;
  else if (from === 'cm') inches = (value * 10) / MM_PER_INCH;
  else inches = value / dpi;

  if (to === 'in') return inches;
  if (to === 'mm') return inches * MM_PER_INCH;
  if (to === 'cm') return (inches * MM_PER_INCH) / 10;
  return inches * dpi;
}

export function compareByDpi(value, from, to) {
  const target = from === 'px' ? (to === 'px' ? 'mm' : to) : 'px';
  return DPI_PRESETS.map(preset => {
    const converted = convertPixelUnit(value, from, target, preset.dpi);
    return {
      ...preset,
      unit: target,
      value: converted,
      rounded: target === 'px' ? Math.round(converted) : null
    };
  });
}

export function formatPixelResult(value, unit, loc = 'ko-KR') {
  if (!Number.isFinite(value)) return '—';
  const safe = Object.is(value, -0) ? 0 : value;
  const maxFrac = unit === 'px' ? 2 : 4;
  return new Intl.NumberFormat(loc, {
    minimumFractionDigits: unit === 'px' && !Number.isInteger(safe) ? 2 : 0,
    maximumFractionDigits: maxFrac
  }).format(safe);
}

export function formatInteger(value, loc = 'ko-KR') {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(Math.round(Object.is(value, -0) ? 0 : value));
}
