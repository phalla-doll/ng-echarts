import { categoryRange } from './category-range-types';

it('keeps stable supplied-order IDs for reverse drags, single categories, zero and missing observations', () => {
  const ids = ['apr', 'missing', 'zero', 'jan'];
  expect(categoryRange(ids, 2, 0)).toEqual({
    from: 'apr',
    to: 'zero',
    rowIds: ['apr', 'missing', 'zero'],
    source: 'pointer',
  });
  expect(categoryRange(ids, 1, 1)?.rowIds).toEqual(['missing']);
  expect(ids).toEqual(['apr', 'missing', 'zero', 'jan']);
});

it('rejects ambiguous identities and stale/out-of-range category indices', () => {
  for (const ids of [[], ['a', 'a'], ['a', '']]) expect(categoryRange(ids, 0, 0)).toBeNull();
  for (const [first, last] of [
    [-1, 0],
    [0, 2],
    [0.5, 1],
    [NaN, 0],
  ])
    expect(categoryRange(['a', 'b'], first!, last!)).toBeNull();
});
