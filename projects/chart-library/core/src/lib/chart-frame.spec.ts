import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChartFrame } from './chart-frame';

@Component({
  imports: [ChartFrame],
  template: `
    <nec-chart-frame [title]="title()" [description]="description()">
      <p data-fixture>Consumer content</p>
    </nec-chart-frame>
  `,
})
class FrameHost {
  readonly title = signal('Monthly revenue');
  readonly description = signal('Revenue in US dollars');
}

describe('ChartFrame integration', () => {
  it('updates accessible text from consumer inputs and preserves projected content', async () => {
    const fixture = TestBed.createComponent(FrameHost);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('section')?.getAttribute('aria-label')).toBe('Monthly revenue');
    expect(element.querySelector('header p')?.textContent).toBe('Revenue in US dollars');

    fixture.componentInstance.title.set('Quarterly revenue');
    fixture.componentInstance.description.set('');
    await fixture.whenStable();

    expect(element.querySelector('h2')?.textContent).toBe('Quarterly revenue');
    expect(element.querySelector('section')?.getAttribute('aria-label')).toBe('Quarterly revenue');
    expect(element.querySelector('header p')).toBeNull();
    expect(element.querySelector('[data-fixture]')?.textContent).toBe('Consumer content');
  });
});
