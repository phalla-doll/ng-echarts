import { dashboardRows, dashboardBreakdown } from './composed-dashboard';

it('requires complete windows for the supplied-order trend and preserves raw gaps/zero', () => {
  const data = [
    { id: 'a', month: 'A', desktop: 0, mobile: 0 },
    { id: 'b', month: 'B', desktop: 100, mobile: 40 },
    { id: 'c', month: 'C', desktop: null, mobile: 20 },
    { id: 'd', month: 'D', desktop: 60, mobile: 10 },
    { id: 'e', month: 'E', desktop: 40, mobile: 20 },
    { id: 'f', month: 'F', desktop: 30, mobile: 20 },
  ];
  const rows = dashboardRows(data);
  expect(rows.map((row) => row.trend)).toEqual([0, 70, null, null, null, 60]);
  expect(rows[2]?.desktop).toBeNull();
  expect(data[0]?.desktop).toBe(0);
  expect(dashboardRows([...data].reverse()).at(-1)?.trend).toBeNull();
});

it('reports partial device sums, preserving no-observation versus recorded zero', () => {
  expect(
    dashboardBreakdown([
      { id: 'a', month: 'A', desktop: null, mobile: 0 },
      { id: 'b', month: 'B', desktop: null, mobile: null },
    ]),
  ).toEqual([
    { id: 'desktop', device: 'Desktop', visits: null, missing: 2 },
    { id: 'mobile', device: 'Mobile', visits: 0, missing: 1 },
  ]);
  expect(dashboardBreakdown([]).every((row) => row.visits === null)).toBe(true);
});
