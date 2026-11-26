import test from 'node:test';
import assert from 'node:assert/strict';
import { convertPixelUnit, compareByDpi, parseDpi, formatPixelResult, formatInteger } from '../src/pixel.mjs';

test('100 mm converts to expected pixel values across standard DPI presets', () => {
  const rows = compareByDpi(100, 'mm', 'px');
  assert.deepEqual(rows.map(r => r.dpi), [72, 96, 150, 300, 600]);
  const expected = [
    [72, '283.46', 283],
    [96, '377.95', 378],
    [150, '590.55', 591],
    [300, '1,181.10', 1181],
    [600, '2,362.20', 2362]
  ];
  for (let i = 0; i < expected.length; i++) {
    assert.equal(rows[i].dpi, expected[i][0]);
    assert.equal(rows[i].unit, 'px');
    assert.equal(formatPixelResult(rows[i].value, 'px', 'en-US'), expected[i][1]);
    assert.equal(rows[i].rounded, expected[i][2]);
  }
});

test('pixel to mm, cm and inch round trips accurately', () => {
  assert.ok(Math.abs(convertPixelUnit(300, 'px', 'in', 300) - 1) < 1e-12);
  assert.ok(Math.abs(convertPixelUnit(300, 'px', 'mm', 300) - 25.4) < 1e-12);
  assert.ok(Math.abs(convertPixelUnit(300, 'px', 'cm', 300) - 2.54) < 1e-12);
  const back = convertPixelUnit(convertPixelUnit(210, 'mm', 'px', 300), 'px', 'mm', 300);
  assert.ok(Math.abs(back - 210) < 1e-9);
  const pxToMm = compareByDpi(1181.1023622, 'px', 'mm');
  assert.equal(pxToMm[3].dpi, 300);
  assert.equal(pxToMm[3].unit, 'mm');
  assert.ok(Math.abs(pxToMm[3].value - 100) < 1e-4);
});

test('validates negative inputs, invalid units and out-of-range DPI', () => {
  assert.throws(() => convertPixelUnit(-1, 'mm', 'px', 96));
  assert.throws(() => convertPixelUnit(10, 'mm', 'px', 0));
  assert.throws(() => convertPixelUnit(10, 'mm', 'px', 20000));
  assert.throws(() => convertPixelUnit(10, 'bad', 'px', 96));
  assert.equal(parseDpi('300'), 300);
  assert.throws(() => parseDpi('0'));
  assert.throws(() => parseDpi(''));
  assert.throws(() => parseDpi('abc'));
  assert.equal(formatInteger(1181.1, 'en-US'), '1,181');
});
