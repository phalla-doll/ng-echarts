import type { CartesianThemeTokens } from './cartesian-options';

export function escapeTooltipText(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
}

export function tooltipStyle(tokens: CartesianThemeTokens) {
  return {
    backgroundColor: tokens.background,
    borderColor: tokens.border,
    textStyle: { color: tokens.text, fontFamily: tokens.fontFamily, fontSize: 12, lineHeight: 20 },
    padding: [10, 12] as [number, number],
    borderRadius: 8,
    extraCssText:
      'max-width: min(280px, calc(100% - 16px)); white-space: normal; pointer-events: none; box-shadow: 0 4px 16px rgba(0,0,0,.12);',
  };
}

export interface TooltipRow {
  readonly label: string;
  readonly value: string;
  readonly color?: string;
}

/** Escape every consumer-supplied string at the final HTML boundary. */
export function tooltipMarkup(title: string, rows: readonly TooltipRow[]): string {
  const escape = escapeTooltipText;
  return `<div data-nec-tooltip><strong style="display:block;font-weight:600;margin-bottom:6px;overflow-wrap:anywhere">${escape(title)}</strong>${rows
    .map(
      (row) =>
        `<div style="display:flex;align-items:baseline;gap:12px;margin-top:4px">${row.color ? `<span aria-hidden="true" style="flex:none;width:8px;height:8px;border-radius:2px;background:${escape(row.color)}"></span>` : ''}<span style="flex:1;min-width:0;overflow-wrap:anywhere">${escape(row.label)}</span><span style="flex:0 1 auto;min-width:0;max-width:65%;overflow-wrap:anywhere;font-variant-numeric:tabular-nums;text-align:right">${escape(row.value)}</span></div>`,
    )
    .join('')}</div>`;
}
