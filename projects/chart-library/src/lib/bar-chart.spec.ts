import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BarChart } from './bar-chart';
import type { ChartSeries, PointSelection } from './chart-types';

interface Row {
  id: string;
  category: string;
  value: number | null;
}
const data: readonly Row[] = [
  { id: 'first', category: 'A', value: 0 },
  { id: 'second', category: 'B', value: null },
];
const series: readonly ChartSeries<Row>[] = [{ id: 'value', key: 'value', label: 'Values' }];

async function setup() {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(BarChart<Row>);
  for (const [key, value] of Object.entries({
    title: 'Sample',
    description: 'Sample data',
    data,
    series,
    rowIdKey: 'id',
    categoryKey: 'category',
  })) {
    fixture.componentRef.setInput(key, value);
  }
  await fixture.whenStable();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('bar Angular controls', () => {
  it('contains formatter failures, preserves state precedence, and recovers full table labels', async () => {
    const { fixture, element } = await setup();
    fixture.componentRef.setInput('categoryTickFormatter', () => {
      throw new Error('Private details');
    });
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toContain(
      'Category tick formatting failed',
    );
    expect(element.textContent).not.toContain('Private details');
    expect(element.querySelector('.table-toggle')).toBeNull();
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    expect(element.querySelector('[role=status]')?.textContent).toContain('Loading');
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('categoryTickFormatter', (label: string) => label.toLowerCase());
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')).toBeNull();
    element.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    expect(element.querySelector('tbody th')?.textContent).toContain('A');
    expect(element.querySelector('tbody button')?.getAttribute('aria-label')).toBe(
      'Select Values for A: 0',
    );
  });

  it('keeps every value accessible when all series are hidden and emits typed table actions', async () => {
    const { fixture, element } = await setup();
    const events: PointSelection<Row>[] = [];
    fixture.componentInstance.pointSelect.subscribe((event) => events.push(event));
    const visibility = vi.fn();
    fixture.componentInstance.legendChange.subscribe(visibility);
    const legend = element.querySelector<HTMLButtonElement>('.legend button')!;
    legend.click();
    await fixture.whenStable();
    expect(legend.getAttribute('aria-pressed')).toBe('false');
    expect(visibility).toHaveBeenCalledWith({ seriesId: 'value', visible: false });
    element.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(element.querySelector('tbody')?.textContent).toContain('Missing');
    const action = element.querySelector<HTMLButtonElement>('tbody button')!;
    expect(action.getAttribute('aria-label')).toContain(': 0');
    action.click();
    expect(events).toEqual([
      { rowId: 'first', seriesId: 'value', row: data[0], value: 0, source: 'table' },
    ]);
  });

  it('hides stale actions during loading, applies precedence, and recovers the latest data', async () => {
    const { fixture, element } = await setup();
    element.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('data', [{ id: 'new', category: 'New', value: 1234 }]);
    await fixture.whenStable();
    expect(element.querySelector('table')).toBeNull();
    expect(element.querySelector('[role=status]')?.textContent).toContain('Loading');
    fixture.componentRef.setInput('error', 'Application error');
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toBe('Application error');
    fixture.componentRef.setInput('error', null);
    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();
    expect(element.querySelector('tbody')?.textContent).toContain('1,234');
  });

  it('preserves visibility by identifier, discards removed series, and restores new IDs as visible', async () => {
    const { fixture, element } = await setup();
    element.querySelector<HTMLButtonElement>('.legend button')!.click();
    await fixture.whenStable();
    fixture.componentRef.setInput('series', [{ ...series[0], label: 'Renamed' }]);
    await fixture.whenStable();
    expect(element.querySelector('.legend button')?.getAttribute('aria-pressed')).toBe('false');
    fixture.componentRef.setInput('series', []);
    await fixture.whenStable();
    fixture.componentRef.setInput('series', series);
    await fixture.whenStable();
    expect(element.querySelector('.legend button')?.getAttribute('aria-pressed')).toBe('true');
  });
});
