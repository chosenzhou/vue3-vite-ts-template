import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePair } from '../../scripts/visual-qa-contract.mjs';

function fixture() {
  return {
    errors: [],
    rects: {
      title: {
        x: 16,
        y: 20,
        width: 119,
        height: 25.5,
        lineHeight: '25.5px',
        fontSize: '17px',
      },
    },
  };
}

test('a matching title passes, including subpixel layout noise', () => {
  const actual = fixture();
  actual.rects.title.x += 0.5;
  assert.deepEqual(validatePair(fixture(), actual), []);
});
test('runtime errors fail even when geometry matches', () => {
  const actual = fixture();
  actual.errors.push('Rendering failed');
  assert.match(validatePair(fixture(), actual).join('\n'), /Rendering failed/);
});
test('a missing element fails instead of silently skipping a comparison', () => {
  const actual = fixture();
  actual.rects.title = null;
  assert.match(validatePair(fixture(), actual).join('\n'), /missing/);
});
test('the previous Quasar heading line-height regression fails', () => {
  const actual = fixture();
  actual.rects.title.lineHeight = '60px';
  assert.match(validatePair(fixture(), actual).join('\n'), /lineHeight/);
});
test('layout differences over the threshold fail', () => {
  const actual = fixture();
  actual.rects.title.y += 2;
  assert.match(validatePair(fixture(), actual).join('\n'), /title.y/);
});
test('the approved period alignment is checked independently of the left-aligned export', () => {
  const actual = fixture();
  actual.periodLabels = [
    { text: '今日', dx: 24, dy: 0 },
  ];
  assert.match(validatePair(fixture(), actual).join('\n'), /not centered/);
});
test('horizontal overflow fails', () => {
  const actual = fixture();
  actual.overflow = true;
  assert.match(validatePair(fixture(), actual).join('\n'), /overflow/);
});

test('inconsistent scroll positions fail instead of producing a misleading pixel percentage', () => {
  const actual = fixture();
  actual.scrollPositions = [
    { element: 'page-body', x: 0, y: 120 },
  ];
  assert.match(validatePair(fixture(), actual).join('\n'), /not normalized/);
});

test('removing a period button fails', () => {
  const reference = fixture();
  reference.periodLabels = [
    { text: '今日', dx: 0, dy: 0 },
  ];
  assert.match(validatePair(reference, fixture()).join('\n'), /missing period button/);
});

test('QAvatar line-box differences are permitted without weakening heading typography', () => {
  const reference = fixture();
  const actual = fixture();
  reference.rects.avatar = { ...reference.rects.title, lineHeight: '30px' };
  actual.rects.avatar = { ...actual.rects.title, lineHeight: '10px' };
  assert.deepEqual(validatePair(reference, actual), []);
  actual.rects.title.lineHeight = '60px';
  assert.match(validatePair(reference, actual).join('\n'), /title.lineHeight/);
});
