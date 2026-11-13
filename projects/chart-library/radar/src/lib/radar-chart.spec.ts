import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RadarChart } from './radar-chart';
interface Row {
  id: string;
  name: string;
  max: number;
  value: number | null;
}
it('renders SSR-safe scale/table controls, raw zero actions, missing notices, state precedence and recovery', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(RadarChart<Row>);
  const data: readonly Row[] = [
    { id: 'a', name: 'A', max: 100, value: 0 },
    { id: 'b', name: 'B', max: 50, value: 20 },
    { id: 'c', name: 'C', max: 10, value: null },
  ];
  for (const [key, value] of Object.entries({
    title: 'Radar',
    data,
    rowIdKey: 'id',
    categoryKey: 'name',
    maxKey: 'max',
    series: [{ id: 'value', key: 'value', label: 'Value' }],
  }))
    fixture.componentRef.setInput(key, value);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  expect(host.querySelector('canvas')).toBeNull();
  expect(host.textContent).toContain('Incomplete comparisons');
  host.querySelector<HTMLButtonElement>('.table-toggle')!.click();
  await fixture.whenStable();
  expect(host.querySelector('table')?.textContent).toContain('0 – 50');
  expect(host.querySelector('table')?.textContent).toContain('Missing');
  const selected = vi.fn();
  fixture.componentInstance.pointSelect.subscribe(selected);
  host.querySelector<HTMLButtonElement>('tbody button')!.click();
  expect(selected).toHaveBeenCalledWith(
    expect.objectContaining({
      rowId: 'a',
      seriesId: 'value',
      value: 0,
      source: 'table',
      row: data[0],
    }),
  );
  fixture.componentRef.setInput('loading', true);
  fixture.componentRef.setInput('data', data.slice(0, 2));
  await fixture.whenStable();
  expect(host.textContent).toContain('Loading chart');
  expect(host.querySelector('table')).toBeNull();
  fixture.componentRef.setInput('error', 'Unavailable');
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('Unavailable');
  fixture.componentRef.setInput('error', null);
  fixture.componentRef.setInput('loading', false);
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('3 to 12');
  fixture.componentRef.setInput('data', data);
  await fixture.whenStable();
  expect(host.querySelector('table')).not.toBeNull();
  fixture.componentRef.setInput('filled', 'invalid');
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('boolean');
  fixture.componentRef.setInput('filled', false);
  fixture.componentRef.setInput('showDataTable', false);
  await fixture.whenStable();
  expect(host.querySelector('table')).toBeNull();
  expect(host.querySelector('[role=alert]')).toBeNull();
});
