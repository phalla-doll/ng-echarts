import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵPlotController,
  ɵChartFocusKeeper,
  ɵbrowserPlotEnvironment,
  ɵreadCartesianTheme,
  ɵdefaultCartesianTheme,
  ɵcreateValueFormatting,
  ɵresolveCartesianState,
  type ɵCartesianThemeTokens,
  type ChartTheme,
  type ValueFormatter,
} from '@ng-echarts/chart-library/core';
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

  private readonly loader = inject(SANKEY_RENDERER_LOADER);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly application = inject(ApplicationRef);
  private readonly platform = inject(PLATFORM_ID);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  private readonly browserReady = signal(false);
  private readonly reducedMotion = signal(false);
  private readonly measuredTheme = signal<ɵCartesianThemeTokens | null>(null);
  private controller: ɵPlotController<SankeyView> | null = null;
  private focusKeeper: ɵChartFocusKeeper | null = null;
  private removeMotionListener: (() => void) | null = null;
  protected readonly scrollViewport = scrollFlowViewport;
  protected readonly rendererError = signal(false);
  protected readonly model = computed(() => normalizeSankey(this.nodes(), this.links()));
  private readonly formatting = computed(() => {
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
  private readonly settings = computed(() => ({
    title: this.title(),
    valueLabel: this.valueLabel(),
    theme: this.theme(),
    themeRevision: this.themeRevision(),
    animation: this.animation(),
    loading: this.loading(),
    error: this.error(),
  }));
  protected readonly tokens = computed(
    () => this.measuredTheme() ?? ɵdefaultCartesianTheme(this.theme()),
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
          incomingText: this.formatting().format(node.incoming),
          outgoingText: this.formatting().format(node.outgoing),
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
          text: this.formatting().format(link.value),
        }));
  });
  protected readonly state = computed(() => {
    const settings = this.settings();
    const configurationError =
      typeof settings.valueLabel !== 'string' || !settings.valueLabel.trim()
        ? 'Value label must be nonempty text.'
        : typeof settings.title !== 'string' || !settings.title.trim()
          ? 'Sankey title must be nonempty text.'
          : !['light', 'dark'].includes(settings.theme) || !Number.isFinite(settings.themeRevision)
            ? 'Sankey theme configuration is invalid.'
            : typeof settings.animation !== 'boolean' || typeof settings.loading !== 'boolean'
              ? 'Sankey animation and loading settings must be booleans.'
              : this.formatting().error;
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
  private readonly options = computed<SankeyView | null>(() => {
    const model = this.model();
    return this.state().kind === 'ready' && model.kind === 'ready' && this.hasFlow()
      ? {
          nodes: model.nodes,
          links: model.links,
          maximum: model.maximum,
          tokens: this.tokens(),
          animation: this.animation() && !this.reducedMotion(),
          format: this.formatting().format,
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
    effect(() => {
      this.model();
      this.settings();
      this.formatting();
      this.rendererError.set(false);
    });
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platform)) return;
      void this.application.whenStable().then(() => {
        if (this.destroyRef.destroyed) return;
        try {
          const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
          this.reducedMotion.set(preference.matches);
          const onMotion = (event: MediaQueryListEvent) => this.reducedMotion.set(event.matches);
          preference.addEventListener('change', onMotion);
          this.removeMotionListener = () => preference.removeEventListener('change', onMotion);
          this.controller = new ɵPlotController(
            this.plot().nativeElement,
            ɵbrowserPlotEnvironment(() => this.loader(), this.host.nativeElement),
            (point) => this.selectItem(point.rowId, point.seriesId, 'plot'),
            () => this.rendererError.set(true),
          );
          this.focusKeeper = new ɵChartFocusKeeper(this.host.nativeElement);
          this.browserReady.set(true);
        } catch {
          this.rendererError.set(true);
        }
      });
    });
    afterRenderEffect(() => {
      if (!this.browserReady()) return;
      const theme = this.theme();
      this.themeRevision();
      try {
        this.measuredTheme.set(
          ɵreadCartesianTheme<{ value: number }>(
            this.host.nativeElement,
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
    });
    afterRenderEffect(() => {
      this.browserReady();
      this.controller?.update(this.options());
    });
    afterRenderEffect(() => {
      this.state();
      this.nodeRows();
      this.linkRows();
      this.focusKeeper?.restore();
    });
    this.destroyRef.onDestroy(() => {
      this.removeMotionListener?.();
      this.controller?.destroy();
      this.focusKeeper?.destroy();
    });
  }
  protected retryRenderer(): void {
    this.rendererError.set(false);
  }
}
