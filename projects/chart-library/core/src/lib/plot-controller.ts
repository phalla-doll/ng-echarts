export interface PlotPoint {
  readonly rowId: string;
  readonly seriesId: string;
}

export interface PlotRenderer<Option> {
  update(options: Option): void;
  /** A following update owns option rebuilding when optionsPending is true. */
  resize(context?: { readonly optionsPending: boolean }): void;
  dispose(): void;
}

export type PlotRendererFactory<Option> = (
  host: HTMLElement,
  onPoint: (point: PlotPoint) => void,
  onRange?: (rowIds: readonly string[], snapshot: unknown) => void,
  onPreview?: (point: PlotPoint | null) => void,
) => PlotRenderer<Option>;

export interface PlotEnvironment<Option> {
  load(): Promise<PlotRendererFactory<Option>>;
  observe(host: HTMLElement, onResize: () => void): () => void;
  schedule(callback: () => void): number;
  cancel(id: number): void;
}

/** Coordinates browser work; builders and Angular templates never own chart instances. */
export class PlotController<Option> {
  private options: Option | null = null;
  private renderer: PlotRenderer<Option> | null = null;
  private frame: number | null = null;
  private loading = false;
  private dirty = false;
  private generation = 0;
  private destroyed = false;
  private width = 0;
  private height = 0;
  private readonly disconnect: () => void;

  constructor(
    private readonly host: HTMLElement,
    private readonly environment: PlotEnvironment<Option>,
    private readonly onPoint: (point: PlotPoint) => void,
    private readonly onError: () => void,
    private readonly onRange: (rowIds: readonly string[], snapshot: unknown) => void = () => {},
    private readonly onPreview: (point: PlotPoint | null) => void = () => {},
  ) {
    this.disconnect = environment.observe(host, () => this.schedule());
  }

  update(options: Option | null): void {
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
    // A queued observer delivery must not clear another render's pending import.
    if (!this.renderer && this.loading) return;
    const generation = this.generation;
    try {
      if (!this.renderer) {
        this.loading = true;
        const factory = await this.environment.load();
        if (this.destroyed || generation !== this.generation || !this.options) return;
        // Measure again after asynchronous loading; a formerly visible host may now be hidden.
        if (!this.host.clientWidth || !this.host.clientHeight) return;
        this.width = this.host.clientWidth;
        this.height = this.host.clientHeight;
        // Renderer factories initialize at the host's current size.
        this.renderer = factory(this.host, this.onPoint, this.onRange, this.onPreview);
        this.dirty = true;
      }
      const width = this.host.clientWidth;
      const height = this.host.clientHeight;
      if (width !== this.width || height !== this.height) {
        this.renderer.resize({ optionsPending: this.dirty });
        this.width = width;
        this.height = height;
      }
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
    this.width = this.height = 0;
  }

  private cancelFrame(): void {
    if (this.frame !== null) this.environment.cancel(this.frame);
    this.frame = null;
  }
}
