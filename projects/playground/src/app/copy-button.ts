import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { SiteIcon } from './site-icon';

@Component({
  selector: 'app-copy-button',
  imports: [SiteIcon],
  template: `<button
      type="button"
      [class.compact]="compact()"
      (click)="copy()"
      [attr.aria-label]="copied() ? 'Copied' : label()"
    >
      <app-site-icon [name]="copied() ? 'check' : 'copy'" />
      @if (!compact()) {
        {{ copied() ? 'Copied' : label() }}
      }
    </button>
    @if (failed()) {
      <p role="status">Clipboard access is unavailable. Select the source to copy it manually.</p>
    }`,
  styles: `
    :host {
      display: block;
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 32px;
      padding: 5px 10px;
      border: 1px solid var(--site-border);
      border-radius: 6px;
      color: var(--site-muted);
      background: var(--site-surface);
      font-size: 12px;
      line-height: 20px;
      white-space: nowrap;
    }
    button.compact {
      width: 32px;
      justify-content: center;
      padding: 0;
      border-color: transparent;
      background: transparent;
    }
    app-site-icon {
      width: 14px;
      height: 14px;
    }
    p {
      max-width: 240px;
      color: var(--site-muted);
      font-size: 11px;
      line-height: 18px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyButton {
  readonly text = input.required<string>();
  readonly label = input('Copy code');
  readonly compact = input(false);
  private readonly copiedText = signal<string | null>(null);
  protected readonly copied = computed(() => this.copiedText() === this.text());
  protected readonly failed = signal(false);
  protected async copy(): Promise<void> {
    const text = this.text();
    try {
      await navigator.clipboard.writeText(text);
      this.copiedText.set(text);
      this.failed.set(false);
    } catch {
      this.failed.set(true);
    }
  }
}
