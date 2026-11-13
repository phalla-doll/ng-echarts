import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Heroicons v2.2.0 (MIT, Tailwind Labs, Inc.), plus original line/area/composed glyphs.
// All icons share a 24 px view box, 1.5 stroke, and currentColor.
// Source revision and icon mapping: docs/UPSTREAM_PROVENANCE.md.
// Full notice: projects/playground/public/third-party/heroicons-LICENSE.txt.
const paths = {
  composed: ['M3 3.75v16.5h18', 'M6 18v-5h3v5m3 0v-8h3v8', 'm5 10 5-5 5 3 6-5'],
  line: ['M3 3.75v16.5h18', 'm6 15 4-5 4 3 7-7'],
  area: ['M3 3.75v16.5h18', 'm6 15 4-5 4 3 7-7v12H6Z'],
  sliders: [
    'M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75',
  ],
  pie: ['M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z', 'M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z'],
  chart: [
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  ],
  compare: ['M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'],
  update: [
    'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
  ],
  layers: [
    'M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3',
  ],
  leave: [
    'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9',
  ],
  code: ['M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5'],
  sun: [
    'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
  ],
  moon: [
    'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
  ],
  menu: ['M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'],
  close: ['M6 18 18 6M6 6l12 12'],
  chevron: ['m8.25 4.5 7.5 7.5-7.5 7.5'],
  copy: [
    'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75',
  ],
  check: ['m4.5 12.75 6 6 9-13.5'],
  arrow: ['m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25'],
  book: [
    'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  ],
} as const;

@Component({
  selector: 'app-site-icon',
  template: `<svg
    viewBox="0 0 24 24"
    focusable="false"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    @for (path of iconPaths(); track $index) {
      <path
        [attr.d]="path"
        [attr.fill]="name() === 'area' && $index === 1 ? 'currentColor' : 'none'"
        [attr.fill-opacity]="name() === 'area' && $index === 1 ? 0.18 : null"
      />
    }
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 16px;
      height: 16px;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteIcon {
  readonly name = input.required<keyof typeof paths>();
  protected readonly iconPaths = computed(() => paths[this.name()]);
}
