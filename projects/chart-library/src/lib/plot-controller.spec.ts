import {
  PlotController,
  type BarRenderer,
  type BarRendererFactory,
  type PlotEnvironment,
} from './plot-controller';
import type { BarOption } from './bar-options';

function harness() {
  let width = 768;
  let resize = (): void => {};
  const frames = new Map<number, () => void>();
  let nextFrame = 0;
  const renderer: BarRenderer = { update: vi.fn(), resize: vi.fn(), dispose: vi.fn() };
  const factory = vi.fn<BarRendererFactory>(() => renderer);
  const disconnected = vi.fn();
  const environment: PlotEnvironment = {
    load: vi.fn(async () => factory),
    observe: (_host, callback) => {
      resize = callback;
      return disconnected;
    },
    schedule: (callback) => {
      const id = ++nextFrame;
      frames.set(id, callback);
      return id;
    },
    cancel: (id) => {
      frames.delete(id);
    },
  };
  const host = {
    get clientWidth() {
      return width;
    },
    clientHeight: 320,
  } as HTMLElement;
  const onError = vi.fn();
  const controller = new PlotController(host, environment, vi.fn(), onError);
  return {
    controller,
    environment,
    renderer,
    factory,
    onError,
    disconnected,
    setWidth: (value: number) => {
      width = value;
    },
    resize: () => resize(),
    flush: async () => {
      const queued = [...frames.values()];
      frames.clear();
      queued.forEach((callback) => callback());
      await Promise.resolve();
    },
    frames,
  };
}

describe('plot lifecycle coordination', () => {
  it('batches inputs, updates the latest option, and resizes without rebuilding options', async () => {
    const h = harness();
    h.controller.update({ animation: true });
    const latest: BarOption = { animation: false };
    h.controller.update(latest);
    expect(h.frames.size).toBe(1);
    await h.flush();
    expect(h.factory).toHaveBeenCalledTimes(1);
    expect(h.renderer.update).toHaveBeenCalledExactlyOnceWith(latest);
    h.resize();
    await h.flush();
    expect(h.renderer.update).toHaveBeenCalledTimes(1);
    expect(h.renderer.resize).toHaveBeenCalledTimes(2);
    h.controller.destroy();
  });

  it('waits for nonzero dimensions and recovers after a hidden container becomes visible', async () => {
    const h = harness();
    h.setWidth(0);
    h.controller.update({});
    await h.flush();
    expect(h.environment.load).not.toHaveBeenCalled();
    h.setWidth(320);
    h.resize();
    await h.flush();
    expect(h.factory).toHaveBeenCalledTimes(1);
    h.controller.destroy();
  });

  it('never initializes after destruction or after a loading/error state invalidates an import', async () => {
    for (const destroy of [false, true]) {
      const h = harness();
      let complete!: (factory: BarRendererFactory) => void;
      h.environment.load = () =>
        new Promise((resolve) => {
          complete = resolve;
        });
      h.controller.update({});
      await h.flush();
      if (destroy) h.controller.destroy();
      else h.controller.update(null);
      complete(h.factory);
      await Promise.resolve();
      expect(h.factory).not.toHaveBeenCalled();
      expect(h.frames.size).toBe(0);
      h.controller.destroy();
    }
  });

  it('uses the latest inputs when a renderer import resolves', async () => {
    const h = harness();
    let complete!: (factory: BarRendererFactory) => void;
    h.environment.load = () =>
      new Promise((resolve) => {
        complete = resolve;
      });
    h.controller.update({ animation: true });
    await h.flush();
    const latest = { animation: false };
    h.controller.update(latest);
    await h.flush();
    complete(h.factory);
    await Promise.resolve();
    expect(h.renderer.update).toHaveBeenCalledExactlyOnceWith(latest);
    h.controller.destroy();
  });

  it('reports import failure and permits a subsequent input-driven retry', async () => {
    const h = harness();
    h.environment.load = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network'))
      .mockResolvedValue(h.factory);
    h.controller.update({});
    await h.flush();
    expect(h.onError).toHaveBeenCalledTimes(1);
    h.controller.update(null);
    h.controller.update({ animation: false });
    await h.flush();
    expect(h.factory).toHaveBeenCalledTimes(1);
    h.controller.destroy();
  });

  it('disconnects observers and disposes exactly once across 100 mocked mount/destroy cycles', async () => {
    for (let index = 0; index < 100; index++) {
      const h = harness();
      h.controller.update({});
      await h.flush();
      h.resize();
      h.controller.destroy();
      h.controller.destroy();
      expect(h.renderer.dispose).toHaveBeenCalledTimes(1);
      expect(h.disconnected).toHaveBeenCalledTimes(1);
      expect(h.frames.size).toBe(0);
    }
  });
});
