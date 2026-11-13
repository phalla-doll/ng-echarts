import { RenderMode, ServerRoute } from '@angular/ssr';

/** GitHub Pages serves a physical index.html for every discovered demo route. */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
