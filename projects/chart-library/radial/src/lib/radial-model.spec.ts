import { normalizeRadialProgress } from './radial-model';
it('keeps zero and completion ready, null empty, and negative zero canonical', () => {
  expect(normalizeRadialProgress(0, 100)).toEqual({ kind: 'ready', value: 0, max: 100, ratio: 0 });
  expect(normalizeRadialProgress(-0, 100)).toEqual({ kind: 'ready', value: 0, max: 100, ratio: 0 });
  expect(normalizeRadialProgress(12, 12)).toMatchObject({ kind: 'ready', ratio: 1 });
  expect(normalizeRadialProgress(null, 100)).toEqual({ kind: 'empty' });
  expect(normalizeRadialProgress(3, 12)).toMatchObject({ kind: 'ready', ratio: 0.25 });
});
it.each([0, -1, NaN, Infinity, -Infinity])(
  'rejects an invalid maximum %s even with a missing value',
  (max) => {
    expect(normalizeRadialProgress(0, max).kind).toBe('error');
    expect(normalizeRadialProgress(null, max).kind).toBe('error');
  },
);
it.each([-1, 101, NaN, Infinity, -Infinity, undefined, '50'])(
  'rejects an invalid value %s without clamping',
  (value) => {
    expect(normalizeRadialProgress(value as number, 100).kind).toBe('error');
  },
);
it('accepts fractional and extreme finite ranges', () => {
  expect(normalizeRadialProgress(0.125, 0.5)).toMatchObject({ kind: 'ready', ratio: 0.25 });
  expect(normalizeRadialProgress(Number.MAX_VALUE / 2, Number.MAX_VALUE)).toMatchObject({
    kind: 'ready',
    ratio: 0.5,
  });
  expect(normalizeRadialProgress(Number.MIN_VALUE, Number.MIN_VALUE)).toMatchObject({
    kind: 'ready',
    ratio: 1,
  });
});
