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

  it('switches legend layouts without replacing controls or resetting hidden identities', async () => {
    const { fixture, host } = await setup();
    const legend = host.querySelector<HTMLElement>('.legend')!;
    const button = legend.querySelector<HTMLButtonElement>('button')!;
    expect(legend.classList.contains('legend-list')).toBe(false);
    button.click();
    await fixture.whenStable();
    fixture.componentRef.setInput('legendLayout', 'list');
    await fixture.whenStable();
    expect(legend.classList.contains('legend-list')).toBe(true);
    expect(legend.querySelector('button')).toBe(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    fixture.componentRef.setInput('legendLayout', 'chips');
    await fixture.whenStable();
    expect(legend.classList.contains('legend-list')).toBe(false);
    expect(legend.querySelector('button')).toBe(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

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

  it('pages before creating table cells and retains raw zero/missing/hidden values', async () => {
    const { fixture, host } = await setup();
    expect(host.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(host.querySelector('nec-table-pager nav')).toBeNull();
    fixture.componentRef.setInput('tablePageSize', 1);
    await fixture.whenStable();
    const next = host.querySelector<HTMLButtonElement>('[aria-label="Next table page"]')!;
    const previous = host.querySelector<HTMLButtonElement>('[aria-label="Previous table page"]')!;
    expect(host.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(previous.getAttribute('aria-disabled')).toBe('true');
    expect(host.querySelector('nec-table-pager [role=status]')?.textContent).toContain(
      'Rows 1–1 of 3',
    );
    host.querySelector<HTMLButtonElement>('.legend button')!.click();
    next.click();
    await fixture.whenStable();
    expect(host.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(host.querySelector('tbody button')?.textContent?.trim()).toBe('0');
    const selected = vi.fn();
    fixture.componentInstance.pointSelect.subscribe(selected);
    host.querySelector<HTMLButtonElement>('tbody button')!.click();
    expect(selected.mock.lastCall?.[0]).toEqual({
      rowId: 'b',
      seriesId: 'value',
      row: rows[1],
      value: 0,
      source: 'table',
    });
    expect(selected.mock.lastCall?.[0].row).toBe(rows[1]);
    next.click();
    await fixture.whenStable();
    expect(host.querySelector('tbody')?.textContent).toContain('Missing');
    expect(host.querySelector('tbody button')).toBeNull();
    expect(next.getAttribute('aria-disabled')).toBe('true');
    next.click();
    await fixture.whenStable();
    expect(host.querySelector('nec-table-pager [role=status]')?.textContent).toContain(
      'Rows 3–3 of 3',
    );
    previous.click();
    await fixture.whenStable();
    expect(host.querySelector('tbody button')?.textContent?.trim()).toBe('0');
  });

  it('resets paging on immutable data/page-size changes and restores the complete table with null', async () => {
    const { fixture, host } = await setup();
    fixture.componentRef.setInput('tablePageSize', 1);
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('[aria-label="Next table page"]')!.click();
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    expect(host.querySelector('tbody button')?.textContent?.trim()).toBe('0');
    fixture.componentRef.setInput('data', [...rows].reverse());
    await fixture.whenStable();
    expect(host.querySelector('nec-table-pager [role=status]')?.textContent).toContain(
      'Rows 1–1 of 3',
    );
    expect(host.querySelector('tbody')?.textContent).toContain('Missing');
    fixture.componentRef.setInput('tablePageSize', 2);
    await fixture.whenStable();
    expect(host.querySelectorAll('tbody tr')).toHaveLength(2);
    fixture.componentRef.setInput('tablePageSize', null);
    await fixture.whenStable();
    expect(host.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(host.querySelector('nec-table-pager nav')).toBeNull();
  });

  it('rejects invalid page sizes and recovers without hiding configuration errors', async () => {
    const { fixture, host } = await setup();
    for (const value of [
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      '2',
      undefined,
    ]) {
      fixture.componentRef.setInput('tablePageSize', value);
      await fixture.whenStable();
      expect(host.querySelector('[role=alert]')?.textContent).toContain('Table page size must be');
      expect(host.querySelector('tbody')).toBeNull();
    }
    fixture.componentRef.setInput('tablePageSize', 20);
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')).toBeNull();
    expect(host.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(host.querySelector('nec-table-pager nav')).toBeNull();
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

  it('preserves legend choices through invalid data but reconciles valid removals while loading', async () => {
    const { fixture, host } = await setup();
    host.querySelector<HTMLButtonElement>('.legend button')!.click();
    await fixture.whenStable();
    fixture.componentRef.setInput('data', [
      { id: 'invalid', category: 'Invalid', value: Infinity },
    ]);
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')).not.toBeNull();
    fixture.componentRef.setInput('data', rows);
    await fixture.whenStable();
    expect(host.querySelector('.legend button')?.getAttribute('aria-pressed')).toBe('false');

    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('data', family === 'pie' ? rows.slice(1) : [{ value: Infinity }]);
    if (family !== 'pie') fixture.componentRef.setInput('series', []);
    await fixture.whenStable();
    expect(host.querySelector('[role=status]')?.textContent).toContain('Loading');
    fixture.componentRef.setInput('data', rows);
    if (family !== 'pie') fixture.componentRef.setInput('series', [descriptor]);
    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();
    expect(host.querySelector('.legend button')?.getAttribute('aria-pressed')).toBe('true');
  });
});
