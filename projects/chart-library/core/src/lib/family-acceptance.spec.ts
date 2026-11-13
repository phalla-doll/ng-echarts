import { PLATFORM_ID, type OutputEmitterRef, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComposedChart } from '../../../composed/src/lib/composed-chart';
import { BarChart } from '../../../bar/src/lib/bar-chart';
import { LineChart } from '../../../line/src/lib/line-chart';
import { AreaChart } from '../../../area/src/lib/area-chart';
import { PieChart } from '../../../pie/src/lib/pie-chart';
import type { PointSelection } from './chart-types';

interface Row {
  readonly id: string;
  readonly category: string;
  readonly value: number | null;
}
interface Chart {
  readonly pointSelect: OutputEmitterRef<PointSelection<Row>>;
}
const rows: readonly Row[] = [
  { id: 'a', category: 'Duplicate', value: 1234.5 },
  { id: 'b', category: 'Duplicate', value: 0 },
  { id: 'c', category: 'Missing', value: null },
];
const measure = { id: 'value', key: 'value', label: 'Value' };
const families: readonly { family: string; component: Type<Chart> }[] = [
  { family: 'composed', component: ComposedChart<Row> },
  { family: 'bar', component: BarChart<Row> },
  { family: 'line', component: LineChart<Row> },
  { family: 'area', component: AreaChart<Row> },
  { family: 'pie', component: PieChart<Row> },
];

describe.each(families)('$family cross-family acceptance', ({ family, component }) => {
  const descriptor = family === 'composed' ? { ...measure, kind: 'bar' } : measure;
  async function setup() {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(component);
    for (const [key, value] of Object.entries({
      title: 'Acceptance',
      data: rows,
      rowIdKey: 'id',
      categoryKey: 'category',
      ...(family === 'pie' ? { measure } : { series: [descriptor] }),
    }))
      fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    return { fixture, host };
  }

  it('formats locale/custom text without changing raw zero, missing values, or original rows', async () => {
    const { fixture, host } = await setup();
    fixture.componentRef.setInput('locale', 'de-DE');
    fixture.componentRef.setInput('numberFormatOptions', { style: 'currency', currency: 'EUR' });
    await fixture.whenStable();
    expect(host.querySelector('tbody')?.textContent).toContain('1.234,50\u00a0€');
    expect(host.querySelectorAll('tbody button')).toHaveLength(2);
    expect(host.querySelector('tbody')?.textContent).toContain('Missing');
    fixture.componentRef.setInput('valueFormatter', (value: number) => `Raw ${value}`);
    await fixture.whenStable();
    const selected = vi.fn();
    fixture.componentInstance.pointSelect.subscribe(selected);
    const zero = host.querySelectorAll<HTMLButtonElement>('tbody button')[1]!;
    expect(zero.getAttribute('aria-label')).toBe('Select Value for Duplicate: Raw 0');
    zero.click();
    expect(selected).toHaveBeenCalledExactlyOnceWith({
      rowId: 'b',
      seriesId: 'value',
      row: rows[1],
      value: 0,
      source: 'table',
    });
  });

  it('honors error/loading/validation precedence and recovers the latest immutable inputs', async () => {
    const { fixture, host } = await setup();
    fixture.componentRef.setInput('valueFormatter', () => {
      throw new Error('Private details');
    });
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Value formatting failed');
    expect(host.textContent).not.toContain('Private details');
    expect(host.querySelector('tbody button')).toBeNull();
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    expect(host.querySelector('[role=status]')?.textContent).toContain('Loading');
    fixture.componentRef.setInput('error', 'Application error');
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')?.textContent).toBe('Application error');
    fixture.componentRef.setInput('data', [{ id: 'latest', category: 'Latest', value: 42 }]);
    fixture.componentRef.setInput('valueFormatter', undefined);
    fixture.componentRef.setInput('error', null);
    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();
    expect(host.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(host.querySelector('tbody button')?.getAttribute('aria-label')).toBe(
      'Select Value for Latest: 42',
    );
    expect(host.querySelector('[role=alert]')).toBeNull();
  });

  it('retains hidden identities across renaming and discards removed identities before reintroduction', async () => {
    const { fixture, host } = await setup();
    host.querySelector<HTMLButtonElement>('.legend button')!.click();
    await fixture.whenStable();
    fixture.componentRef.setInput(
      'data',
      rows.map((row) => ({ ...row, category: 'Renamed' })),
    );
    if (family !== 'pie')
      fixture.componentRef.setInput('series', [{ ...descriptor, label: 'Renamed' }]);
    await fixture.whenStable();
    expect(host.querySelector('.legend button')?.getAttribute('aria-pressed')).toBe('false');
    expect(host.querySelectorAll('tbody button')).toHaveLength(2);
    if (family === 'pie') fixture.componentRef.setInput('data', rows.slice(1));
    else fixture.componentRef.setInput('series', []);
    await fixture.whenStable();
    fixture.componentRef.setInput('data', rows);
    if (family !== 'pie') fixture.componentRef.setInput('series', [descriptor]);
    await fixture.whenStable();
    expect(host.querySelector('.legend button')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelectorAll('tbody tr')).toHaveLength(3);
  });
});
