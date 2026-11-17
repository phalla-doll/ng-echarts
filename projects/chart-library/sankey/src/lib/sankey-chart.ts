import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵbindBrowserPlot,
  ɵreadCartesianTheme,
  ɵdefaultCartesianTheme,
  ɵcreateValueFormatting,
  ɵresolveCartesianState,
  type ɵCartesianThemeTokens,
  type ChartTheme,
  type ValueFormatter,
} from '@mantha911/ng-echarts/core';
import {
  normalizeSankey,
  type SankeyNode,
  type SankeyLink,
  type SankeySelection,
} from './sankey-model';
import type { SankeyView } from './sankey-options';
import { SANKEY_RENDERER_LOADER, scrollFlowViewport } from './sankey-browser';
@Component({
  selector: 'nec-sankey-chart',
  imports: [ChartFrame, ɵChartStage],
  templateUrl: './sankey-chart.html',
  styleUrls: ['./sankey-chart.css', '../../../core/src/lib/chart-controls.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SankeyChart<N extends SankeyNode = SankeyNode, L extends SankeyLink = SankeyLink> {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly showDataTable = input(true);
  readonly valueLabel = input('Value');
  readonly nodes = input.required<readonly N[]>();
  readonly links = input.required<readonly L[]>();
  readonly select = output<SankeySelection<N, L>>();
  readonly theme = input<ChartTheme>('light');
  readonly themeRevision = input(0);
  readonly locale = input('en-US');
  readonly numberFormatOptions = input<Intl.NumberFormatOptions>();
  readonly valueFormatter = input<ValueFormatter>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly animation = input(true);

  readonly #loader = inject(SANKEY_RENDERER_LOADER);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  readonly #browserReady = signal(false);
  readonly #reducedMotion = signal(false);
  readonly #measuredTheme = signal<ɵCartesianThemeTokens | null>(null);
  protected readonly scrollViewport = scrollFlowViewport;
  // A failed renderer stays failed until retry or a relevant input changes.
  protected readonly rendererError = linkedSignal(() => {
    this.model();
    this.#settings();
    this.#formatting();
    return false;
  });
  protected readonly model = computed(() => normalizeSankey(this.nodes(), this.links()));
  readonly #formatting = computed(() => {
    const model = this.model();
    return ɵcreateValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'error'
        ? []
        : [
            ...model.links.map((link) => link.value),
            ...model.nodes.flatMap((node) => [node.incoming, node.outgoing]),
          ],
    );
  });
  readonly #settings = computed(() => ({
    title: this.title(),
    valueLabel: this.valueLabel(),
    theme: this.theme(),
    themeRevision: this.themeRevision(),
    animation: this.animation(),
    loading: this.loading(),
    error: this.error(),
  }));
  protected readonly tokens = computed(
    () => this.#measuredTheme() ?? ɵdefaultCartesianTheme(this.theme()),
  );
  protected readonly hasFlow = computed(() => {
    const model = this.model();
    return model.kind === 'ready' && model.maximum > 0;
  });
  protected readonly plotWidth = computed(() => {
    const model = this.model();
    return model.kind === 'error'
      ? 560
      : Math.max(560, (Math.max(0, ...model.nodes.map((n) => n.depth)) + 1) * 140);
  });
  protected readonly plotHeight = computed(() => {
    const model = this.model();
    return model.kind === 'error' ? 320 : Math.max(320, model.nodes.length * 28);
  });
  protected readonly nodeRows = computed(() => {
    const model = this.model();
    return model.kind === 'error'
      ? []
      : model.nodes.map((node) => ({
          ...node,
          incomingText: this.#formatting().format(node.incoming),
          outgoingText: this.#formatting().format(node.outgoing),
        }));
  });
  protected readonly linkRows = computed(() => {
    const model = this.model();
    return model.kind === 'error'
      ? []
      : model.links.map((link) => ({
          ...link,
          sourceLabel: model.nodes.find((n) => n.id === link.source)!.label,
          targetLabel: model.nodes.find((n) => n.id === link.target)!.label,
          text: this.#formatting().format(link.value),
        }));
  });
  protected readonly state = computed(() => {
    const settings = this.#settings();
    const configurationError =
      typeof settings.valueLabel !== 'string' || !settings.valueLabel.trim()
        ? 'Value label must be nonempty text.'
        : typeof settings.title !== 'string' || !settings.title.trim()
          ? 'Sankey title must be nonempty text.'
          : !['light', 'dark'].includes(settings.theme) || !Number.isFinite(settings.themeRevision)
            ? 'Sankey theme configuration is invalid.'
            : typeof settings.animation !== 'boolean' || typeof settings.loading !== 'boolean'
              ? 'Sankey animation and loading settings must be booleans.'
              : this.#formatting().error;
    const state = ɵresolveCartesianState(
      settings.error,
      typeof settings.loading === 'boolean' && settings.loading,
      this.model(),
      this.rendererError(),
      configurationError,
    );
    return state.kind === 'loading'
      ? { ...state, message: 'Loading flows…' }
      : state.kind === 'empty'
        ? { ...state, message: 'No flow nodes available.' }
        : state;
  });
  readonly #options = computed<SankeyView | null>(() => {
    const model = this.model();
    return this.state().kind === 'ready' && model.kind === 'ready' && this.hasFlow()
      ? {
          nodes: model.nodes,
          links: model.links,
          maximum: model.maximum,
          tokens: this.tokens(),
          animation: this.animation() && !this.#reducedMotion(),
          format: this.#formatting().format,
          valueLabel: this.valueLabel(),
        }
      : null;
  });
  protected selectItem(id: string, kind: string, source: 'plot' | 'table'): void {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind !== 'ready') return;
    if (kind === 'node') {
      const node = model.nodes.find((n) => n.id === id);
      if (node)
        this.select.emit({
          kind: 'node',
          node: node.row,
          incoming: node.incoming,
          outgoing: node.outgoing,
          source,
        });
    } else if (kind === 'link') {
      const link = model.links.find((l) => l.id === id);
      if (link) this.select.emit({ kind: 'link', link, value: link.value, source });
    }
  }
  constructor() {
    ɵbindBrowserPlot({
      host: this.#host.nativeElement,
      plot: () => this.plot().nativeElement,
      load: () => this.#loader(),
      ready: this.#browserReady,
      reducedMotion: this.#reducedMotion,
      options: () => this.#options(),
      readTheme: () => {
        if (!this.#browserReady()) return;
        const theme = this.theme();
        this.themeRevision();
        try {
          this.#measuredTheme.set(
            ɵreadCartesianTheme<{ value: number }>(
              this.#host.nativeElement,
              theme,
              Array.from({ length: 4 }, (_, index) => ({
                id: `stage-${index}`,
                key: 'value' as const,
                label: `Stage ${index + 1}`,
              })),
              this.plot().nativeElement,
            ),
          );
        } catch {
          this.rendererError.set(true);
        }
      },
      focusContext: () => [this.state(), this.nodeRows(), this.linkRows()],
      onPoint: (point) => this.selectItem(point.rowId, point.seriesId, 'plot'),
      onError: () => this.rendererError.set(true),
    });
  }
  protected retryRenderer(): void {
    this.rendererError.set(false);
  }
}
