import { ɵdefaultCartesianTheme } from '@ng-echarts/chart-library/core';
import { buildRadarOptions, radarLayout } from './radar-options';
import { radarPoint } from './radar-point';
import { normalizeRadarData } from './radar-model';
const rows = [
  { id: 'a', category: '<Speed>', max: 100, current: 80, target: 90 },
  { id: 'b', category: 'Coverage', max: 100, current: 50, target: 80 },
  { id: 'c', category: 'Value', max: 100, current: 70, target: 85 },
];
const series = [
  { id: 'current', key: 'current', label: '<Current>' },
  { id: 'target', key: 'target', label: 'Target' },
] as const;
function options(data = rows, hiddenIds: ReadonlySet<string> = new Set()) {
  const model = normalizeRadarData(data, 'id', 'category', series, 'max');
  if (model.kind === 'error') throw new Error(model.message);
  return {
    ...buildRadarOptions(
      {
        model,
        hiddenIds,
        tokens: ɵdefaultCartesianTheme('light'),
        animation: false,
        format: (v) => `${v} pts`,
        categoryTicks: model.rows.map((r) => r.category),
      },
      model.maxima,
      true,
    ),
    necRowIds: model.rows.map((r) => r.id),
  };
}
it('keeps explicit scales while hiding comparisons, and never fills missing vertices with zero', () => {
  const complete = options();
  const hidden = options(rows, new Set(['current']));
  expect(hidden.radar).toEqual(complete.radar);
  expect(hidden.series).toHaveLength(1);
  expect(
    options(rows.map((r, i) => (i === 1 ? { ...r, current: null as unknown as number } : r)))
      .series,
  ).toHaveLength(1);
  expect(complete).toMatchObject({ animation: false });
});
it('escapes tooltip labels and formatter text, and preserves raw scales', () => {
  const option = options();
  const tooltip = option.tooltip as { formatter: (p: unknown) => string };
  expect(tooltip.formatter({ seriesId: 'current' })).toContain('&lt;Current&gt;');
  expect(tooltip.formatter({ seriesId: 'current' })).toContain('&lt;Speed&gt;');
  expect(tooltip.formatter({ seriesId: 'current' })).toContain('80 pts / 100 pts');
  expect(tooltip.formatter({ seriesId: 'stale' })).toBe('');
});
it('selects only a nearby unambiguous vertex using current stable identities', () => {
  const layout = radarLayout(400, 320);
  const option = options();
  const click = (x: number, y: number, seriesId = 'current') =>
    radarPoint({ seriesId, event: { offsetX: x, offsetY: y } }, option, layout);
  expect(click(200, 160 - layout.radius * 0.8)).toEqual({ rowId: 'a', seriesId: 'current' });
  expect(click(200, 160)).toBeNull();
  expect(click(200, 160 - layout.radius * 0.8, 'removed')).toBeNull();
  expect(radarPoint({}, option, layout)).toBeNull();
  const zero = options(rows.map((r) => ({ ...r, current: 0 })));
  expect(
    radarPoint({ seriesId: 'current', event: { offsetX: 200, offsetY: 160 } }, zero, layout),
  ).toBeNull();
});
