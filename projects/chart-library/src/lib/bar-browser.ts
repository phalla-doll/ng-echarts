import { InjectionToken } from '@angular/core';
import { defaultBarTheme, type BarThemeTokens } from './bar-options';
import type { ChartSeries, ChartTheme } from './chart-types';
import type { BarRendererFactory, PlotEnvironment } from './plot-controller';

export const BAR_RENDERER_LOADER = new InjectionToken<() => Promise<BarRendererFactory>>(
  'Bar renderer loader',
  {
    providedIn: 'root',
    factory: () => () => import('./bar-renderer').then((module) => module.createBarRenderer),
  },
);

export function browserPlotEnvironment(load: () => Promise<BarRendererFactory>): PlotEnvironment {
  return {
    load,
    observe: (host, onResize) => {
      const observer = new ResizeObserver(onResize);
      observer.observe(host);
      return () => observer.disconnect();
    },
    schedule: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
  };
}

/** Resolve inherited CSS colors, including modern color syntax, at the browser boundary. */
export function readBarTheme<T>(
  host: HTMLElement,
  theme: ChartTheme,
  series: readonly ChartSeries<T>[],
  plotSurface: HTMLElement,
): BarThemeTokens {
  const defaults = defaultBarTheme(theme);
  const styles = getComputedStyle(host);
  const probe = host.ownerDocument.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
  plotSurface.append(probe);
  const canvas = host.ownerDocument.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const resolve = (raw: string, fallback: string): string => {
    if (!raw || !CSS.supports('color', raw) || !context) return fallback;
    probe.style.color = raw;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = getComputedStyle(probe).color;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return `rgba(${r},${g},${b},${a! / 255})`;
  };
  const token = (name: string, fallback: string): string =>
    resolve(styles.getPropertyValue(`--nec-${name}`).trim(), fallback);
  try {
    return {
      background: token('background', defaults.background),
      text: token('text', defaults.text),
      muted: token('muted', defaults.muted),
      border: token('border', defaults.border),
      series: series.map((item, index) => {
        const fallback = defaults.series[index % defaults.series.length]!;
        return item.color ? resolve(item.color, fallback) : token(`series-${index + 1}`, fallback);
      }),
    };
  } finally {
    probe.remove();
  }
}
