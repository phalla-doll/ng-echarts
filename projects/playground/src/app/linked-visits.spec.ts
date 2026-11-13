import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { deviceShare, LinkedVisits, type VisitMonth } from './linked-visits';

it('keeps missing device observations distinct from numeric zero and sums only available observations', () => {
  expect(deviceShare([]).map((row) => row.visits)).toEqual([null, null]);
  expect(
    deviceShare([{ id: 'a', month: 'A', desktop: null, mobile: 0 }]).map((row) => row.visits),
  ).toEqual([null, 0]);
  expect(
    deviceShare([
      { id: 'a', month: 'A', desktop: 12, mobile: null },
      { id: 'b', month: 'B', desktop: null, mobile: 0 },
      { id: 'c', month: 'C', desktop: 8, mobile: 5 },
    ]),
  ).toEqual([
    { id: 'desktop', device: 'Desktop', visits: 20 },
    { id: 'mobile', device: 'Mobile', visits: 5 },
  ]);
});

it('derives current detail from stable IDs and clears removed IDs without resurrecting obsolete filters', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(LinkedVisits);
  const initial: readonly VisitMonth[] = [
    { id: 'a', month: 'A', desktop: 12, mobile: 8 },
    { id: 'b', month: 'B', desktop: 20, mobile: 0 },
  ];
  fixture.componentRef.setInput('data', initial);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  const select = host.querySelector('select')!;
  select.value = 'month:b';
  select.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  expect(host.querySelector('.linked-status')?.textContent).toContain('B: 20 visits');
  fixture.componentRef.setInput('data', [
    { ...initial[1]!, month: 'Renamed', desktop: 25 },
    initial[0]!,
  ]);
  await fixture.whenStable();
  expect(select.value).toBe('month:b');
  expect(host.querySelector('.linked-status')?.textContent).toContain('Renamed: 25 visits');
  fixture.componentRef.setInput('data', [initial[0]!]);
  await fixture.whenStable();
  expect(select.value).toBe('');
  expect(host.querySelector('.linked-status')?.textContent).toContain('All months: 20 visits');
  fixture.componentRef.setInput('data', initial);
  await fixture.whenStable();
  expect(select.value).toBe('');
  expect(host.querySelector('.linked-status')?.textContent).toContain('All months: 40 visits');
  fixture.componentRef.setInput('data', []);
  await fixture.whenStable();
  expect(host.querySelector('.linked-status')?.textContent).toContain('No months available');
});

it('keeps the visible summary aligned with current values when a previously selected device becomes missing', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(LinkedVisits);
  fixture.componentRef.setInput('data', [{ id: 'jan', month: 'January', desktop: 12, mobile: 8 }]);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  host.querySelector<HTMLButtonElement>('.detail .table-toggle')!.click();
  await fixture.whenStable();
  host.querySelector<HTMLButtonElement>('.detail tbody button')!.click();
  await fixture.whenStable();
  expect(host.querySelector('.linked-summary')?.textContent).toContain('Desktop');
  fixture.componentRef.setInput('data', [
    { id: 'jan', month: 'January', desktop: null, mobile: 8 },
  ]);
  await fixture.whenStable();
  expect(host.querySelector('.linked-summary')?.textContent).not.toContain('Desktop');
  expect(host.querySelector('.summary-value')?.textContent).toBe('8');
  expect(host.querySelector('.linked-status')?.textContent).toContain('All months: 8 visits.');
});

it('aggregates an inclusive range, reconciles bounds and returns focus before removed fields disappear', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(LinkedVisits);
  const rows: readonly VisitMonth[] = [
    { id: 'jan', month: 'January', desktop: null, mobile: 0 },
    { id: 'feb', month: 'February', desktop: 20, mobile: 0 },
    { id: 'mar', month: 'March', desktop: 30, mobile: null },
  ];
  fixture.componentRef.setInput('data', rows);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  const period = host.querySelector('select')!;
  period.value = '__range__';
  period.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  const [from, to] = [...host.querySelectorAll<HTMLSelectElement>('.range-fields select')];
  from!.value = 'feb';
  from!.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  expect(host.querySelector('.linked-status')?.textContent).toContain('February–March: 50 visits');
  expect(to!.value).toBe('mar');
  fixture.componentRef.setInput('data', [...rows].reverse());
  await fixture.whenStable();
  expect(from!.value).toBe('mar');
  expect(to!.value).toBe('feb');
  to!.focus();
  fixture.componentRef.setInput(
    'data',
    rows.filter((row) => row.id !== 'feb'),
  );
  await fixture.whenStable();
  expect(period.value).toBe('');
  expect(host.querySelector('.range-fields')).toBeNull();
  expect(host.ownerDocument.activeElement).toBe(period);
  fixture.componentRef.setInput('data', rows);
  await fixture.whenStable();
  expect(period.value).toBe('');
});

it('starts with unavailable range selection and recovers without losing focus when it becomes unavailable again', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(LinkedVisits);
  fixture.componentRef.setInput('data', []);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  const period = host.querySelector('select')!;
  const button = host.querySelector<HTMLButtonElement>('.select-range')!;
  expect(button.disabled).toBe(true);
  expect(host.querySelector('.linked-status')?.textContent).toContain('No months available');
  fixture.componentRef.setInput('data', [{ id: 'zero', month: 'Zero', desktop: 0, mobile: null }]);
  await fixture.whenStable();
  expect(button.disabled).toBe(false);
  button.click();
  button.focus();
  fixture.componentRef.setInput('data', []);
  await fixture.whenStable();
  expect(button.disabled).toBe(true);
  expect(button.getAttribute('aria-pressed')).toBe('false');
  expect(host.ownerDocument.activeElement).toBe(period);
});
