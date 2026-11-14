import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BarChart } from './bar-chart';
import type { ChartSeries, PointSelection } from '@ng-echarts/chart-library/core';

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
  it('previews real zero values without selecting, restores focused context after hover, and clears on changes', async () => {
    const { fixture, element } = await setup();
    const previews = vi.fn(),
      selections = vi.fn();
    fixture.componentInstance.pointPreview.subscribe(previews);
    fixture.componentInstance.pointSelect.subscribe(selections);
    const point = { rowId: 'first', seriesId: 'value' };
    fixture.componentInstance['previewPoint'](point, 'plot', 'pointer');
    expect(previews).not.toHaveBeenCalled();
    fixture.componentRef.setInput('previewEnabled', true);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    const action = element.querySelector<HTMLButtonElement>('tbody button')!;
    action.focus();
    fixture.componentInstance['previewPoint'](point, 'table', 'focus');
    await fixture.whenStable();
    expect(previews.mock.lastCall?.[0]).toEqual({
      ...point,
      row: data[0],
      value: 0,
      source: 'table',
      trigger: 'focus',
    });
    expect(previews.mock.lastCall?.[0].row).toBe(data[0]);
    fixture.componentInstance['previewPoint'](point, 'plot', 'pointer');
    expect(previews.mock.lastCall?.[0].trigger).toBe('pointer');
    fixture.componentInstance['previewPoint'](null, 'plot', 'pointer');
    expect(previews.mock.lastCall?.[0].trigger).toBe('focus');
    action.blur();
    fixture.componentInstance['previewPoint'](null, 'table', 'focus');
    expect(previews.mock.lastCall?.[0]).toBeNull();
    fixture.componentInstance['previewPoint'](
      { rowId: 'second', seriesId: 'value' },
      'plot',
      'pointer',
    );
    expect(previews.mock.lastCall?.[0]).toBeNull();
    fixture.componentInstance['previewPoint'](point, 'plot', 'pointer');
    fixture.componentRef.setInput('data', [...data]);
    await fixture.whenStable();
    expect(previews.mock.lastCall?.[0]).toBeNull();
    fixture.componentInstance['previewPoint'](point, 'plot', 'pointer');
    fixture.componentRef.setInput('rangeSelection', true);
    await fixture.whenStable();
    expect(previews.mock.lastCall?.[0]).toBeNull();
    const count = previews.mock.calls.length;
    fixture.componentInstance['previewPoint'](point, 'plot', 'pointer');
    expect(previews).toHaveBeenCalledTimes(count);
    expect(selections).not.toHaveBeenCalled();
    expect(fixture.componentInstance.selectedRowId()).toBeNull();
    fixture.componentRef.setInput('previewEnabled', 'yes');
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toContain(
      'Preview enabled must be a boolean',
    );
  });
  it('emits a controlled contiguous range with original rows and rejects disabled, stale or unavailable requests', async () => {
    const { fixture, element } = await setup();
    const ranges = vi.fn(),
      points = vi.fn();
    fixture.componentInstance.rangeSelect.subscribe(ranges);
    fixture.componentInstance.pointSelect.subscribe(points);
    const select = (ids: readonly string[]) =>
      fixture.componentInstance['selectRange'](ids, fixture.componentInstance['model']());
    select(['first', 'second']);
    expect(ranges).not.toHaveBeenCalled();
    fixture.componentRef.setInput('rangeSelection', true);
    await fixture.whenStable();
    select(['first', 'second']);
    expect(ranges).toHaveBeenCalledExactlyOnceWith({
      fromRowId: 'first',
      toRowId: 'second',
      rowIds: ['first', 'second'],
      rows: data,
      source: 'plot',
    });
    expect(ranges.mock.calls[0]![0].rows[0]).toBe(data[0]);
    expect(fixture.componentInstance.selectedRowIds()).toBeNull();
    expect(points).not.toHaveBeenCalled();
    for (const ids of [[], ['unknown'], ['second', 'first'], ['first', 'first']]) select(ids);
    const stale = fixture.componentInstance['model']();
    fixture.componentRef.setInput('data', [...data]);
    await fixture.whenStable();
    fixture.componentInstance['selectRange'](['first', 'second'], stale);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    select(['first']);
    expect(ranges).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('rangeSelection', 'yes');
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toContain(
      'Range selection must be a boolean',
    );
    fixture.componentRef.setInput('rangeSelection', false);
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')).toBeNull();
  });
  it('supports controlled multi-row feedback, independent precedence, deduplication and explicit clearing', async () => {
    const { fixture, element } = await setup();
    fixture.componentRef.setInput('selectedRowId', 'first');
    fixture.componentRef.setInput('selectedRowIds', ['second', 'first', 'second', 'unknown']);
    element.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    expect(element.querySelectorAll('.selected-row')).toHaveLength(2);
    expect(element.querySelectorAll('tr[aria-current]')).toHaveLength(0);
    expect(element.querySelectorAll('.selection-label')).toHaveLength(2);
    const events = vi.fn();
    fixture.componentInstance.pointSelect.subscribe(events);
    fixture.componentRef.setInput('selectedRowIds', []);
    await fixture.whenStable();
    expect(element.querySelectorAll('.selected-row')).toHaveLength(0);
    fixture.componentRef.setInput('selectedRowIds', null);
    await fixture.whenStable();
    expect(element.querySelector('tr[aria-current]')?.textContent).toContain('A Selected');
    expect(events).not.toHaveBeenCalled();
    fixture.componentRef.setInput('selectedRowIds', [12]);
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toContain('Selected row IDs');
    fixture.componentRef.setInput('selectedRowIds', ['unknown', 'second']);
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')).toBeNull();
    expect(element.querySelector('tr[aria-current]')?.textContent).toContain('B Selected');
  });
  it('reflects controlled row identity in the table without changing selection on point events', async () => {
    const { fixture, element } = await setup();
    const events = vi.fn();
    fixture.componentInstance.pointSelect.subscribe(events);
    element.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    fixture.componentRef.setInput('selectedRowId', 'second');
    await fixture.whenStable();
    expect(element.querySelector('tr[aria-current]')?.textContent).toContain('B Selected');
    expect(events).not.toHaveBeenCalled();
    element.querySelector<HTMLButtonElement>('tbody button')!.click();
    expect(events).toHaveBeenCalledWith(expect.objectContaining({ rowId: 'first', value: 0 }));
    expect(element.querySelector('tr[aria-current]')?.textContent).toContain('B Selected');
    fixture.componentRef.setInput('data', [
      { id: 'second', category: 'Renamed', value: null },
      data[0],
    ]);
    await fixture.whenStable();
    expect(element.querySelector('tbody tr')?.getAttribute('aria-current')).toBe('true');
    expect(element.querySelector('tr[aria-current]')?.textContent).toContain('Renamed Selected');
    fixture.componentRef.setInput('data', [data[0]]);
    await fixture.whenStable();
    expect(element.querySelector('tr[aria-current]')).toBeNull();
    fixture.componentRef.setInput('selectedRowId', null);
    fixture.componentRef.setInput('data', data);
    await fixture.whenStable();
    expect(element.querySelector('tr[aria-current]')).toBeNull();
    expect(events).toHaveBeenCalledTimes(1);
  });

  it('contains invalid runtime selection types and recovers on a valid input', async () => {
    const { fixture, element } = await setup();
    fixture.componentRef.setInput('selectedRowId', 12);
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toContain('Selected row ID');
    fixture.componentRef.setInput('selectedRowId', 'unknown');
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')).toBeNull();
  });

  it('can omit the table controls and expanded values without changing the legend', async () => {
    const { fixture, element } = await setup();
    element.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(2);
    fixture.componentRef.setInput('showDataTable', false);
    await fixture.whenStable();
    expect(element.querySelector('.table-toggle')).toBeNull();
    expect(element.querySelector('table')).toBeNull();
    expect(element.querySelectorAll('.legend button')).toHaveLength(1);
    fixture.componentRef.setInput('showDataTable', true);
    await fixture.whenStable();
    expect(element.querySelector('.table-toggle')?.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('updates numeric text and table actions while preserving missing values and raw events', async () => {
    const { fixture, element } = await setup();
    fixture.componentRef.setInput('data', [
      ...data,
      { id: 'third', category: 'C', value: -1234.5 },
    ]);
    fixture.componentRef.setInput('locale', 'de-DE');
    fixture.componentRef.setInput('numberFormatOptions', { style: 'currency', currency: 'EUR' });
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.table-toggle')!.click();
    await fixture.whenStable();
    expect(element.querySelector('tbody')?.textContent).toContain('-1.234,50\u00a0€');
    expect(element.querySelector('tbody')?.textContent).toContain('Missing');
    const format = vi.fn((value: number) => `Value ${value}`);
    fixture.componentRef.setInput('valueFormatter', format);
    await fixture.whenStable();
    const action = element.querySelector<HTMLButtonElement>('tbody button')!;
    expect(action.getAttribute('aria-label')).toBe('Select Values for A: Value 0');
    const events: PointSelection<Row>[] = [];
    fixture.componentInstance.pointSelect.subscribe((event) => events.push(event));
    action.click();
    expect(events[0]?.value).toBe(0);
    expect(format).toHaveBeenCalledTimes(2);
    fixture.componentRef.setInput('theme', 'dark');
    fixture.componentRef.setInput('layout', 'horizontal');
    await fixture.whenStable();
    expect(format).toHaveBeenCalledTimes(2);
  });

  it('recovers formatting errors with application-error and loading precedence intact', async () => {
    const { fixture, element } = await setup();
    fixture.componentRef.setInput('valueFormatter', () => {
      throw new Error('Private formatter details');
    });
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toContain('Value formatting failed');
    expect(element.textContent).not.toContain('Private formatter details');
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    expect(element.querySelector('[role=status]')?.textContent).toContain('Loading');
    fixture.componentRef.setInput('error', 'Application error');
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toBe('Application error');
    fixture.componentRef.setInput('error', null);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('valueFormatter', undefined);
    fixture.componentRef.setInput('numberFormatOptions', { style: 'currency' });
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')?.textContent).toContain('number format options');
    fixture.componentRef.setInput('numberFormatOptions', undefined);
    await fixture.whenStable();
    expect(element.querySelector('[role=alert]')).toBeNull();
    expect(element.querySelector('.table-toggle')).not.toBeNull();
  });
  it('discards removed visibility IDs even while rows are invalid', async () => {
    const { fixture, element } = await setup();
    element.querySelector<HTMLButtonElement>('.legend button')!.click();
    await fixture.whenStable();
    fixture.componentRef.setInput('data', [{ id: 'bad', category: 'Invalid', value: Number.NaN }]);
    await fixture.whenStable();
    fixture.componentRef.setInput('series', []);
    await fixture.whenStable();
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('series', series);
    await fixture.whenStable();
    expect(element.querySelector('.legend button')?.getAttribute('aria-pressed')).toBe('true');
  });
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
    expect(element.querySelector<HTMLButtonElement>('.table-toggle')?.disabled).toBe(true);
    expect(element.querySelector('.table-toggle')?.closest('[inert]')).not.toBeNull();
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
