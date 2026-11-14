import { TestBed } from '@angular/core/testing';
import { Component, inject } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DemoRendererPreloads } from './demo-preloads';

@Component({ template: '' })
class PreloadHost {
  private readonly preloads = inject(DemoRendererPreloads);
}

it('warms only local sidebar destinations on intent and removes its listeners on teardown', async () => {
  const events = new Subject<NavigationStart>();
  const manifest = document.createElement('script');
  manifest.id = 'demo-preloads';
  manifest.type = 'application/json';
  manifest.textContent = JSON.stringify({
    base: '/ng-echarts/',
    routes: {
      line: [{ href: 'line.js', rel: 'modulepreload' }],
      pie: [{ href: 'pie.js', rel: 'modulepreload' }],
      calendar: [{ href: 'calendar.js', rel: 'modulepreload' }],
    },
  });
  const sidebar = document.createElement('nav');
  sidebar.id = 'site-navigation';
  sidebar.innerHTML =
    '<a href="/ng-echarts/line"><span>Line</span></a><a href="/ng-echarts/pie">Pie</a><a href="/ng-echarts/installation">Docs</a><a href="https://example.com/ng-echarts/calendar">External</a>';
  document.head.append(manifest);
  document.body.append(sidebar);
  TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: { events } }] });
  try {
    const fixture = TestBed.createComponent(PreloadHost);
    await fixture.whenStable();
    const links = sidebar.querySelectorAll('a');
    links[0]!.firstElementChild!.dispatchEvent(new Event('pointerover', { bubbles: true }));
    links[0]!.dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(document.querySelectorAll('link[href="/ng-echarts/line.js"]')).toHaveLength(1);
    links[1]!.dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(document.querySelectorAll('link[href="/ng-echarts/pie.js"]')).toHaveLength(1);
    links[2]!.dispatchEvent(new Event('pointerover', { bubbles: true }));
    links[3]!.dispatchEvent(new Event('pointerover', { bubbles: true }));
    expect(document.querySelector('link[href="/ng-echarts/calendar.js"]')).toBeNull();
    events.next(new NavigationStart(1, '/line?theme=dark#plot'));
    expect(document.querySelectorAll('link[href="/ng-echarts/line.js"]')).toHaveLength(1);
    TestBed.resetTestingModule();
    sidebar.querySelector('a')!.setAttribute('href', '/ng-echarts/calendar');
    links[0]!.dispatchEvent(new Event('pointerover', { bubbles: true }));
    events.next(new NavigationStart(2, '/calendar'));
    expect(document.querySelector('link[href="/ng-echarts/calendar.js"]')).toBeNull();
  } finally {
    TestBed.resetTestingModule();
    manifest.remove();
    sidebar.remove();
    document.querySelectorAll('link[href^="/ng-echarts/"]').forEach((link) => link.remove());
  }
});
