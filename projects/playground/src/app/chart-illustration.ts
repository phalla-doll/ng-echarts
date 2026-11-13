import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-illustration',
  template: `<svg viewBox="0 0 260 140" fill="none" aria-hidden="true">
    <path
      d="M20 30H240M20 65H240M20 100H240M55 15V125M100 15V125M145 15V125M190 15V125M235 15V125"
      stroke="var(--site-border)"
      stroke-width=".5"
    />
    @switch (kind()) {
      @case ('bar') {
        <g fill="var(--site-muted)" opacity=".35">
          <rect x="34" y="68" width="24" height="52" rx="2" />
          <rect x="94" y="88" width="24" height="32" rx="2" />
          <rect x="154" y="52" width="24" height="68" rx="2" />
          <rect x="214" y="76" width="24" height="44" rx="2" />
        </g>
        <g fill="var(--gallery-primary)">
          <rect x="62" y="48" width="24" height="72" rx="2" />
          <rect x="122" y="23" width="24" height="97" rx="2" />
          <rect x="182" y="61" width="24" height="59" rx="2" />
        </g>
        <path d="M20 120H240" stroke="var(--site-muted)" />
      }
      @case ('line') {
        <path
          d="m25 108 33-18 35 12 36-60 36 35 43-52 27 18"
          stroke="var(--site-muted)"
          stroke-width="2"
        />
        <circle cx="208" cy="25" r="4" fill="var(--site-muted)" />
      }
      @case ('area') {
        <path
          d="m25 108 33-18 35 12 36-60 36 35 43-52 27 18v77H25Z"
          fill="var(--site-muted)"
          opacity=".15"
        />
        <path
          d="m25 108 33-18 35 12 36-60 36 35 43-52 27 18"
          stroke="var(--site-muted)"
          stroke-width="2"
        />
      }
      @case ('composed') {
        <path
          d="M35 120V76h26v44m32 0V52h26v68m32 0V65h26v55m32 0V30h26v90"
          fill="var(--gallery-primary)"
          opacity=".7"
        />
        <path
          d="m25 86 33-16 35 6 36-36 36 12 43-30 27 5"
          stroke="var(--gallery-secondary)"
          stroke-width="3"
        />
      }
      @case ('pie') {
        <circle
          cx="130"
          cy="70"
          r="43"
          stroke="var(--site-muted)"
          stroke-width="24"
          opacity=".25"
        />
        <path d="M130 27a43 43 0 0 1 43 43" stroke="var(--site-muted)" stroke-width="24" />
      }
    }
  </svg>`,
  styles: `
    :host {
      display: block;
    }
    svg {
      display: block;
      width: 100%;
      height: 154px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartIllustration {
  readonly kind = input.required<'bar' | 'line' | 'area' | 'pie' | 'composed'>();
}
