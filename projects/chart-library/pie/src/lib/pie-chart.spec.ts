import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PieChart } from './pie-chart';
it('provides a one-measure table, category legend identity and recoverable validation', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(
    PieChart<{ id: string; name: string; value: number | null }>,
  );
  const rows = [
    { id: 'a', name: 'Duplicate', value: 10 },
    { id: 'b', name: 'Duplicate', value: 0 },
    { id: 'c', name: 'Missing', value: null },
  ];
  for (const [key, value] of Object.entries({
    title: 'Pie',
    data: rows,
    rowIdKey: 'id',
    categoryKey: 'name',
    measure: { id: 'v', key: 'value', label: 'Value' },
  }))
    fixture.componentRef.setInput(key, value);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  const selected = vi.fn(),
    legend = vi.fn();
  fixture.componentInstance.pointSelect.subscribe(selected);
  fixture.componentInstance.legendChange.subscribe(legend);
  host.querySelector<HTMLButtonElement>('.table-toggle')!.click();
  await fixture.whenStable();
  expect(host.querySelectorAll('thead th')).toHaveLength(2);
  expect(host.querySelectorAll('tbody tr')).toHaveLength(3);
  host.querySelectorAll<HTMLButtonElement>('tbody button')[1]!.click();
  expect(selected).toHaveBeenCalledWith(
    expect.objectContaining({ rowId: 'b', seriesId: 'v', value: 0, source: 'table', row: rows[1] }),
  );
  expect(host.querySelector('tbody')?.textContent).toContain('Missing');
  host.querySelector<HTMLButtonElement>('.legend button')!.click();
  await fixture.whenStable();
  expect(legend).toHaveBeenCalledWith({ rowId: 'a', visible: false });
  expect(host.querySelector('[role=status]')?.textContent).toContain('No visible positive');
  fixture.componentRef.setInput('data', [...rows].reverse());
  await fixture.whenStable();
  expect(host.querySelectorAll('.legend button')[2]?.getAttribute('aria-pressed')).toBe('false');
  for (const [key, value, message] of [
    ['innerRadius', 1, 'Inner radius'],
    ['innerRadius', 0, ''],
    ['showLabels', 'bad', 'boolean'],
    ['showLabels', false, ''],
  ] as const) {
    fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    if (message) expect(host.querySelector('[role=alert]')?.textContent).toContain(message);
    else expect(host.querySelector('[role=alert]')).toBeNull();
  }
  fixture.componentRef.setInput('data', [{ id: 'a', name: 'A', value: 0 }]);
  await fixture.whenStable();
  expect(host.querySelector('[role=status]')?.textContent).toContain('No chart data');
  fixture.componentRef.setInput('data', rows);
  await fixture.whenStable();
  expect(host.querySelectorAll('.legend button')).toHaveLength(3);
});
