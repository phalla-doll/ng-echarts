# Radial progress API

Experimental NG18 increment, private `0.1.0-rc.6`. Import `RadialProgress` from `@mantha911/ng-echarts/radial`. The focused entry leaves the compatibility root and its existing engines unchanged. Original code is MIT licensed; no public npm release is available.

## Example

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RadialProgress } from '@mantha911/ng-echarts/radial';

@Component({
  selector: 'app-goal-progress',
  imports: [RadialProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nec-radial-progress
    title="Monthly visit goal"
    description="Visits completed toward a monthly goal of 10,000."
    [value]="completed()" [max]="10000" theme="light"
  />`,
})
export class GoalProgress {
  readonly completed = signal<number | null>(6800);
}
```

## Inputs

| Input | Default | Meaning |
| --- | --- | --- |
| `title: string` | Required | Nonempty accessible name and chart heading |
| `value: number \| null` | Required | Completed work; null means no observation |
| `max: number` | `100` | Explicit positive finite target |
| `description: string` | `''` | Context, including units or what completion means |
| `height: number` | `240` | Positive finite plot height in CSS pixels; surrounding title/status adds height |
| `theme: ChartTheme` | `'light'` | Light or dark fallback palette |
| `themeRevision: number` | `0` | Finite revision that refreshes inherited CSS tokens |
| `locale: string` | `'en-US'` | Number/percentage locale; surrounding interface text is English |
| `numberFormatOptions` | Undefined | Immutable `Intl.NumberFormatOptions` for raw value/maximum |
| `valueFormatter: ValueFormatter` | Undefined | Pure synchronous raw-value/maximum formatter returning text |
| `loading: boolean` | `false` | Loading state, without a stale completed value |
| `error: string \| null` | `null` | Application error message |
| `animation: boolean` | `true` | Decorative ring motion; reduced-motion preference overrides it |

All numeric observations must be finite. The maximum must be greater than zero, and a supplied value must be within 0..max. Invalid values produce an error instead of being silently clamped. Zero and full completion are ready states; null is empty. Negative zero displays as zero. Fractional maxima and values are allowed. The renderer uses normalized weights to avoid overflowing very large finite ranges; native semantics retain the raw numbers.

This component represents completed work toward a goal. Use a meter for a general bounded measurement such as battery/fuel level; an indeterminate task, multiring indicator or generic gauge is outside this increment. See the [HTML progress standard](https://html.spec.whatwg.org/multipage/form-elements.html#the-progress-element) and [WAI guidance](https://www.w3.org/WAI/ARIA/apg/patterns/meter/).

## Presentation and accessibility

The visible ring starts at the top and fills clockwise. Its center shows a localized percentage (at most one decimal place) and formatted value/maximum. The percentage rounds for display; tiny or nearly complete observations that would round to 0%/100% show `<0.1%`/`>99.9%` instead, reserving exact 0%/100% for actual zero/completion. Raw values remain unchanged. Supply a short value formatter or compact number options for exceptionally long labels. Height 240 is the demonstrated layout; leave sufficient room for the labels when choosing smaller heights.

A named native `<progress value="…" max="…">` supplies the scalar alternative before hydration. Its value text includes the percentage and formatted raw values. The decorative Canvas and duplicate center text are hidden from assistive technology; the progress element remains available to the accessibility tree. It is noninteractive and has no artificial tab stop, point/legend event, tooltip or data table. The demo's optional value field supplies ordinary keyboard editing outside the library indicator.

Application error takes precedence over loading, validation/renderer errors, empty and ready. Loading/empty/error states replace the old native progress value and hide/dispose the plot. A failed renderer offers Retry progress; input changes also permit recovery. When recovery removes a focused Retry control, focus moves to the named chart region with `tabindex=-1`; no progress tab stop is added and external focus is preserved. Ready updates preserve one renderer instance. Null is not misrepresented as zero or as an indeterminate native progress value.

Formatting applies consistently to both raw numbers in visible and accessible text. Consumer formatter text is rendered as text, never HTML. Use matching locale/options/formatter/value/max on server and client. Prefer immutable options and pure callbacks.

Theme CSS tokens follow the [shared theme contract](BAR_CHART_API.md#formatting-themes-and-lifecycle): `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border` (track) and `--nec-series-1` (completed arc). Change `theme` or `themeRevision` to refresh mounted CSS colors. A lazy Pie/Canvas adapter owns rendering and disposal; there is no Gauge or tooltip registration. Resize and reduced-motion changes follow the shared controller policy. Native progress, text and error states render on the server; the Canvas starts only in the browser.

## Verification and limits

The [implementation report](experiments/NG18_RADIAL_PROGRESS.md) owns actual verification and the private candidate evidence. Human screen-reader interpretation and F09/R06/G2/G3/G4 remain pending. Scalar requirements are separate from chart-family point/table requirements; the four-family MVP scope remains unchanged. No public package publication or API stability promise is introduced.
