import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightCode } from './highlight-code';

@Component({
  imports: [HighlightCode],
  template: '<code [appHighlight]="source()" [language]="language()"></code>',
})
class Example {
  readonly source = signal('');
  readonly language = signal('typescript');
}

describe('highlighted source text', () => {
  it('preserves source characters and escapes markup rather than creating executable elements', async () => {
    const fixture = TestBed.createComponent(Example);
    const source = `const label = '<img src=x onerror="alert(1)">';\n// <script>bad()</script>\n`;
    fixture.componentInstance.source.set(source);
    await fixture.whenStable();
    const code = fixture.nativeElement.querySelector('code') as HTMLElement;
    expect(code.textContent).toBe(source);
    expect(code.querySelector('img, script')).toBeNull();
    expect(code.querySelector('.hljs-keyword')?.textContent).toBe('const');
    expect(code.querySelector('.hljs-string')?.textContent).toContain('<img');
    expect(code.querySelector('.hljs-comment')?.textContent).toContain('<script>');
  });

  it('updates Angular template highlighting while retaining binding syntax and raw text', async () => {
    const fixture = TestBed.createComponent(Example);
    fixture.componentInstance.language.set('html');
    fixture.componentInstance.source.set('<nec-bar-chart [height]="320" theme="dark" />');
    await fixture.whenStable();
    const code = fixture.nativeElement.querySelector('code') as HTMLElement;
    expect(code.textContent).toBe(fixture.componentInstance.source());
    expect(code.querySelector('.hljs-name')?.textContent).toBe('nec-bar-chart');
    fixture.componentInstance.source.set('<nec-bar-chart [height]="400" theme="light" />');
    await fixture.whenStable();
    expect(code.textContent).toBe(fixture.componentInstance.source());
    expect(code.textContent).not.toContain('dark');
  });

  it('renders unsupported languages as escaped plain text, including prototype-like names', async () => {
    const fixture = TestBed.createComponent(Example);
    fixture.componentInstance.language.set('constructor');
    fixture.componentInstance.source.set('<script>bad()</script> & {{ value }}');
    await fixture.whenStable();
    const code = fixture.nativeElement.querySelector('code') as HTMLElement;
    expect(code.textContent).toBe(fixture.componentInstance.source());
    expect(code.children).toHaveLength(0);
  });
});
