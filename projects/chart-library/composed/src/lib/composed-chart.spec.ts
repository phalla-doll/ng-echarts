import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComposedChart } from './composed-chart';
it('retains native raw actions and recovers from invalid kind/settings across loading', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(
    ComposedChart<{ id: string; category: string; visits: number; trend: number | null }>,
  );
  const row = { id: 'a', category: 'A', visits: 0, trend: null };
  const series = [
    { id: 'v', key: 'visits', label: 'Visits', kind: 'bar' },
    { id: 't', key: 'trend', label: 'Trend', kind: 'line' },
  ];
  for (const [name, value] of Object.entries({
    title: 'Mixed',
    data: [row],
    rowIdKey: 'id',
    categoryKey: 'category',
    series,
  }))
    fixture.componentRef.setInput(name, value);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  host.querySelector<HTMLButtonElement>('.table-toggle')!.click();
  await fixture.whenStable();
  expect(host.querySelector('tbody')?.textContent).toContain('Missing');
  const selected = vi.fn();
  fixture.componentInstance.pointSelect.subscribe(selected);
  host.querySelector<HTMLButtonElement>('tbody button')!.click();
  expect(selected).toHaveBeenCalledWith({
    rowId: 'a',
    seriesId: 'v',
    row,
    value: 0,
    source: 'table',
  });
  fixture.componentRef.setInput('series', [{ ...series[0], kind: 'area' }]);
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('kind');
  fixture.componentRef.setInput('loading', true);
  await fixture.whenStable();
  expect(host.querySelector('[role=status]')?.textContent).toContain('Loading');
  fixture.componentRef.setInput('series', [{ ...series[0], kind: 'line', smooth: 'bad' }]);
  fixture.componentRef.setInput('loading', false);
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('booleans');
  fixture.componentRef.setInput('series', series);
  await fixture.whenStable();
  expect(host.querySelector('table')).not.toBeNull();
});
