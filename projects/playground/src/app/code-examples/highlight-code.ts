import { computed, Directive, input } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

const highlighter = hljs.newInstance();
highlighter.registerLanguage('typescript', typescript);
highlighter.registerLanguage('xml', xml);
highlighter.registerLanguage('bash', bash);

const languages = new Map([
  ['typescript', 'typescript'],
  ['ts', 'typescript'],
  ['html', 'xml'],
  ['angular', 'xml'],
  ['xml', 'xml'],
  ['terminal', 'bash'],
  ['shell', 'bash'],
  ['bash', 'bash'],
]);

function highlightSource(source: string, language: string): string {
  const grammar = languages.get(language.trim().toLowerCase());
  if (grammar) return highlighter.highlight(source, { language: grammar }).value;
  return source.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
}

/** Deterministic SSR markup; Angular sanitizes this normal HTML binding. */
@Directive({
  selector: 'code[appHighlight]',
  host: { class: 'syntax-code', '[innerHTML]': 'highlighted()' },
})
export class HighlightCode {
  readonly source = input.required<string>({ alias: 'appHighlight' });
  readonly language = input('typescript');
  protected readonly highlighted = computed(() => highlightSource(this.source(), this.language()));
}
