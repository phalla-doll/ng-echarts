import type { EChartsType } from 'echarts/core';
import type { BarRangeOptions } from './bar-render-options';

/** Snap in supplied category order, including either endpoint and clipped release coordinates. */
export function rangeIndex(position: number, span: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.floor((position / span) * count)));
}

/** The adapter owns transient pointer state; committed selection always belongs to Angular. */
export function createBarRangeSurface(
  host: HTMLElement,
  chart: Pick<EChartsType, 'convertToPixel' | 'containPixel' | 'getWidth' | 'getHeight'>,
  onRange: (ids: readonly string[], snapshot: unknown) => void,
) {
  const document = host.ownerDocument;
  const window = document.defaultView!;
  let options: BarRangeOptions | null = null;
  let surface: HTMLDivElement | null = null;
  let band: HTMLDivElement | null = null;
  let draft: { pointer: number; start: number; position: number; current: number } | null = null;
  let span = 0;

  const cancel = () => {
    const pointer = draft?.pointer;
    draft = null;
    if (band) band.hidden = true;
    if (pointer !== undefined && surface?.hasPointerCapture(pointer))
      surface.releasePointerCapture(pointer);
  };
  const coordinate = (event: PointerEvent) => {
    const box = surface!.getBoundingClientRect();
    return options!.horizontal ? event.clientY - box.top : event.clientX - box.left;
  };
  const paint = () => {
    if (!draft || !options || !band) return;
    const first = Math.min(draft.start, draft.current),
      last = Math.max(draft.start, draft.current);
    const start = `${(first / options.ids.length) * 100}%`;
    const size = `${((last - first + 1) / options.ids.length) * 100}%`;
    Object.assign(
      band.style,
      options.horizontal
        ? { top: start, height: size, left: '0', width: '100%' }
        : { left: start, width: size, top: '0', height: '100%' },
    );
    band.hidden = false;
  };
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) {
      cancel();
      return;
    }
    if (!surface || !options || span <= 0) return;
    const position = coordinate(event);
    const index = rangeIndex(position, span, options.ids.length);
    draft = { pointer: event.pointerId, start: index, current: index, position };
    event.preventDefault();
    surface.setPointerCapture(event.pointerId);
    event.stopPropagation();
  };
  const move = (event: PointerEvent) => {
    if (!draft || draft.pointer !== event.pointerId || !options) return;
    if (Math.abs(coordinate(event) - draft.position) < 4 && band?.hidden) return;
    draft.current = rangeIndex(coordinate(event), span, options.ids.length);
    paint();
    event.stopPropagation();
  };
  const up = (event: PointerEvent) => {
    if (!draft || draft.pointer !== event.pointerId || !options) return;
    const moved = Math.abs(coordinate(event) - draft.position) >= 4;
    const end = rangeIndex(coordinate(event), span, options.ids.length);
    const ids = options.ids.slice(Math.min(draft.start, end), Math.max(draft.start, end) + 1);
    cancel();
    event.stopPropagation();
    if (moved) onRange(ids, options.snapshot);
  };
  const key = (event: KeyboardEvent) => {
    if (event.key === 'Escape') cancel();
  };
  const click = (event: Event) => event.stopPropagation();
  const remove = () => {
    cancel();
    if (!surface) return;
    surface.remove();
    surface = band = null;
    window.removeEventListener('keydown', key);
    window.removeEventListener('blur', cancel);
    window.removeEventListener('scroll', cancel, true);
    document.removeEventListener('visibilitychange', cancel);
  };
  const update = (next: BarRangeOptions | null) => {
    cancel();
    options = next;
    if (!next?.ids.length) {
      remove();
      return;
    }
    const horizontal = next.horizontal;
    const category = Number(
      chart.convertToPixel(horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 }, next.ids[0]!),
    );
    const zero = Number(
      chart.convertToPixel(horizontal ? { xAxisIndex: 0 } : { yAxisIndex: 0 }, 0),
    );
    const inside: [number, number] = horizontal ? [zero, category] : [category, zero];
    if (!inside.every(Number.isFinite) || !chart.containPixel({ gridIndex: 0 }, inside)) {
      remove();
      return;
    }
    // Locate the actual outer-bounds-adjusted grid through public containment queries.
    // Hard-coded padding would drift when fonts, signed ticks or host widths change.
    const edge = (axis: 0 | 1, lower: boolean, extent: number) => {
      let low = lower ? 0 : inside[axis],
        high = lower ? inside[axis] : extent;
      for (let i = 0; i < 16; i++) {
        const mid = (low + high) / 2;
        const point: [number, number] = [...inside];
        point[axis] = mid;
        if (chart.containPixel({ gridIndex: 0 }, point) === lower) high = mid;
        else low = mid;
      }
      return lower ? high : low;
    };
    const left = edge(0, true, chart.getWidth()),
      right = edge(0, false, chart.getWidth());
    const top = edge(1, true, chart.getHeight()),
      bottom = edge(1, false, chart.getHeight());
    span = horizontal ? bottom - top : right - left;
    if (span <= 0) {
      remove();
      return;
    }
    if (!surface) {
      surface = document.createElement('div');
      band = document.createElement('div');
      surface.className = 'nec-range-surface';
      band.className = 'nec-range-draft';
      band.hidden = true;
      surface.setAttribute('aria-hidden', 'true');
      surface.style.cssText = 'position:absolute;z-index:1;cursor:crosshair;user-select:none';
      band.style.cssText =
        'position:absolute;box-sizing:border-box;pointer-events:none;border:1px solid';
      surface.append(band);
      host.append(surface);
      surface.addEventListener('pointerdown', down);
      surface.addEventListener('pointermove', move);
      surface.addEventListener('pointerup', up);
      surface.addEventListener('pointercancel', cancel);
      surface.addEventListener('lostpointercapture', cancel);
      surface.addEventListener('click', click);
      window.addEventListener('keydown', key);
      window.addEventListener('blur', cancel);
      window.addEventListener('scroll', cancel, true);
      document.addEventListener('visibilitychange', cancel);
    }
    Object.assign(surface.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${right - left}px`,
      height: `${bottom - top}px`,
      touchAction: horizontal ? 'pan-x pinch-zoom' : 'pan-y pinch-zoom',
      outline: `1px dashed ${next.fill}`,
      outlineOffset: '-1px',
    });
    Object.assign(band!.style, {
      borderColor: next.color,
      background: `color-mix(in srgb, ${next.fill} 45%, transparent)`,
    });
  };
  return { update, resize: cancel, dispose: remove };
}
