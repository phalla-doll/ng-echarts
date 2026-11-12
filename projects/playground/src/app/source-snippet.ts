import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CopyButton } from './copy-button';

@Component({
  selector: 'app-source-snippet',
  imports: [CopyButton],
  template: `<div class="snippet">
    <div class="snippet-heading">
      <span>{{ language() }}</span><app-copy-button
        [text]="source()"
        [label]="'Copy ' + language() + ' example'"
        [compact]="true"
      />
    </div>
    <pre tabindex="0" [attr.aria-label]="language() + ' example'"><code>{{ source() }}</code></pre>
  </div>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
      margin: 24px 0;
    }
    .snippet {
      border: 1px solid var(--site-border);
      padding: 4px;
      border-radius: var(--site-panel-radius);
      background: var(--site-surface);
    }
    .snippet-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 40px;
      padding: 4px 8px;
      color: var(--site-muted);
      font-size: 12px;
      line-height: 20px;
    }
    pre {
      margin: 0;
      padding: 16px;
      max-height: 510px;
      overflow: auto;
      border: 1px solid var(--site-border);
      border-radius: var(--site-inset-radius);
      background: var(--site-bg);
      font-size: 12px;
      line-height: 22px;
    }
    pre:focus-visible {
      outline: 2px solid var(--site-text);
      outline-offset: 3px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceSnippet {
  readonly source = input.required<string>();
  readonly language = input('TypeScript');
}
