export interface DocSection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly source?: string;
  readonly language?: string;
}
export interface DocPage {
  readonly path: string;
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly DocSection[];
  readonly previous?: { readonly label: string; readonly path: string };
  readonly next: { readonly label: string; readonly path: string };
}

export const quickStartExample = [
  "import { Component } from '@angular/core';",
  "import { BarChart, type ChartSeries } from '@ng-echarts/chart-library/bar';",
  '',
  'interface Visit { id: string; month: string; desktop: number; mobile: number | null; }',
  '',
  '@Component({',
  "  selector: 'app-root',",
  '  imports: [BarChart],',
  '  template: `<nec-bar-chart',
  '    title="Device visits" description="Monthly desktop and mobile visits."',
  '    [data]="visits" rowIdKey="id" categoryKey="month" [series]="series"',
  '    theme="dark" [height]="320"',
  '  />`,',
  '})',
  'export class App {',
  '  readonly visits: readonly Visit[] = [',
  "    { id: 'jan', month: 'January', desktop: 342, mobile: 184 },",
  "    { id: 'feb', month: 'February', desktop: 876, mobile: 491 },",
  '  ];',
  '  readonly series: readonly ChartSeries<Visit>[] = [',
  "    { id: 'desktop', key: 'desktop', label: 'Desktop' },",
  "    { id: 'mobile', key: 'mobile', label: 'Mobile' },",
  '  ];',
  '}',
].join('\n');

