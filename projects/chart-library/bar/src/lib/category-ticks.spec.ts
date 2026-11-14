import { formatCategoryTicks } from './category-ticks';
import type { CategoryTickFormatter } from '@mantha911/ng-echarts/core';

describe('category tick formatting', () => {
  it('preserves duplicate full labels by default and passes the original index to a pure formatter', () => {
    const categories = ['January', 'January', 'February'];
    expect(formatCategoryTicks(categories, undefined)).toEqual({ labels: categories, error: null });
    expect(
      formatCategoryTicks(categories, (label, index) => `${index}: ${label.slice(0, 3)}`),
    ).toEqual({
      labels: ['0: Jan', '1: Jan', '2: Feb'],
      error: null,
    });
    expect(categories).toEqual(['January', 'January', 'February']);
  });

  it('allows intentional empty ticks without replacing category labels', () => {
    expect(formatCategoryTicks(['January', 'February'], () => '')).toEqual({
      labels: ['', ''],
      error: null,
    });
  });

  it.each([
    42,
    () => 42,
    () => Promise.resolve('Jan'),
    () => {
      throw new Error('Private details');
    },
  ])('rejects invalid runtime formatters without leaking details (%s)', (formatter) => {
    expect(formatCategoryTicks(['January'], formatter as unknown as CategoryTickFormatter)).toEqual(
      {
        labels: [],
        error: 'Category tick formatting failed. Use a function that returns text.',
      },
    );
  });
});
