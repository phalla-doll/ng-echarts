import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BAR_RENDERER_LOADER } from './bar-browser';
import { BarChart } from './bar-chart';

describe('bar motion preferences at the renderer boundary', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('honors initial and changed reduced motion and explicit animation disablement', async () => {
    const events = new EventTarget();
    const preference = {
      matches: true,
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
    };
    vi.stubGlobal('matchMedia', () => preference);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      setTimeout(() => callback(0), 0),
    );
    vi.stubGlobal('cancelAnimationFrame', clearTimeout);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(768);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const update = vi.fn();
    const dispose = vi.fn();
    const factory = vi.fn(() => ({ update, resize: vi.fn(), dispose }));
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: BAR_RENDERER_LOADER, useValue: async () => factory },
      ],
    });
    const fixture = TestBed.createComponent(
      BarChart<{ id: string; category: string; value: number }>,
    );
    for (const [key, value] of Object.entries({
      title: 'Motion',
      data: [{ id: 'a', category: 'A', value: 1 }],
      series: [{ id: 'value', key: 'value', label: 'Value' }],
      rowIdKey: 'id',
      categoryKey: 'category',
    }))
      fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    await vi.waitFor(() => expect(update).toHaveBeenCalled());
    expect(update.mock.lastCall?.[0].chart.animation).toBe(false);
    const changeMotion = async (matches: boolean) => {
      preference.matches = matches;
      events.dispatchEvent(Object.assign(new Event('change'), { matches }));
      await fixture.whenStable();
    };
    await changeMotion(false);
    await vi.waitFor(() => expect(update.mock.lastCall?.[0].chart.animation).toBe(true));
    fixture.componentRef.setInput('animation', false);
    await fixture.whenStable();
    await vi.waitFor(() => expect(update.mock.lastCall?.[0].chart.animation).toBe(false));
    await changeMotion(true);
    await changeMotion(false);
    expect(update.mock.lastCall?.[0].chart.animation).toBe(false);
    expect(factory).toHaveBeenCalledTimes(1);
    fixture.destroy();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('refreshes the error-frame theme while duplicate series identifiers are corrected', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }));
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      setTimeout(() => callback(0), 0),
    );
    vi.stubGlobal('cancelAnimationFrame', clearTimeout);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(768);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const update = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: BAR_RENDERER_LOADER,
          useValue: async () => () => ({ update, resize() {}, dispose() {} }),
        },
      ],
    });
    const fixture = TestBed.createComponent(
      BarChart<{ id: string; category: string; value: number }>,
    );
    const series = [{ id: 'value', key: 'value', label: 'Value' }];
    for (const [key, value] of Object.entries({
      title: 'Theme recovery',
      data: [{ id: 'a', category: 'A', value: 1 }],
      series,
      rowIdKey: 'id',
      categoryKey: 'category',
    }))
      fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    await vi.waitFor(() => expect(update).toHaveBeenCalled());
    const host: HTMLElement = fixture.nativeElement;
    const background = () =>
      host
        .querySelector<HTMLElement>('nec-chart-frame')!
        .style.getPropertyValue('--_nec-default-background');
    expect(background()).toBe('#ffffff');
    fixture.componentRef.setInput('series', [series[0], series[0]]);
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')?.textContent).toContain('unique, nonempty');
    fixture.componentRef.setInput('theme', 'dark');
    await fixture.whenStable();
    expect(background()).toBe('#18202c');
    fixture.componentRef.setInput('series', series);
    await fixture.whenStable();
    expect(host.querySelector('[role=alert]')).toBeNull();
    expect(background()).toBe('#18202c');
    fixture.destroy();
  });
});
