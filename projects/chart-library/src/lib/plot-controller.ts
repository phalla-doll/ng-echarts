import type { BarOption } from './bar-options';

export interface PlotPoint {
  readonly rowId: string;
  readonly seriesId: string;
}

export interface BarRenderer {
  update(options: BarOption): void;
  resize(): void;
  dispose(): void;
}

export type BarRendererFactory = (
  host: HTMLElement,
  onPoint: (point: PlotPoint) => void,
) => BarRenderer;

export interface PlotEnvironment {
  load(): Promise<BarRendererFactory>;
  observe(host: HTMLElement, onResize: () => void): () => void;
  schedule(callback: () => void): number;
  cancel(id: number): void;
}

/** Coordinates browser work; builders and Angular templates never own chart instances. */
export class PlotController {
  private options: BarOption | null = null;
  private renderer: BarRenderer | null = null;
  private frame: number | null = null;
  private loading = false;
  private dirty = false;
  private generation = 0;
  private destroyed = false;
  private readonly disconnect: () => void;

  constructor(
    private readonly host: HTMLElement,
    private readonly environment: PlotEnvironment,
    private readonly onPoint: (point: PlotPoint) => void,
    private readonly onError: () => void,
  ) {
    this.disconnect = environment.observe(host, () => this.schedule());
  }

  update(options: BarOption | null): void {
    if (this.destroyed) return;
    this.options = options;
    this.dirty = true;
    if (options === null) {
      this.generation++;
      this.loading = false;
      this.cancelFrame();
      this.disposeRenderer();
      return;
    }
    this.schedule();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.generation++;
    this.cancelFrame();
    this.disconnect();
    this.disposeRenderer();
  }

  private schedule(): void {
    if (this.destroyed || !this.options || this.frame !== null) return;
    this.frame = this.environment.schedule(() => {
      this.frame = null;
      void this.render();
    });
  }

  private async render(): Promise<void> {
    if (this.destroyed || !this.options || !this.host.clientWidth || !this.host.clientHeight)
      return;
    const generation = this.generation;
    try {
      if (!this.renderer) {
        if (this.loading) return;
        this.loading = true;
        const factory = await this.environment.load();
        if (this.destroyed || generation !== this.generation || !this.options) return;
        // Measure again after asynchronous loading; a formerly visible host may now be hidden.
        if (!this.host.clientWidth || !this.host.clientHeight) return;
        this.renderer = factory(this.host, this.onPoint);
        this.dirty = true;
      }
      this.renderer.resize();
      if (this.dirty && this.options) {
        this.renderer.update(this.options);
        this.dirty = false;
      }
    } catch {
      if (!this.destroyed && generation === this.generation) {
        this.options = null;
        this.generation++;
        this.loading = false;
        this.cancelFrame();
        this.disposeRenderer();
        this.onError();
      }
    } finally {
      if (generation === this.generation) this.loading = false;
    }
  }

  private disposeRenderer(): void {
    this.renderer?.dispose();
    this.renderer = null;
  }

  private cancelFrame(): void {
    if (this.frame !== null) this.environment.cancel(this.frame);
    this.frame = null;
  }
}
