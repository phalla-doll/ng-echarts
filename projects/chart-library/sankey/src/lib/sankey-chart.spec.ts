import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SankeyChart } from './sankey-chart';
it('renders initial native values, raw typed actions, state precedence, formatting errors and recovery', async () => {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  const fixture = TestBed.createComponent(SankeyChart);
  const nodes = [
    { id: 'a', label: 'A', note: 'original' },
    { id: 'b', label: 'B' },
  ];
  const links = [{ id: 'ab', source: 'a', target: 'b', value: 0, note: 'zero' }];
  for (const [key, value] of Object.entries({ title: 'Flow', nodes, links }))
    fixture.componentRef.setInput(key, value);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  expect(host.querySelector('canvas')).toBeNull();
  expect(host.querySelectorAll('table')).toHaveLength(2);
  expect(host.textContent).toContain('No positive flow');
  const selected = vi.fn();
  fixture.componentInstance.select.subscribe(selected);
  host.querySelector<HTMLButtonElement>('[aria-label="Select node A"]')!.click();
  expect(selected).toHaveBeenLastCalledWith({
    kind: 'node',
    node: nodes[0],
    incoming: 0,
    outgoing: 0,
    source: 'table',
  });
  host.querySelector<HTMLButtonElement>('[aria-label="Select flow A to B: 0"]')!.click();
  expect(selected).toHaveBeenLastCalledWith({
    kind: 'link',
    link: links[0],
    value: 0,
    source: 'table',
  });
  fixture.componentRef.setInput('links', [
    ...links,
    { id: 'ba', source: 'b', target: 'a', value: 1 },
  ]);
  fixture.componentRef.setInput('loading', true);
  await fixture.whenStable();
  expect(host.textContent).toContain('Loading flows');
  fixture.componentRef.setInput('error', 'Unavailable');
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('Unavailable');
  fixture.componentRef.setInput('error', null);
  fixture.componentRef.setInput('loading', false);
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('acyclic');
  fixture.componentRef.setInput('links', links);
  fixture.componentRef.setInput('valueFormatter', () => {
    throw Error('bad');
  });
  await fixture.whenStable();
  expect(host.querySelector('[role=alert]')).not.toBeNull();
  fixture.componentRef.setInput('valueFormatter', undefined);
  await fixture.whenStable();
  expect(host.querySelectorAll('table')).toHaveLength(2);
  fixture.destroy();
});
