import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RadialProgress } from './radial-progress';
async function create() {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(RadialProgress);
  for (const [key, value] of Object.entries({ title: 'Visit goal', value: 6800, max: 10000 }))
    fixture.componentRef.setInput(key, value);
  await fixture.whenStable();
  return fixture;
}
it('renders native raw progress and readable formatted values without a renderer or invented controls', async () => {
  const fixture = await create();
  const host = fixture.nativeElement as HTMLElement;
  const progress = host.querySelector('progress')!;
  expect(progress.getAttribute('aria-label')).toBe('Visit goal');
  expect(progress.getAttribute('value')).toBe('6800');
  expect(progress.getAttribute('max')).toBe('10000');
  expect(progress.getAttribute('aria-valuetext')).toBe('68%; 6,800 of 10,000');
  expect(host.querySelector('canvas')).toBeNull();
  expect(host.querySelector('button')).toBeNull();
  expect(progress.hasAttribute('tabindex')).toBe(false);
  fixture.componentRef.setInput('value', 0);
  await fixture.whenStable();
  expect(progress.value).toBe(0);
  fixture.componentRef.setInput('value', 10000);
  await fixture.whenStable();
  expect(progress.position).toBe(1);
});
it('honors state precedence and recovers from missing/invalid/loading/error values', async () => {
  const fixture = await create();
  const host = fixture.nativeElement as HTMLElement;
  fixture.componentRef.setInput('value', null);
  await fixture.whenStable();
  expect(host.querySelector('[role=status]')?.textContent).toContain('No progress data');
  expect(host.querySelector('progress')).toBeNull();
  fixture.componentRef.setInput('value', 10001);
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('between zero');
  fixture.componentRef.setInput('loading', true);
  await fixture.whenStable();
  expect(host.querySelector('[role=status]')?.textContent).toContain('Loading progress');
  fixture.componentRef.setInput('error', 'Unavailable');
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('Unavailable');
  fixture.componentRef.setInput('error', null);
  fixture.componentRef.setInput('loading', false);
  fixture.componentRef.setInput('value', 2000);
  await fixture.whenStable();
  expect(host.querySelector('progress')?.getAttribute('value')).toBe('2000');
  expect(host.querySelector('[role=alert]')).toBeNull();
  fixture.componentRef.setInput('title', '');
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('nonempty text');
});
it('formats value and maximum consistently and contains invalid callbacks/options', async () => {
  const fixture = await create();
  const host = fixture.nativeElement as HTMLElement;
  fixture.componentRef.setInput('locale', 'de-DE');
  await fixture.whenStable();
  expect(host.querySelector('.progress-label span')?.textContent).toBe('6.800 of 10.000');
  fixture.componentRef.setInput('valueFormatter', (value: number) => `<${value}> visits`);
  await fixture.whenStable();
  expect(host.querySelector('progress')?.getAttribute('aria-valuetext')).toContain(
    '<6800> visits of <10000> visits',
  );
  expect(host.querySelector('visits')).toBeNull();
  fixture.componentRef.setInput('valueFormatter', () => {
    throw new Error('private');
  });
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('Value formatting failed');
  expect(host.textContent).not.toContain('private');
  fixture.componentRef.setInput('valueFormatter', undefined);
  fixture.componentRef.setInput('numberFormatOptions', { maximumFractionDigits: -1 });
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('number format options');
});

it('does not label tiny or nearly complete work as actual zero or completion', async () => {
  const fixture = await create();
  const host = fixture.nativeElement as HTMLElement;
  fixture.componentRef.setInput('max', 100);
  fixture.componentRef.setInput('value', 0.001);
  await fixture.whenStable();
  expect(host.querySelector('.progress-label strong')?.textContent).toBe('<0.1%');
  expect(host.querySelector('progress')?.getAttribute('value')).toBe('0.001');
  fixture.componentRef.setInput('value', 99.999);
  await fixture.whenStable();
  expect(host.querySelector('.progress-label strong')?.textContent).toBe('>99.9%');
  fixture.componentRef.setInput('value', 100);
  await fixture.whenStable();
  expect(host.querySelector('.progress-label strong')?.textContent).toBe('100%');
});
