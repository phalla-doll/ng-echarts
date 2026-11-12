import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { SiteAppearance } from './site-appearance';

describe('Playground', () => {
  it('integrates the built library and follows the shared site theme', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('nec-chart-frame h2')?.textContent).toBe('Device visits by month');
    expect(element.querySelector('main')?.classList.contains('dark')).toBe(true);
    TestBed.inject(SiteAppearance).toggle();
    await fixture.whenStable();
    expect(element.querySelector('main')?.classList.contains('dark')).toBe(false);
  });
});
