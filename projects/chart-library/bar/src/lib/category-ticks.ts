import type { CategoryTickFormatter } from '@ng-echarts/chart-library/core';

/** Evaluate consumer code before rendering, never from an ECharts callback. */
export function formatCategoryTicks(
  categories: readonly string[],
  formatter: CategoryTickFormatter | undefined,
): { readonly labels: readonly string[]; readonly error: string | null } {
  try {
    if (formatter !== undefined && typeof formatter !== 'function') throw new TypeError();
    const labels = categories.map((category, index) => {
      const label = formatter ? formatter(category, index) : category;
      if (typeof label !== 'string') throw new TypeError();
      return label;
    });
    return { labels, error: null };
  } catch {
    return {
      labels: [],
      error: 'Category tick formatting failed. Use a function that returns text.',
    };
  }
}
