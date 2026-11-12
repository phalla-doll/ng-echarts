import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('Playground', () => {
  it('integrates the built library and switches the theme through its button', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('button')!;

    expect(element.querySelector('nec-chart-frame h2')?.textContent).toBe('Bar chart prototype');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    await fixture.whenStable();

    expect(element.querySelector('main')?.classList.contains('dark')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('Use light theme');
  });
});
