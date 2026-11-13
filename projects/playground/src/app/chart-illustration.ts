import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-illustration',
  template: `<svg viewBox="0 0 260 140" fill="none" aria-hidden="true">
    @if (kind() !== 'radar') {
      <path
        d="M20 30H240M20 65H240M20 100H240M55 15V125M100 15V125M145 15V125M190 15V125M235 15V125"
        stroke="var(--site-border)"
        stroke-width=".5"
      />
    }
    @switch (kind()) {
      @case ('radar') {
        <path
          d="m130 14 49 28v56l-49 28-49-28V42Z M130 14v112M81 42l98 56M81 98l98-56m-49-56 25 14v28l-25 14-25-14V56Z"
          stroke="var(--site-border)"
        />
        <path
          d="m130 26 36 25v42l-36 20-30-25V49Z"
          stroke="var(--gallery-secondary)"
          stroke-width="2"
          stroke-dasharray="5 3"
        />
        <path
          d="m130 34 30 22v32l-30 17-24-22V55Z"
          stroke="var(--gallery-primary)"
          stroke-width="2"
          fill="var(--gallery-primary)"
          fill-opacity=".08"
        />
      }
      @case ('bar') {
        <g fill="var(--gallery-secondary)" opacity=".65">
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
          stroke="var(--gallery-primary)"
          stroke-width="2"
        />
        <circle cx="208" cy="25" r="4" fill="var(--gallery-primary)" />
      }
      @case ('area') {
        <path
          d="m25 108 33-18 35 12 36-60 36 35 43-52 27 18v77H25Z"
          fill="var(--gallery-primary)"
          opacity=".15"
        />
        <path
          d="m25 108 33-18 35 12 36-60 36 35 43-52 27 18"
          stroke="var(--gallery-primary)"
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
          stroke="var(--gallery-primary)"
          stroke-width="24"
          opacity=".65"
        />
        <path d="M130 27a43 43 0 0 1 43 43" stroke="var(--gallery-secondary)" stroke-width="24" />
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
  readonly kind = input.required<'bar' | 'line' | 'area' | 'pie' | 'composed' | 'radar'>();
}
