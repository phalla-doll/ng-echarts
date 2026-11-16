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
  #options: Option | null = null;
  #renderer: PlotRenderer<Option> | null = null;
  #frame: number | null = null;
  #loading = false;
  #dirty = false;
  #generation = 0;
  #destroyed = false;
  #width = 0;
  #height = 0;
  readonly #disconnect: () => void;

  readonly #host: HTMLElement;
  readonly #environment: PlotEnvironment<Option>;
  readonly #onPoint: (point: PlotPoint) => void;
  readonly #onError: () => void;
  readonly #onRange: (rowIds: readonly string[], snapshot: unknown) => void;
  readonly #onPreview: (point: PlotPoint | null) => void;

  constructor(
    host: HTMLElement,
    environment: PlotEnvironment<Option>,
    onPoint: (point: PlotPoint) => void,
    onError: () => void,
    onRange: (rowIds: readonly string[], snapshot: unknown) => void = () => {},
    onPreview: (point: PlotPoint | null) => void = () => {},
  ) {
    this.#host = host;
    this.#environment = environment;
    this.#onPoint = onPoint;
    this.#onError = onError;
    this.#onRange = onRange;
    this.#onPreview = onPreview;

    this.#disconnect = environment.observe(host, () => this.#schedule());
  }

  update(options: Option | null): void {
    if (this.#destroyed) return;
    this.#options = options;
    this.#dirty = true;
    if (options === null) {
      this.#generation++;
      this.#loading = false;
      this.#cancelFrame();
      this.#disposeRenderer();
      return;
    }
    this.#schedule();
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#generation++;
    this.#cancelFrame();
    this.#disconnect();
    this.#disposeRenderer();
  }

  #schedule(): void {
    if (this.#destroyed || !this.#options || this.#frame !== null) return;
    this.#frame = this.#environment.schedule(() => {
      this.#frame = null;
      void this.#render();
    });
  }

  async #render(): Promise<void> {
    if (this.#destroyed || !this.#options || !this.#host.clientWidth || !this.#host.clientHeight)
      return;
    // A queued observer delivery must not clear another render's pending import.
    if (!this.#renderer && this.#loading) return;
    const generation = this.#generation;
    try {
      if (!this.#renderer) {
        this.#loading = true;
        const factory = await this.#environment.load();
        if (this.#destroyed || generation !== this.#generation || !this.#options) return;
        // Measure again after asynchronous loading; a formerly visible host may now be hidden.
        if (!this.#host.clientWidth || !this.#host.clientHeight) return;
        this.#width = this.#host.clientWidth;
        this.#height = this.#host.clientHeight;
        // Renderer factories initialize at the host's current size.
        this.#renderer = factory(this.#host, this.#onPoint, this.#onRange, this.#onPreview);
        this.#dirty = true;
      }
      const width = this.#host.clientWidth;
      const height = this.#host.clientHeight;
      if (width !== this.#width || height !== this.#height) {
        this.#renderer.resize({ optionsPending: this.#dirty });
        this.#width = width;
        this.#height = height;
      }
      if (this.#dirty && this.#options) {
        this.#renderer.update(this.#options);
        this.#dirty = false;
      }
    } catch {
      if (!this.#destroyed && generation === this.#generation) {
        this.#options = null;
        this.#generation++;
        this.#loading = false;
        this.#cancelFrame();
        this.#disposeRenderer();
        this.#onError();
      }
    } finally {
      if (generation === this.#generation) this.#loading = false;
    }
  }

  #disposeRenderer(): void {
    this.#renderer?.dispose();
    this.#renderer = null;
    this.#width = this.#height = 0;
  }

  #cancelFrame(): void {
    if (this.#frame !== null) this.#environment.cancel(this.#frame);
    this.#frame = null;
  }
}
