import { getInstanceByDom, type EChartsType } from 'echarts/core';
import {
  categoryRange,
  type CategoryRangeCancellation,
  type CategoryRangeSelection,
} from './category-range-types';

interface CategoryAxis {
  type?: string;
  data?: unknown[];
}

/** Only this lazy browser module touches DOM/engine APIs; no registration or chart mutation. */
export function bindCategoryRange(
  host: HTMLElement,
  ids: readonly string[],
  select: (selection: CategoryRangeSelection) => void,
  cancel: (reason: CategoryRangeCancellation) => void,
): () => void {
  const window = host.ownerDocument.defaultView!;
  let dispose = () => {};
  // Chart options are applied by a scheduled renderer frame. Cross that frame before sampling
  // coordinates so an immediate Reset zoom -> arm action sees the new category IDs.
  let frame = window.requestAnimationFrame(() => {
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      dispose = bindCurrentPlot(host, ids, select, cancel);
    });
  });
  return () => {
    window.cancelAnimationFrame(frame);
    dispose();
  };
}

function bindCurrentPlot(
  host: HTMLElement,
  ids: readonly string[],
  select: (selection: CategoryRangeSelection) => void,
  cancel: (reason: CategoryRangeCancellation) => void,
): () => void {
  const plot = host.querySelector<HTMLElement>('.plot');
  const chart = plot && getInstanceByDom(plot);
  const option = chart?.getOption();
  const x = (option?.['xAxis'] as CategoryAxis[] | undefined)?.[0];
  const y = (option?.['yAxis'] as CategoryAxis[] | undefined)?.[0];
  const horizontal = y?.type === 'category';
  const axis = horizontal ? y : x;
  if (
    !plot ||
    !chart ||
    plot.hidden ||
    axis?.type !== 'category' ||
    !Array.isArray(ids) ||
    axis.data?.length !== ids.length ||
    !axis.data.every((id, index) => id === ids[index]) ||
    !categoryRange(ids, 0, 0) ||
    (option?.['dataZoom'] as unknown[] | undefined)?.length ||
    (option?.['grid'] as unknown[] | undefined)?.length !== 1
  ) {
    cancel('unavailable');
    return () => {};
  }
  return bindPlot(plot, chart, ids, horizontal, select, cancel);
}

