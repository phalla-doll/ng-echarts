import {
  dashboardRows,
  dashboardBreakdown,
  dashboardWindowRows,
  reconcileDashboardWindow,
  moveDashboardWindow,
} from './composed-dashboard';

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

it('clamps zoom/pan and reconciles stable window endpoints through reordering/removal', () => {
  const rows = ['jan', 'feb', 'mar', 'apr', 'may'].map((id) => ({
    id,
    month: id,
    desktop: 1,
    mobile: 2,
  }));
  const window = moveDashboardWindow(rows, null, 'in', 'mar');
  expect(window).toEqual({ from: 'feb', to: 'apr' });
  expect(dashboardWindowRows(rows, window).map((row) => row.id)).toEqual(['feb', 'mar', 'apr']);
  const last = moveDashboardWindow(rows, window, 'next');
  expect(last).toEqual({ from: 'mar', to: 'may' });
  expect(moveDashboardWindow(rows, last, 'next')).toEqual(last);
  expect(moveDashboardWindow(rows, last, 'out')).toBeNull();
  expect(reconcileDashboardWindow(rows, { from: 'jan', to: 'may' })).toBeNull();
  expect(reconcileDashboardWindow([...rows].reverse(), window)).toEqual({ from: 'apr', to: 'feb' });
  expect(
    reconcileDashboardWindow(
      rows.filter((row) => row.id !== 'feb'),
      window,
    ),
  ).toBeNull();
  expect(dashboardWindowRows([], window)).toEqual([]);
  expect(moveDashboardWindow([], null, 'in')).toBeNull();
  expect(moveDashboardWindow(rows.slice(0, 1), null, 'in')).toBeNull();
});

it('keeps full-history trend context when the shared category window changes', () => {
  const rows = ['jan', 'feb', 'mar', 'apr'].map((id, index) => ({
    id,
    month: id,
    desktop: (index + 1) * 10,
    mobile: 0,
  }));
  expect(
    dashboardWindowRows(dashboardRows(rows), { from: 'mar', to: 'apr' }).map((row) => row.trend),
  ).toEqual([20, 30]);
});
