import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const preloadsPath = join(browserDistFolder, 'demo-preloads.json');
let preloads: {
  base: string;
  routes: Record<string, { href: string; rel: string }[]>;
} | null = null;
try {
  preloads = JSON.parse(readFileSync(preloadsPath, 'utf8'));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '10m',
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      if (/-[\w-]{8,16}\.(?:js|css)$/u.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) return next();
      if (preloads && response.headers.get('content-type')?.includes('text/html')) {
        const route = req.path.replace(/^\/+|\/+$/gu, '');
        const hints = (preloads.routes[route] ?? [])
          .map(
            ({ href, rel }) =>
              `<link rel="${rel}"${rel === 'preload' ? ' as="script"' : ''} href="${preloads.base}${href}">`,
          )
          .join('');
        const manifest = JSON.stringify(preloads).replaceAll('<', '\\u003c');
        const html = (await response.text()).replace(
          '<head>',
          `<head>${hints}<script id="demo-preloads" type="application/json">${manifest}</script>`,
        );
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        response = new Response(html, { status: response.status, headers });
      }
      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  const server = app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : port;
    console.log(`Node Express server listening on http://localhost:${actualPort}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