function bindPlot(
  plot: HTMLElement,
  chart: EChartsType,
  ids: readonly string[],
  horizontal: boolean,
  select: (selection: CategoryRangeSelection) => void,
  cancel: (reason: CategoryRangeCancellation) => void,
): () => void {
  const document = plot.ownerDocument;
  const window = document.defaultView!;
  const band = document.createElement('div');
  band.className = 'nec-category-range-draft';
  band.setAttribute('aria-hidden', 'true');
  band.style.cssText =
    'position:absolute;pointer-events:none;box-sizing:border-box;z-index:2;border:1px solid currentColor;background:color-mix(in srgb,currentColor 12%,transparent);display:none';
  const original = {
    position: plot.style.position,
    cursor: plot.style.cursor,
    touchAction: plot.style.touchAction,
  };
  plot.style.position = 'relative';
  plot.style.cursor = 'crosshair';
  if (!horizontal) plot.style.touchAction = 'pan-y pinch-zoom';
  plot.append(band);
  plot.setAttribute('data-category-range', 'ready');
  let ended = false;
  let draft: {
    pointer: number;
    first: number;
    last: number;
    x: number;
    y: number;
    moved: boolean;
    snapshot: string;
    bounds: DOMRect;
    grid: { left: number; right: number; top: number; bottom: number };
  } | null = null;
  const functions = new WeakMap<Function, number>();
  let functionId = 0;
  const fingerprint = () =>
    JSON.stringify(chart.getOption(), (_key, value: unknown) => {
      if (typeof value !== 'function') return value;
      if (!functions.has(value)) functions.set(value, ++functionId);
      return { functionId: functions.get(value) };
    });
  const clear = () => {
    draft = null;
    band.style.display = 'none';
  };
  const stop = (reason: CategoryRangeCancellation) => {
    if (ended) return;
    ended = true;
    clear();
    cancel(reason);
  };
  const coordinate = (event: PointerEvent) => {
    const bounds = plot.getBoundingClientRect();
    return [
      ((event.clientX - bounds.left) * chart.getWidth()) / bounds.width,
      ((event.clientY - bounds.top) * chart.getHeight()) / bounds.height,
    ];
  };
  const index = (point: number[]) => {
    const value = chart.convertFromPixel(
      horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 },
      point[horizontal ? 1 : 0]!,
    );
    return typeof value === 'number' && Number.isFinite(value)
      ? Math.max(0, Math.min(ids.length - 1, Math.round(value)))
      : -1;
  };
  const gridBounds = (point: number[]) => {
    const edge = (dimension: number, before: boolean) => {
      let low = before ? 0 : point[dimension]!;
      let high = before
        ? point[dimension]!
        : dimension === 0
          ? chart.getWidth()
          : chart.getHeight();
      for (let step = 0; step < 14; step++) {
        const middle = (low + high) / 2;
        const probe = [...point];
        probe[dimension] = middle;
        if (chart.containPixel({ gridIndex: 0 }, probe) === before) high = middle;
        else low = middle;
      }
      return (low + high) / 2;
    };
    return {
      left: edge(0, true),
      right: edge(0, false),
      top: edge(1, true),
      bottom: edge(1, false),
    };
  };
  const draw = () => {
    if (!draft) return;
    // Public containPixel probes locate the real grid, including contained axis labels.
    const from = chart.convertToPixel(
      horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 },
      draft.first,
    );
    const to = chart.convertToPixel(horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 }, draft.last);
    if (typeof from !== 'number' || typeof to !== 'number') return;
    const next =
      ids.length > 1
        ? chart.convertToPixel(
            horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 },
            draft.first === 0 ? 1 : draft.first - 1,
          )
        : from;
    const step = typeof next === 'number' && ids.length > 1 ? Math.abs(next - from) : 12;
    const grid = draft.grid;
    const start = Math.max(horizontal ? grid.top : grid.left, Math.min(from, to) - step / 2);
    const end = Math.min(horizontal ? grid.bottom : grid.right, Math.max(from, to) + step / 2);
    Object.assign(
      band.style,
      horizontal
        ? {
            top: `${start}px`,
            height: `${end - start}px`,
            left: `${grid.left}px`,
            width: `${grid.right - grid.left}px`,
          }
        : {
            left: `${start}px`,
            width: `${end - start}px`,
            top: `${grid.top}px`,
            height: `${grid.bottom - grid.top}px`,
          },
    );
    band.style.display = 'block';
  };
  const down = (event: PointerEvent) => {
    if (
      ended ||
      event.button !== 0 ||
      !event.isPrimary ||
      (horizontal && event.pointerType === 'touch')
    )
      return;
    const point = coordinate(event);
    if (!chart.containPixel({ gridIndex: 0 }, point)) return;
    const first = index(point);
    if (first < 0) return;
    if (event.pointerType !== 'touch') event.preventDefault();
    event.stopImmediatePropagation();
    draft = {
      pointer: event.pointerId,
      first,
      last: first,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      snapshot: fingerprint(),
      bounds: plot.getBoundingClientRect(),
      grid: gridBounds(point),
    };
  };
  const move = (event: PointerEvent) => {
    if (!draft || draft.pointer !== event.pointerId || ended) return;
    if (chart.isDisposed() || plot.hidden) {
      stop('context');
      return;
    }
    // A release can precede the ResizeObserver/scroll delivery (notably in WebKit).
    const bounds = plot.getBoundingClientRect();
    if (bounds.width !== draft.bounds.width || bounds.height !== draft.bounds.height) {
      stop('resize');
      return;
    }
    if (bounds.left !== draft.bounds.left || bounds.top !== draft.bounds.top) {
      stop('context');
      return;
    }
    const point = coordinate(event);
    const last = index(point);
    if (last < 0) return;
    draft.last = last;
    draft.moved ||= Math.hypot(event.clientX - draft.x, event.clientY - draft.y) >= 6;
    if (draft.moved) draw();
    event.stopImmediatePropagation();
  };
  const up = (event: PointerEvent) => {
    if (!draft || draft.pointer !== event.pointerId || ended) return;
    move(event);
    if (!draft) return;
    if (draft.snapshot !== fingerprint()) {
      stop('context');
      return;
    }
    const result = draft.moved ? categoryRange(ids, draft.first, draft.last) : null;
    clear();
    event.stopImmediatePropagation();
    if (result) {
      ended = true;
      // The gesture's synthesized click must not become a point action after the parent disarms.
      const blockClick = (click: Event) => {
        click.preventDefault();
        click.stopImmediatePropagation();
      };
      plot.addEventListener('click', blockClick, { capture: true, once: true });
      window.setTimeout(() => plot.removeEventListener('click', blockClick, true), 0);
      select(result);
    }
  };
  const suppress = (event: Event) => {
    if (!ended || draft) event.stopImmediatePropagation();
  };
  const key = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      stop('escape');
    }
  };
  const scroll = () => {
    if (draft) stop('scroll');
  };
  const blur = () => stop('blur');
  const interruption = (event: PointerEvent) => {
    if (draft?.pointer === event.pointerId) stop('pointercancel');
  };
  const rendered = () => {
    if (draft && (plot.hidden || draft.snapshot !== fingerprint())) stop('context');
  };
  const observer = new window.ResizeObserver(() => {
    if (draft) stop('resize');
  });
  observer.observe(plot);
  plot.addEventListener('pointerdown', down, true);
  plot.addEventListener('lostpointercapture', interruption, true);
  plot.addEventListener('click', suppress, true);
  plot.addEventListener('mousedown', suppress, true);
  window.addEventListener('pointermove', move, true);
  window.addEventListener('pointerup', up, true);
  window.addEventListener('pointercancel', interruption, true);
  window.addEventListener('keydown', key, true);
  window.addEventListener('scroll', scroll, true);
  window.addEventListener('blur', blur);
  chart.on('rendered', rendered);
  return () => {
    ended = true;
    clear();
    observer.disconnect();
    chart.off('rendered', rendered);
    plot.removeEventListener('pointerdown', down, true);
    plot.removeEventListener('lostpointercapture', interruption, true);
    plot.removeEventListener('click', suppress, true);
    plot.removeEventListener('mousedown', suppress, true);
    window.removeEventListener('pointermove', move, true);
    window.removeEventListener('pointerup', up, true);
    window.removeEventListener('pointercancel', interruption, true);
    window.removeEventListener('keydown', key, true);
    window.removeEventListener('scroll', scroll, true);
    window.removeEventListener('blur', blur);
    plot.removeAttribute('data-category-range');
    Object.assign(plot.style, original);
    band.remove();
  };
}