export const documentationPages: Readonly<Record<string, DocPage>> = {
  'get-started': {
    path: '/get-started',
    title: 'Get Started',
    intro: 'Native Angular charts, powered by Apache ECharts.',
    sections: [
      {
        id: 'overview',
        title: 'Built for Angular',
        paragraphs: [
          'Use standalone components, typed rows, and a small set of inputs. Angular owns the titles, legends, state messages, and data tables; Apache ECharts renders the plot.',
          'The current collection includes grouped, stacked, horizontal, and gradient bars, plus straight and smooth multi-series lines with optional points and missing-value gaps. Area charts include gradients and stacks; pie/donut charts show category shares with optional labels.',
        ],
      },
      {
        id: 'first-chart',
        title: 'Your first chart',
        paragraphs: [
          'After installing the local package, replace src/app/app.ts in a CLI standalone application with this entire App example. Keep the generated bootstrap and app configuration. Supply stable row and series identifiers, then replace input references when data changes.',
        ],
        source: quickStartExample,
        language: 'TypeScript',
      },
      {
        id: 'included',
        title: 'Included behavior',
        paragraphs: [
          'Bar, line, area, and pie/donut charts support light and dark themes, responsive resizing, tooltips, keyboard-operable legends, and an optional data table enabled by default. Gallery previews omit the table controls; inspect their datasets in the Code tab. The playground retains the table and its keyboard actions. Plot and table actions emit the original numeric values.',
          'Loading, empty, and error states preserve plot geometry and retain unavailable controls as inert space. Browser initialization is deferred safely in server-rendered applications, and reduced-motion preferences override decorative animation.',
        ],
      },
      {
        id: 'status',
        title: 'Project status',
        paragraphs: [
          'The library is experimental and the package is private. Use the workspace or a packed local build; a public npm installation is not available yet. Automated acceptance covers the four MVP families, the first shared-axis composed increment, experimental radar, radial progress, calendar heatmaps and Sankey flows. Human screen-reader interpretation and final artifact/release acceptance remain pending.',
        ],
      },
    ],
    next: { label: 'Installation', path: '/installation' },
  },
  installation: {
    path: '/installation',
    title: 'Installation',
    intro: 'Build the local library and start exploring its Angular examples.',
    sections: [
      {
        id: 'requirements',
        title: 'Requirements',
        paragraphs: [
          'Use the Node version in .nvmrc (24.22.2) and npm 11.19.1. This workspace pins Angular 22.2.6, TypeScript 6.0.3, and ECharts 6.1.0.',
          'The package has not been published. The commands below use the project workspace and its local build output.',
        ],
      },
      {
        id: 'workspace',
        title: 'Run the workspace',
        paragraphs: [
          'Clone the repository, install the locked dependencies, and build the library before starting the site. Port 4310 keeps Angular’s default port free.',
        ],
        source:
          'git clone https://github.com/phalla-doll/ng-echarts.git\ncd ng-echarts\nnpm ci\nnpm run build:lib\nnpm start -- --port 4310',
        language: 'Terminal',
      },
      {
        id: 'local-package',
        title: 'Use a packed local build',
        paragraphs: [
          'Create a production tarball from the workspace root. Install that file and the tested ECharts peer in a separate Angular 22 application. Replace the example path with the location of your checkout. Keep the file at the lockfile’s recorded path, or copy it into the consumer’s vendor directory first; commit the lockfile and use npm ci for repeat installs.',
        ],
        source:
          'npm run pack:lib\n\n# In your Angular 22 application:\nnpm install /path/to/ng-echarts/dist/ng-echarts-chart-library-0.1.0-rc.16.tgz echarts@6.1.0',
        language: 'Terminal',
      },
      {
        id: 'bootstrap',
        title: 'Bootstrap your chart',
        paragraphs: [
          'Copy the complete App example from Get Started into src/app/app.ts in a CLI standalone application. Keep its generated main.ts and app configuration; they already bootstrap the App export and app-root selector. Import the chart in the component’s imports array. No library-specific providers, global ECharts registration or library stylesheet is required.',
          'Merge these explicit settings into tsconfig.json while retaining its other options. A chart needs a visible, nonzero-width parent; height controls its plot, while titles and native controls add to the total height.',
        ],
        source:
          '{\n  "compilerOptions": { "strict": true, "skipLibCheck": false },\n  "angularCompilerOptions": { "strictTemplates": true }\n}',
        language: 'JSON',
      },
      {
        id: 'server-rendering',
        title: 'Server rendering',
        paragraphs: [
          'Keep the generated hydration configuration and identical initial data/formatting on server and client. Server output provides titles, controls and fallback surfaces; Canvas rendering begins in the browser. Consumer code should not initialize ECharts or disable hydration for the chart.',
          'For a local production SSR build, merge this security setting into the application build options in angular.json. Angular’s SSR host check otherwise rejects localhost. Use the actual serving hostnames for an existing application.',
        ],
        source: '{\n  "security": { "allowedHosts": ["localhost", "127.0.0.1"] }\n}',
        language: 'JSON',
      },
      {
        id: 'compatibility',
        title: 'Compatibility and limits',
        paragraphs: [
          'Exact tests use Angular/CLI 22.2.6, TypeScript 6.0.3, RxJS 7.8.2 and ECharts 6.1.0 with Node 24.22.2/npm 11.19.1. Library peers declare Angular common/core ^22.2.6 and ECharts ^6.1.0; wider allowed ranges are not a test of every version. Chromium 158.0.8127.18, Firefox 159.0 and WebKit 27.2 cover client and SSR/hydration paths.',
          'The measured starting envelope is 200 categories and three Cartesian series, or 12 pie/donut categories, on the recorded M2 Pro reference machine. Stress fixtures use 2,000 and 100 categories respectively. These are measured inputs rather than hard API limits or portable latency promises. Crowded outside labels may be shortened or hidden; native controls retain complete text.',
          'The APIs remain experimental. Automated tests pass; human screen-reader interpretation is deferred to release acceptance. The private 0.1.0-rc.16 candidate uses MIT for original library code and includes third-party notices. Human release acceptance and registry publication remain separate.',
        ],
      },
      {
        id: 'development',
        title: 'Development and checks',
        paragraphs: [
          'Run the library watcher in a second terminal when editing library source. The site consumes built /bar, /line, /area, /pie, /composed, /radar, /radial, /calendar, /sankey and /core package entries from dist/chart-library. Existing root imports remain compatible.',
          'The full check builds the library and site, verifies strict templates and declarations, exercises isolated consumers, and runs browser scenarios in Chromium, Firefox, and WebKit.',
        ],
        source:
          'npm run watch:lib\n\n# Install test browsers once, then run the checks:\nnpx playwright install chromium firefox webkit\nnpm run check',
        language: 'Terminal',
      },
    ],
    previous: { label: 'Get Started', path: '/get-started' },
    next: { label: 'Components', path: '/components' },
  },
  components: {
    path: '/components',
    title: 'Components',
    intro: 'Explore the Angular chart collection and the examples available today.',
    sections: [
      {
        id: 'charts',
        title: 'Charts',
        paragraphs: [
          'Explore working bar, line, area, pie/donut, composed, radar, radial progress, calendar heatmap and Sankey components.',
        ],
      },
      {
        id: 'data-contracts',
        title: 'Choose the data contract',
        paragraphs: [
          'ComposedChart accepts ComposedSeries<T> with a bar/line kind per measure on one shared axis pair. Bar, line, and area charts accept a typed array of ChartSeries<T> measures. PieChart accepts one ChartMeasure<T> and turns category rows into slices. Import each component from its focused @ng-echarts/chart-library/bar, /line, /area, /pie, /composed, or /radar entry. RadarChart uses comparison series and an explicit maxKey for each dimension. RadialProgress uses scalar value/max inputs from /radial, CalendarHeatmap uses one year/date/value contract from /calendar, and SankeyChart uses separate node/link arrays from /sankey. The last four families require focused imports.',
          'Use innerRadius 0 for a pie or 0.6 for a donut. Optional outside labels may shorten or hide collisions, while category controls retain full labels. Pie measures must be nonnegative; all-zero totals show an empty state. Optional showTotal displays the visible sum in donuts with innerRadius at least 0.4. Calendar and Sankey valueLabel names the tooltip measure and defaults to Value.',
          'Pie legend changes emit rowId and visible; Cartesian legend changes emit seriesId and visible. Cartesian, radar and pie pointSelect events include the original row and raw value. Calendar selects an original date/value row. Sankey emits a select event for an original node or link with raw totals/values. Radial progress has no selection event. Native tables provide keyboard actions where applicable; gallery chart previews may opt out of the optional table.',
        ],
      },
      {
        id: 'shared-behavior',
        title: 'Shared behavior',
        paragraphs: [
          'Bar, line, area, and pie/donut charts include consistent numeric formatting, selectable legends, tooltips, a native data table, and explicit loading/error/empty states. Use the playground to exercise those controls, or the validation pages to inspect lifecycle and hydration behavior.',
        ],
      },
    ],
    previous: { label: 'Installation', path: '/installation' },
    next: { label: 'Bar Blocks', path: '/' },
  },
};

