import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CalendarHeatmap } from './calendar-heatmap';
async function create() {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(CalendarHeatmap);
  for (const [key, value] of Object.entries({
    title: 'Activity',
    data: [
      { date: '2024-01-01', count: 0 },
      { date: '2024-02-29', count: 40 },
    ],
    dateKey: 'date',
    valueKey: 'count',
    year: 2024,
    max: 40,
  }))
    fixture.componentRef.setInput(key, value);
  await fixture.whenStable();
  return fixture;
}
it('provides all leap-year days in native disclosures before browser rendering, with raw zero events', async () => {
  const fixture = await create(),
    host = fixture.nativeElement as HTMLElement;
  expect(host.querySelector('canvas')).toBeNull();
  expect(host.querySelectorAll('tbody tr')).toHaveLength(366);
  expect(host.textContent).toContain('2024-02-29');
  expect(host.textContent).toContain('No data');
  const selected = vi.fn();
  fixture.componentInstance.pointSelect.subscribe(selected);
  host.querySelector<HTMLButtonElement>('button[aria-label="Select 2024-01-01: 0"]')!.click();
  expect(selected).toHaveBeenCalledWith({
    date: '2024-01-01',
    value: 0,
    row: { date: '2024-01-01', count: 0 },
    source: 'table',
  });
});
it('contains invalid formatting and respects state precedence, then recovers', async () => {
  const fixture = await create(),
    host = fixture.nativeElement as HTMLElement;
  fixture.componentRef.setInput('data', [{ date: '2024-02-30', count: 2 }]);
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('Gregorian');
  fixture.componentRef.setInput('loading', true);
  await fixture.whenStable();
  expect(host.querySelector('[role=status]')?.textContent).toBe('Loading calendar…');
  fixture.componentRef.setInput('error', 'Unavailable');
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toBe('Unavailable');
  fixture.componentRef.setInput('error', null);
  fixture.componentRef.setInput('loading', false);
  fixture.componentRef.setInput('data', []);
  await fixture.whenStable();
  expect(host.querySelector('[role=status]')?.textContent).toBe(
    'No calendar observations available.',
  );
  fixture.componentRef.setInput('data', [{ date: '2024-01-01', count: 0 }]);
  fixture.componentRef.setInput('valueFormatter', () => {
    throw new Error('private');
  });
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('Value formatting failed');
  expect(host.textContent).not.toContain('private');
  fixture.componentRef.setInput('valueFormatter', undefined);
  await fixture.whenStable();
  expect(host.querySelector('table')).not.toBeNull();
});

it('contains a formatter that fails only at an intermediate color boundary', async () => {
  const fixture = await create(),
    host = fixture.nativeElement as HTMLElement;
  fixture.componentRef.setInput('valueFormatter', (value: number) => {
    if (value === 10) throw new Error('private boundary failure');
    return String(value);
  });
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('Value formatting failed');
  expect(host.textContent).not.toContain('private boundary failure');
});
