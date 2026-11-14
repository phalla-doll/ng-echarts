import { defaultCartesianTheme, type CartesianThemeTokens } from './cartesian-options';
import type { ChartSeries, ChartTheme } from './chart-types';
import type { PlotRendererFactory, PlotEnvironment, PlotPoint } from './plot-controller';

/** Delegate transient table interactions; large tables do not need per-cell listeners. */
export function observeTablePreviews(
  host: HTMLElement,
  onPreview: (point: PlotPoint | null, trigger: 'pointer' | 'focus') => void,
): () => void {
  const action = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLButtonElement>('tbody button[data-preview-row]')
      : null;
  const handle = (event: Event) => {
    const pointer = event.type.startsWith('pointer');
    if (pointer && (event as PointerEvent).pointerType === 'touch') return;
    const button = action(event.target);
    if (!button || !host.contains(button)) return;
    const related = action((event as FocusEvent).relatedTarget);
    if (related === button) return;
    const leaving = event.type === 'pointerout' || event.type === 'focusout';
    onPreview(
      leaving
        ? null
        : {
            rowId: button.dataset['previewRow']!,
            seriesId: button.dataset['previewSeries']!,
          },
      pointer ? 'pointer' : 'focus',
    );
  };
  const types = ['pointerover', 'pointerout', 'focusin', 'focusout'] as const;
  for (const type of types) host.addEventListener(type, handle);
  // Keyboard focus can arrive before Angular applies the opt-in input. Retain
  // that real focus when attaching, without moving focus or requiring another Tab.
  const focused = action(host.ownerDocument.activeElement);
  if (focused && host.contains(focused))
    onPreview(
      { rowId: focused.dataset['previewRow']!, seriesId: focused.dataset['previewSeries']! },
      'focus',
    );
  return () => {
    for (const type of types) host.removeEventListener(type, handle);
  };
}
export function browserPlotEnvironment<Option>(
  load: () => Promise<PlotRendererFactory<Option>>,
  host: HTMLElement,
): PlotEnvironment<Option> {
  return {
    load: async () => {
      // Canvas text measurements must use the loaded host font from the first render.
      // A failed web font still permits the browser's normal fallback stack.
      const font = getComputedStyle(host).fontFamily || 'system-ui, sans-serif';
      const [factory] = await Promise.all([
        load(),
        host.ownerDocument.fonts?.load(`12px ${font}`).catch(() => undefined),
      ]);
      return factory;
    },
    observe: (host, onResize) => {
      const observer = new ResizeObserver(onResize);
      observer.observe(host);
      return () => observer.disconnect();
    },
    schedule: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
  };
}

/** Resolve inherited typography and CSS colors at the browser boundary. */
export function readCartesianTheme<T>(
  host: HTMLElement,
  theme: ChartTheme,
  series: readonly ChartSeries<T>[],
  plotSurface: HTMLElement,
): CartesianThemeTokens {
  const defaults = defaultCartesianTheme(theme);
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
      fontFamily: styles.fontFamily || defaults.fontFamily,
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
