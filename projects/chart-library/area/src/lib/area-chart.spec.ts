import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AreaChart } from './area-chart';
it('inherits typed inputs, states, table semantics, raw events, and recovery', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(
    AreaChart<{ id: string; category: string; value: number | null }>,
  );
  for (const [key, value] of Object.entries({
    title: 'Area',
    data: [
      { id: 'a', category: 'A', value: 0 },
      { id: 'b', category: 'B', value: null },
    ],
    rowIdKey: 'id',
    categoryKey: 'category',
    series: [{ id: 'v', key: 'value', label: 'Value' }],
  }))
    fixture.componentRef.setInput(key, value);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  host.querySelector<HTMLButtonElement>('.table-toggle')!.click();
  await fixture.whenStable();
  expect(host.querySelector('tbody')?.textContent).toContain('Missing');
  const selected = vi.fn();
  fixture.componentInstance.pointSelect.subscribe(selected);
  host.querySelector<HTMLButtonElement>('tbody button')!.click();
  expect(selected).toHaveBeenCalledWith(
    expect.objectContaining({ rowId: 'a', seriesId: 'v', value: 0, source: 'table' }),
  );
  fixture.componentRef.setInput('loading', true);
  await fixture.whenStable();
  expect(host.querySelector('table')).toBeNull();
  fixture.componentRef.setInput('loading', false);
  fixture.componentRef.setInput('smooth', true);
  fixture.componentRef.setInput('showPoints', false);
  await fixture.whenStable();
  expect(host.querySelector('table')).not.toBeNull();
  fixture.componentRef.setInput('smooth', 'invalid');
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('booleans');
  fixture.componentRef.setInput('smooth', false);
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')).toBeNull();
});
