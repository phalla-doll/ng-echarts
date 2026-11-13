import { rangeIndex } from './bar-range-browser';
it('snaps category boundaries and clips pointer releases to the available rows', () => {
  expect([-200, 0, 99.9, 100, 299.9, 300, 999].map((x) => rangeIndex(x, 300, 3))).toEqual([
    0, 0, 0, 1, 2, 2, 2,
  ]);
  expect([-200, 0, 300, 999].map((x) => rangeIndex(x, 300, 1))).toEqual([0, 0, 0, 0]);
});
