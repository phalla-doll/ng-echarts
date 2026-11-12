import type { Page } from '@playwright/test';

export interface ResourceCounts {
  resizeObservers: number;
  observedTargets: number;
  motionListeners: number;
  frames: number;
}
declare global {
  interface Window {
    chartAudit: ResourceCounts;
  }
}

/** Instrument native resources before application code; retain counts, never chart/DOM references. */
export async function installResourceAudit(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const counts = { resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 };
    window.chartAudit = counts;
    const NativeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends NativeObserver {
      private readonly targets = new Set<Element>();
      override observe(target: Element, options?: ResizeObserverOptions): void {
        if (!this.targets.has(target)) {
          if (!this.targets.size) counts.resizeObservers++;
          this.targets.add(target);
          counts.observedTargets++;
        }
        super.observe(target, options);
      }
      override unobserve(target: Element): void {
        if (this.targets.delete(target)) {
          counts.observedTargets--;
          if (!this.targets.size) counts.resizeObservers--;
        }
        super.unobserve(target);
      }
      override disconnect(): void {
        if (this.targets.size) counts.resizeObservers--;
        counts.observedTargets -= this.targets.size;
        this.targets.clear();
        super.disconnect();
      }
    };
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const result = matchMedia(query);
      if (query !== '(prefers-reduced-motion: reduce)') return result;
      const add = result.addEventListener.bind(result);
      const remove = result.removeEventListener.bind(result);
      const listeners = new Set<EventListenerOrEventListenerObject>();
      result.addEventListener = (type, listener, options) => {
        if (type === 'change' && listener && !listeners.has(listener)) {
          listeners.add(listener);
          counts.motionListeners++;
        }
        add(type, listener, options);
      };
      result.removeEventListener = (type, listener, options) => {
        if (type === 'change' && listener && listeners.delete(listener)) counts.motionListeners--;
        remove(type, listener, options);
      };
      return result;
    };
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    const pending = new Set<number>();
    window.requestAnimationFrame = (callback) => {
      const id = request((time) => {
        pending.delete(id);
        counts.frames = pending.size;
        callback(time);
      });
      pending.add(id);
      counts.frames = pending.size;
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      pending.delete(id);
      counts.frames = pending.size;
      cancel(id);
    };
  });
}

export function collectBrowserErrors(page: Page, expectedAsset?: string): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error' && !/NG05\d+/.test(message.text())) return;
    if (
      expectedAsset &&
      (message.location().url.includes(expectedAsset) ||
        message.text().includes(expectedAsset) ||
        /^Failed to load resource: net::ERR_FAILED/.test(message.text()))
    )
      return;
    errors.push(message.text());
  });
  return errors;
}