export const chartCatalog = [
  {
    title: 'Bar Chart',
    description: 'Compare categories with grouped, stacked, horizontal, or gradient bars.',
    kind: 'bar',
    route: '/',
    status: 'Available',
  },
  {
    title: 'Line Chart',
    description:
      'Compare trends with straight or smooth lines, optional points, and missing-value gaps.',
    kind: 'line',
    route: '/line',
    status: 'Available',
  },
  {
    title: 'Area Chart',
    description: 'Compare trends with independent gradient or solid fills and stacked areas.',
    kind: 'area',
    route: '/area',
    status: 'Available',
  },
  {
    title: 'Pie & Donut',
    description:
      'Compare category shares with pie or donut layouts, category controls, and labels.',
    kind: 'pie',
    route: '/pie',
    status: 'Available',
  },
  {
    title: 'Composed Chart',
    description: 'Combine bars and trend lines using shared categories and one numeric scale.',
    kind: 'composed',
    route: '/composed',
    status: 'Available',
  },
  {
    title: 'Radar Chart',
    description:
      'Compare profiles using explicit dimension scales, stable comparisons and native table controls.',
    kind: 'radar',
    route: '/radar',
    status: 'Experimental',
  },
  {
    title: 'Radial Progress',
    description:
      'Show task completion with an explicit target, exact value and native progress semantics.',
    kind: 'radial',
    route: '/radial',
    status: 'Experimental',
  },
  {
    kind: 'calendar',
    route: '/calendar',
    title: 'Calendar Heatmap',
    status: 'Experimental',
    description:
      'Daily values, a fixed scale and a clear distinction between zero and missing days.',
  },
  {
    kind: 'sankey',
    route: '/sankey',
    title: 'Sankey Flow',
    status: 'Experimental',
    description:
      'Follow directed flows with proportional ribbons, node totals and native link actions.',
  },
] as const;
