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
  "  selector: 'app-visits',",
  '  imports: [BarChart],',
  '  template: `<nec-bar-chart',
  '    title="Device visits" description="Monthly desktop and mobile visits."',
  '    [data]="visits" rowIdKey="id" categoryKey="month" [series]="series"',
  '    theme="dark" [height]="320"',
  '  />`,',
  '})',
  'export class Visits {',
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
          'After building the local package, import BarChart from @ng-echarts/chart-library/bar in a standalone component. Supply stable row and series identifiers, then replace input references when data changes.',
        ],
        source: quickStartExample,
        language: 'TypeScript',
      },
      {
        id: 'included',
        title: 'Included behavior',
        paragraphs: [
          'Bar, line, area, and pie/donut charts support light and dark themes, responsive resizing, tooltips, keyboard-operable legends, and an optional data table enabled by default. Gallery previews omit the table controls; inspect their datasets in the Code tab. The playground retains the table and its keyboard actions. Plot and table actions emit the original numeric values.',
          'Loading, empty, and error states are explicit. Browser initialization is deferred safely in server-rendered applications, and reduced-motion preferences override decorative animation.',
        ],
      },
      {
        id: 'status',
        title: 'Project status',
        paragraphs: [
          'The library is experimental and the package is private. Use the workspace or a packed local build; a public npm installation is not available yet. Automated browser and packaging checks cover all four chart families. Release acceptance remains in development.',
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
          'Create a production tarball from the workspace root. Install that file and the tested ECharts peer in a separate Angular 22 application. Replace the example path with the location of your checkout.',
        ],
        source:
          'npm run pack:lib\n\n# In your Angular 22 application:\nnpm install /path/to/ng-echarts/dist/ng-echarts-chart-library-0.0.0.tgz echarts@6.1.0',
        language: 'Terminal',
      },
      {
        id: 'development',
        title: 'Development and checks',
        paragraphs: [
          'Run the library watcher in a second terminal when editing library source. The site consumes built /bar, /line, /area, /pie, and /core package entries in dist/chart-library rather than source aliases. Existing root imports remain compatible.',
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
        paragraphs: ['Explore working bar, line, area, and pie/donut components.'],
      },
      {
        id: 'data-contracts',
        title: 'Choose the data contract',
        paragraphs: [
          'Bar, line, and area charts accept a typed array of ChartSeries<T> measures. PieChart accepts one ChartMeasure<T> and turns category rows into slices. Import each component from its focused @ng-echarts/chart-library/bar, /line, /area, or /pie entry.',
          'Use innerRadius 0 for a pie or 0.6 for a donut. Optional outside labels may shorten or hide collisions, while category controls retain full labels. Pie measures must be nonnegative; all-zero totals show an empty state.',
          'Pie legend changes emit rowId and visible; Cartesian legend changes emit seriesId and visible. Point selection in every family includes the original row and raw value. The data table remains the keyboard point-action alternative; gallery examples opt out of it.',
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
] as const;
