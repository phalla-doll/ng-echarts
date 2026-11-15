import { PLATFORM_ID, type Signal, type Type, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BarChart } from '../../../bar/src/lib/bar-chart';
import { LineChart } from '../../../line/src/lib/line-chart';
import { AreaChart } from '../../../area/src/lib/area-chart';
import { ComposedChart } from '../../../composed/src/lib/composed-chart';
import { RadarChart } from '../../../radar/src/lib/radar-chart';
import { PieChart } from '../../../pie/src/lib/pie-chart';
import { RadialProgress } from '../../../radial/src/lib/radial-progress';
import { CalendarHeatmap } from '../../../calendar/src/lib/calendar-heatmap';
import { SankeyChart } from '../../../sankey/src/lib/sankey-chart';

const data = [{ id: 'a', category: 'A', value: 5 }];
const measure = { id: 'value', key: 'value', label: 'Value' };
const cartesian = { data, rowIdKey: 'id', categoryKey: 'category', series: [measure] };
const families: readonly { family: string; component: Type<unknown>; inputs: object }[] = [
  { family: 'bar', component: BarChart, inputs: cartesian },
  { family: 'line', component: LineChart, inputs: cartesian },
  { family: 'area', component: AreaChart, inputs: cartesian },
  {
    family: 'composed',
    component: ComposedChart,
    inputs: { ...cartesian, series: [{ ...measure, kind: 'bar' }] },
  },
  {
    family: 'radar',
    component: RadarChart,
    inputs: {
      ...cartesian,
      data: ['a', 'b', 'c'].map((id) => ({ id, category: id, value: 5, max: 10 })),
      maxKey: 'max',
    },
  },
  {
    family: 'pie',
    component: PieChart,
    inputs: { data, rowIdKey: 'id', categoryKey: 'category', measure },
  },
  { family: 'radial', component: RadialProgress, inputs: { value: 5 } },
  {
    family: 'calendar',
    component: CalendarHeatmap,
    inputs: {
      data: [{ date: '2024-01-01', value: 5 }],
      year: 2024,
      max: 10,
      dateKey: 'date',
      valueKey: 'value',
    },
  },
  {
    family: 'sankey',
    component: SankeyChart,
    inputs: {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      links: [{ id: 'ab', source: 'a', target: 'b', value: 5 }],
    },
  },
];

describe.each(families)('$family renderer recovery', ({ component, inputs }) => {
  it('retains a renderer failure until explicit retry or relevant input changes', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(component);
    for (const [key, value] of Object.entries({ title: 'Recovery', ...inputs }))
      fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    // Inject the same failure notification used by the browser adapter, without loading ECharts.
    const state = fixture.componentInstance as {
      rendererError: WritableSignal<boolean>;
      state: Signal<{ kind: string }>;
    };
    expect(state.state().kind).toBe('ready');
    state.rendererError.set(true);
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')?.textContent).toContain('render');
    fixture.componentRef.setInput('description', 'An unrelated caption update');
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')).not.toBeNull();
    host.querySelector<HTMLButtonElement>('.chart-status button')!.click();
    await fixture.whenStable();
    expect(state.state().kind).toBe('ready');

    state.rendererError.set(true);
    await fixture.whenStable();
    fixture.componentRef.setInput('themeRevision', 1);
    // Dependent state reconciles on read, without waiting for a synchronization effect.
    expect(state.state().kind).toBe('ready');
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')).toBeNull();
  });
});
