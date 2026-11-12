import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const paths = {
  chart: 'M4 20V11h4v9M10 20V4h4v16M16 20V8h4v12',
  compare: 'M4 5h6v14H4zM14 5h6v14h-6z',
  update: 'M20 10a8 8 0 0 0-14-4L3 9m0-6v6h6M4 14a8 8 0 0 0 14 4l3-3m0 6v-6h-6',
  layers: 'm3 7 9-4 9 4-9 4-9-4m0 5 9 4 9-4M3 17l9 4 9-4',
  leave: 'M14 4H5v16h9m-3-8h10m-4-4 4 4-4 4',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M20 15a8 8 0 0 1-11-11 8 8 0 1 0 11 11Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M18 6 6 18',
  chevron: 'm9 5 7 7-7 7',
  copy: 'M9 9h11v12H9zM15 9V3H3v12h6',
  check: 'm5 12 4 4L19 6',
  arrow: 'M5 19 19 5M7 5h12v12',
  book: 'M3 4h6a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3V4Zm18 0h-6a3 3 0 0 0-3 3m0 14a3 3 0 0 1 3-3h6V4Z',
  line: 'M3 18 8 10l5 4 8-10M3 4v17h18',
  area: 'm3 16 5-7 6 4 7-8v16H3V4',
  pie: 'M12 3v9h9a9 9 0 1 1-9-9Zm4 0a9 9 0 0 1 5 5h-5V3Z',
} as const;

@Component({
  selector: 'app-site-icon',
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path [attr.d]="path()" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 18px;
      height: 18px;
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
  protected readonly path = computed(() => paths[this.name()]);
}
