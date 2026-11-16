import{t as we}from"./chunk-BKDS0Xp3.js";import{t as Oe}from"./chunk-5lrOP74p.js";import{n as fr,r as ne$1,t as c}from"./main-DECSU32P.js";import"./chunk-BxWXZ451.js";import{$n as zw,Ct as Zg,D as HI,E as Gg,Gn as yC,L as KF,Ln as wT,Mn as ud,On as tC,Q as Og,Rn as wi,Rt as eC,S as FC,V as LC,Wn as xg,Wt as gg,_ as Dw,_t as Ww,a as Ag,cn as lm,et as Pw,f as Bg,gt as Wo,ht as Wg,it as Rw,j as JF,l as Aw,ln as m,p as Cl,q as Mw,rn as kd,sn as ld,w as Fw}from"./chunk-BCV1fTjr.js";import{n as s,t as r}from"./chunk-B6Fy8hbW.js";var ee=[`month`];var te=[`resetMonth`];var ne=(i,n)=>n.id;function oe(i,n){if(i&1&&(wi(0,`option`,6),yC(1),Cl()),i&2){let t=n.$implicit;Ag(`value`,t.id),HI(),Zg(t.month)}}function ae(i,n){if(i&1){let t=Ww();wi(0,`button`,16,2),Bg(`click`,function(){ld(t);let d=zw();return ud(d.reset())}),yC(2,`Reset dashboard month`),Cl()}}function ie(i){return i.map((n,t)=>{let e=i.slice(Math.max(0,t-2),t+1),d=e.every(u=>u.desktop!==null&&u.mobile!==null);return s(r({},n),{trend:d?e.reduce((u,c)=>u+c.desktop+c.mobile,0)/e.length:null})})}function re(i){return[`desktop`,`mobile`].map(n=>{let t=i.flatMap(e=>e[n]===null?[]:[e[n]]);return{id:n,device:n===`desktop`?`Desktop`:`Mobile`,visits:t.length?t.reduce((e,d)=>e+d,0):null,missing:i.length-t.length}})}var S=class i{data=KF.required();theme=KF(`light`);showDataTable=KF(!0);monthField=JF.required(`month`);resetButton=JF(`resetMonth`);kind=Wo(`bar`);selectedId=FC({source:this.data,computation:(n,t)=>n.some(e=>e.id===t?.value)?t.value:null});overview=LC(()=>ie(this.data()));series=LC(()=>[{id:`desktop`,key:`desktop`,label:`Desktop`,kind:this.kind(),stack:`visits`},{id:`mobile`,key:`mobile`,label:`Mobile`,kind:this.kind(),stack:`visits`},{id:`trend`,key:`trend`,label:`3-month mean`,kind:`line`}]);scope=LC(()=>this.selectedId()===null?this.data():this.data().filter(n=>n.id===this.selectedId()));detail=LC(()=>re(this.scope()));context=LC(()=>this.data().length?this.selectedId()===null?`All months selected.`:`${this.scope()[0].month} selected.`:`No months available.`);detailTitle=LC(()=>`Recorded device visits \xB7 ${this.selectedId()===null?`All months`:this.scope()[0].month}`);completeness=LC(()=>{if(!this.data().length)return`No device observations available.`;let n=this.detail().reduce((t,e)=>t+e.missing,0);return n?`${n} missing device observation${n===1?``:`s`}. Recorded sums may be partial.`:`All device observations are recorded for this period.`});action=FC({source:()=>[this.data(),this.selectedId()],computation:()=>``});detailSeries=[{id:`visits`,key:`visits`,label:`Visits`}];monthTick=n=>n.slice(0,3);constructor(){kd(()=>{let n=this.selectedId();lm(()=>{let t=this.resetButton()?.nativeElement;n===null&&t&&t.ownerDocument.activeElement===t&&this.monthField().nativeElement.focus()})})}selectMonth(n){this.selectedId.set(this.data().some(t=>t.id===n)?n:null),this.action.set(``)}selectPoint(n){this.selectMonth(n.rowId);let t=n.seriesId===`trend`?`3-month mean`:n.seriesId===`desktop`?`Desktop`:`Mobile`;this.action.set(`${n.row.month}: ${t}, ${new Intl.NumberFormat(`en-US`).format(n.value)} visits (${n.source}).`)}reset(){this.selectMonth(``),this.monthField().nativeElement.focus()}static ɵfac=function(t){return new(t||i)};static ɵcmp=wT({type:i,selectors:[[`app-composed-dashboard`]],viewQuery:function(t,e){t&1&&Wg(e.monthField,ee,5)(e.resetButton,te,5),t&2&&eC(2)},hostVars:1,hostBindings:function(t,e){t&2&&xg(`data-theme`,e.theme())},inputs:{data:[1,`data`],theme:[1,`theme`],showDataTable:[1,`showDataTable`]},decls:27,vars:22,consts:[[`month`,``],[`style`,``],[`resetMonth`,``],[1,`dashboard-controls`],[3,`change`,`value`],[`value`,``],[3,`value`],[`value`,`bar`],[`value`,`area`],[`type`,`button`],[`role`,`status`,1,`dashboard-context`],[1,`dashboard-pair`],[`title`,`Monthly visits and trend`,`description`,`Desktop and mobile share a stack. The line is the trailing mean of combined visits over up to three supplied months. Incomplete windows have no mean. Choose a month from any plotted series or the Month field.`,`rowIdKey`,`id`,`categoryKey`,`month`,3,`pointSelect`,`data`,`series`,`theme`,`showDataTable`,`height`,`categoryTickFormatter`],[`description`,`Recorded device visits for the selected period. Missing observations are excluded from recorded sums and reported below. Legends are independent.`,`rowIdKey`,`id`,`categoryKey`,`device`,`layout`,`horizontal`,3,`title`,`data`,`series`,`theme`,`showDataTable`,`height`],[1,`dashboard-missing`],[`role`,`status`,1,`dashboard-action`],[`type`,`button`,3,`click`]],template:function(t,e){if(t&1){let d=Ww();wi(0,`div`,3)(1,`label`),yC(2,`Month `),wi(3,`select`,4,0),Bg(`change`,function(){ld(d);let c=tC(4);return ud(e.selectMonth(c.value))}),wi(5,`option`,5),yC(6,`All months`),Cl(),Pw(7,oe,2,2,`option`,6,ne),Cl()(),wi(9,`label`),yC(10,`Overview style `),wi(11,`select`,4,1),Bg(`change`,function(){ld(d);let c=tC(12);return ud(e.kind.set(c.value===`area`?`area`:`bar`))}),wi(13,`option`,7),yC(14,`Stacked bars`),Cl(),wi(15,`option`,8),yC(16,`Stacked areas`),Cl()()(),Aw(17,ae,3,0,`button`,9),Cl(),wi(18,`p`,10),yC(19),Cl(),wi(20,`div`,11)(21,`nec-composed-chart`,12),Bg(`pointSelect`,function(c){return e.selectPoint(c)}),Cl(),Og(22,`nec-bar-chart`,13),Cl(),wi(23,`p`,14),yC(24),Cl(),wi(25,`p`,15),yC(26),Cl()}t&2&&(HI(3),Gg(`color-scheme`,e.theme()),Ag(`value`,e.selectedId()??``),HI(4),Fw(e.data()),HI(4),Gg(`color-scheme`,e.theme()),Ag(`value`,e.kind()),HI(6),Rw(e.selectedId()!==null?17:-1),HI(2),Zg(e.context()),HI(2),Ag(`data`,e.overview())(`series`,e.series())(`theme`,e.theme())(`showDataTable`,e.showDataTable())(`height`,280)(`categoryTickFormatter`,e.monthTick),HI(),Ag(`title`,e.detailTitle())(`data`,e.detail())(`series`,e.detailSeries)(`theme`,e.theme())(`showDataTable`,e.showDataTable())(`height`,280),HI(2),Zg(e.completeness()),HI(2),Zg(e.action()))},dependencies:[Oe,we],styles:[`[_nghost-%COMP%]{display:block;min-width:0;container:dashboard / inline-size;--%NS%nec-background: var(--%NS%site-bg, #fff);--%NS%nec-text: var(--%NS%site-text, #18202c);--%NS%nec-muted: var(--%NS%site-muted, #536176);--%NS%nec-border: var(--%NS%site-border, #d6dce5)}[data-theme="light"][_nghost-%COMP%]{--%NS%site-bg: #fff;--%NS%site-text: #18202c;--%NS%site-muted: #536176;--%NS%site-border: #d6dce5}[data-theme="dark"][_nghost-%COMP%]{--%NS%site-bg: #18202c;--%NS%site-text: #edf2fa;--%NS%site-muted: #b2bfd2;--%NS%site-border: #3b4a61}.dashboard-controls[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:end}label[_ngcontent-%COMP%]{display:grid;gap:6px;font-size:13px;color:var(--%NS%site-muted, #536176)}select[_ngcontent-%COMP%], button[_ngcontent-%COMP%]{min-height:40px;max-width:100%;padding:8px 12px;font:inherit;border:1px solid var(--%NS%site-border, #d6dce5);border-radius:6px;color:var(--%NS%site-text, #18202c);background:var(--%NS%site-bg, #fff);cursor:pointer}select[_ngcontent-%COMP%]:focus-visible, button[_ngcontent-%COMP%]:focus-visible{outline:2px solid #2563eb;outline-offset:3px}.dashboard-context[_ngcontent-%COMP%]{margin:20px 0;font-size:14px;color:var(--%NS%site-text, #18202c)}.dashboard-pair[_ngcontent-%COMP%]{display:grid;gap:20px}.dashboard-pair[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]{min-width:0;border:1px solid var(--%NS%site-border, #d6dce5);border-radius:8px}.dashboard-missing[_ngcontent-%COMP%], .dashboard-action[_ngcontent-%COMP%]{font-size:13px;line-height:1.6;color:var(--%NS%site-muted, #536176)}.dashboard-action[_ngcontent-%COMP%]{min-height:21px}@container dashboard (min-width: 820px){.dashboard-pair[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);align-items:start}}`]})};var X=[{id:`jan`,month:`January`,desktop:120,mobile:80},{id:`feb`,month:`February`,desktop:200,mobile:0},{id:`mar`,month:`March`,desktop:null,mobile:40},{id:`apr`,month:`April`,desktop:60,mobile:null}];var D=class i{theme=KF(`light`);showDataTable=KF(!0);sample=X;rows=Wo(X);dark=FC(()=>this.theme()===`dark`);refresh(){this.rows.update(n=>n.map(t=>s(r({},t),{desktop:t.desktop===null?null:t.desktop+10})))}reverse(){this.rows.update(n=>[...n].reverse())}remove(){this.rows.update(n=>n.filter(t=>t.id!==`feb`))}static ɵfac=function(t){return new(t||i)};static ɵcmp=wT({type:i,selectors:[[`app-root`],[`app-dashboard-pilot`]],inputs:{theme:[1,`theme`],showDataTable:[1,`showDataTable`]},decls:19,vars:4,consts:[[1,`controls`],[`type`,`button`,3,`click`],[3,`data`,`theme`,`showDataTable`]],template:function(t,e){t&1&&(wi(0,`main`)(1,`h1`),yC(2,`Visits dashboard`),Cl(),wi(3,`p`),yC(4,`Explore recorded device visits and compare monthly trends.`),Cl(),wi(5,`div`,0)(6,`button`,1),Bg(`click`,function(){return e.refresh()}),yC(7,`Refresh visits`),Cl(),wi(8,`button`,1),Bg(`click`,function(){return e.reverse()}),yC(9,`Reverse months`),Cl(),wi(10,`button`,1),Bg(`click`,function(){return e.remove()}),yC(11,`Remove February`),Cl(),wi(12,`button`,1),Bg(`click`,function(){return e.rows.set([])}),yC(13,`Clear months`),Cl(),wi(14,`button`,1),Bg(`click`,function(){return e.rows.set(e.sample)}),yC(15,`Restore months`),Cl(),wi(16,`button`,1),Bg(`click`,function(){return e.dark.set(!e.dark())}),yC(17,` Dark theme `),Cl()(),Og(18,`app-composed-dashboard`,2),Cl()),t&2&&(HI(16),xg(`aria-pressed`,e.dark()),HI(2),Ag(`data`,e.rows())(`theme`,e.dark()?`dark`:`light`)(`showDataTable`,e.showDataTable()))},dependencies:[S],styles:[`[_nghost-%COMP%]{display:block;font-family:system-ui,sans-serif;color:var(--%NS%site-text, #18202c)}main[_ngcontent-%COMP%]{max-width:1180px;padding:24px 12px;margin:auto}h1[_ngcontent-%COMP%]{font-size:28px;font-weight:500}p[_ngcontent-%COMP%]{line-height:1.6}.controls[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0}button[_ngcontent-%COMP%]{min-height:40px;padding:8px 12px;font:inherit;color:var(--%NS%site-text, #18202c);background:var(--%NS%site-bg, white);border:1px solid var(--%NS%site-border, #d6dce5);border-radius:6px;cursor:pointer}button[_ngcontent-%COMP%]:focus-visible{outline:2px solid #2563eb;outline-offset:3px}`]})};var Y=`import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ComposedChart, type ComposedSeries } from '@mantha911/ng-echarts/composed';
import { BarChart } from '@mantha911/ng-echarts/bar';
import type { ChartSeries, ChartTheme, PointSelection } from '@mantha911/ng-echarts/core';

export interface DashboardMonth {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
}

/** A trailing mean requires every device observation in its supplied-order window. */
export function dashboardRows(data: readonly DashboardMonth[]) {
  return data.map((row, index) => {
    const window = data.slice(Math.max(0, index - 2), index + 1);
    const complete = window.every((item) => item.desktop !== null && item.mobile !== null);
    return {
      ...row,
      trend: complete
        ? window.reduce((sum, item) => sum + item.desktop! + item.mobile!, 0) / window.length
        : null,
    };
  });
}

/** Partial aggregates are explicitly labelled; no observations is missing, never zero. */
export function dashboardBreakdown(data: readonly DashboardMonth[]) {
  return (['desktop', 'mobile'] as const).map((id) => {
    const observations = data.flatMap((row) => (row[id] === null ? [] : [row[id]]));
    return {
      id,
      device: id === 'desktop' ? 'Desktop' : 'Mobile',
      visits: observations.length ? observations.reduce((sum, value) => sum + value, 0) : null,
      missing: data.length - observations.length,
    };
  });
}

@Component({
  selector: 'app-composed-dashboard',
  imports: [ComposedChart, BarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="dashboard-controls">
      <label
        >Month
        <select
          #month
          [value]="selectedId() ?? ''"
          [style.color-scheme]="theme()"
          (change)="selectMonth(month.value)"
        >
          <option value="">All months</option>
          @for (row of data(); track row.id) {
            <option [value]="row.id">{{ row.month }}</option>
          }
        </select>
      </label>
      <label
        >Overview style
        <select
          #style
          [value]="kind()"
          [style.color-scheme]="theme()"
          (change)="kind.set(style.value === 'area' ? 'area' : 'bar')"
        >
          <option value="bar">Stacked bars</option>
          <option value="area">Stacked areas</option>
        </select>
      </label>
      @if (selectedId() !== null) {
        <button #resetMonth type="button" (click)="reset()">Reset dashboard month</button>
      }
    </div>
    <p class="dashboard-context" role="status">{{ context() }}</p>
    <div class="dashboard-pair">
      <nec-composed-chart
        title="Monthly visits and trend"
        description="Desktop and mobile share a stack. The line is the trailing mean of combined visits over up to three supplied months. Incomplete windows have no mean. Choose a month from any plotted series or the Month field."
        [data]="overview()"
        rowIdKey="id"
        categoryKey="month"
        [series]="series()"
        [theme]="theme()"
        [showDataTable]="showDataTable()"
        [height]="280"
        [categoryTickFormatter]="monthTick"
        (pointSelect)="selectPoint($event)"
      />
      <nec-bar-chart
        [title]="detailTitle()"
        description="Recorded device visits for the selected period. Missing observations are excluded from recorded sums and reported below. Legends are independent."
        [data]="detail()"
        rowIdKey="id"
        categoryKey="device"
        [series]="detailSeries"
        layout="horizontal"
        [theme]="theme()"
        [showDataTable]="showDataTable()"
        [height]="280"
      />
    </div>
    <p class="dashboard-missing">{{ completeness() }}</p>
    <p class="dashboard-action" role="status">{{ action() }}</p>
  \`,
  styles: \`
    :host {
      display: block;
      min-width: 0;
      container: dashboard / inline-size;
      --nec-background: var(--site-bg, #fff);
      --nec-text: var(--site-text, #18202c);
      --nec-muted: var(--site-muted, #536176);
      --nec-border: var(--site-border, #d6dce5);
    }
    :host([data-theme='light']) {
      --site-bg: #fff;
      --site-text: #18202c;
      --site-muted: #536176;
      --site-border: #d6dce5;
    }
    :host([data-theme='dark']) {
      --site-bg: #18202c;
      --site-text: #edf2fa;
      --site-muted: #b2bfd2;
      --site-border: #3b4a61;
    }
    .dashboard-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 20px;
      align-items: end;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 13px;
      color: var(--site-muted, #536176);
    }
    select,
    button {
      min-height: 40px;
      max-width: 100%;
      padding: 8px 12px;
      font: inherit;
      border: 1px solid var(--site-border, #d6dce5);
      border-radius: 6px;
      color: var(--site-text, #18202c);
      background: var(--site-bg, #fff);
      cursor: pointer;
    }
    select:focus-visible,
    button:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 3px;
    }
    .dashboard-context {
      margin: 20px 0;
      font-size: 14px;
      color: var(--site-text, #18202c);
    }
    .dashboard-pair {
      display: grid;
      gap: 20px;
    }
    .dashboard-pair > * {
      min-width: 0;
      border: 1px solid var(--site-border, #d6dce5);
      border-radius: 8px;
    }
    .dashboard-missing,
    .dashboard-action {
      font-size: 13px;
      line-height: 1.6;
      color: var(--site-muted, #536176);
    }
    .dashboard-action {
      min-height: 21px;
    }
    @container dashboard (min-width: 820px) {
      .dashboard-pair {
        grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
        align-items: start;
      }
    }
  \`,
  host: { '[attr.data-theme]': 'theme()' },
})
export class ComposedDashboard {
  readonly data = input.required<readonly DashboardMonth[]>();
  readonly theme = input<ChartTheme>('light');
  readonly showDataTable = input(true);
  private readonly monthField = viewChild.required<ElementRef<HTMLSelectElement>>('month');
  private readonly resetButton = viewChild<ElementRef<HTMLButtonElement>>('resetMonth');
  protected readonly kind = signal<'bar' | 'area'>('bar');
  protected readonly selectedId = linkedSignal<readonly DashboardMonth[], string | null>({
    source: this.data,
    computation: (rows, previous) =>
      rows.some((row) => row.id === previous?.value) ? previous!.value : null,
  });
  protected readonly overview = computed(() => dashboardRows(this.data()));
  protected readonly series = computed<
    readonly ComposedSeries<ReturnType<typeof dashboardRows>[number]>[]
  >(() => [
    { id: 'desktop', key: 'desktop', label: 'Desktop', kind: this.kind(), stack: 'visits' },
    { id: 'mobile', key: 'mobile', label: 'Mobile', kind: this.kind(), stack: 'visits' },
    { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line' },
  ]);
  protected readonly scope = computed(() =>
    this.selectedId() === null
      ? this.data()
      : this.data().filter((row) => row.id === this.selectedId()),
  );
  protected readonly detail = computed(() => dashboardBreakdown(this.scope()));
  protected readonly context = computed(() =>
    !this.data().length
      ? 'No months available.'
      : this.selectedId() === null
        ? 'All months selected.'
        : \`\${this.scope()[0]!.month} selected.\`,
  );
  protected readonly detailTitle = computed(
    () =>
      \`Recorded device visits \xB7 \${this.selectedId() === null ? 'All months' : this.scope()[0]!.month}\`,
  );
  protected readonly completeness = computed(() => {
    if (!this.data().length) return 'No device observations available.';
    const missing = this.detail().reduce((sum, row) => sum + row.missing, 0);
    return missing
      ? \`\${missing} missing device observation\${missing === 1 ? '' : 's'}. Recorded sums may be partial.\`
      : 'All device observations are recorded for this period.';
  });
  protected readonly action = linkedSignal({
    source: () => [this.data(), this.selectedId()],
    computation: () => '',
  });
  protected readonly detailSeries: readonly ChartSeries<
    ReturnType<typeof dashboardBreakdown>[number]
  >[] = [{ id: 'visits', key: 'visits', label: 'Visits' }];
  protected readonly monthTick = (month: string) => month.slice(0, 3);
  constructor() {
    effect(() => {
      const id = this.selectedId();
      untracked(() => {
        const reset = this.resetButton()?.nativeElement;
        if (id === null && reset && reset.ownerDocument.activeElement === reset) {
          this.monthField().nativeElement.focus();
        }
      });
    });
  }
  protected selectMonth(id: string): void {
    this.selectedId.set(this.data().some((row) => row.id === id) ? id : null);
    this.action.set('');
  }
  protected selectPoint(point: PointSelection<DashboardMonth>): void {
    this.selectMonth(point.rowId);
    const label =
      point.seriesId === 'trend'
        ? '3-month mean'
        : point.seriesId === 'desktop'
          ? 'Desktop'
          : 'Mobile';
    this.action.set(
      \`\${point.row.month}: \${label}, \${new Intl.NumberFormat('en-US').format(point.value)} visits (\${point.source}).\`,
    );
  }
  protected reset(): void {
    this.selectMonth('');
    this.monthField().nativeElement.focus();
  }
}


const sample: readonly DashboardMonth[] = [
  { id: 'jan', month: 'January', desktop: 120, mobile: 80 },
  { id: 'feb', month: 'February', desktop: 200, mobile: 0 },
  { id: 'mar', month: 'March', desktop: null, mobile: 40 },
  { id: 'apr', month: 'April', desktop: 60, mobile: null },
];

@Component({
  selector: 'app-root, app-dashboard-pilot',
  imports: [ComposedDashboard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<main>
    <h1>Visits dashboard</h1>
    <p>Explore recorded device visits and compare monthly trends.</p>
    <div class="controls">
      <button type="button" (click)="refresh()">Refresh visits</button>
      <button type="button" (click)="reverse()">Reverse months</button>
      <button type="button" (click)="remove()">Remove February</button>
      <button type="button" (click)="rows.set([])">Clear months</button>
      <button type="button" (click)="rows.set(sample)">Restore months</button>
      <button type="button" [attr.aria-pressed]="dark()" (click)="dark.set(!dark())">
        Dark theme
      </button>
    </div>
    <app-composed-dashboard
      [data]="rows()"
      [theme]="dark() ? 'dark' : 'light'"
      [showDataTable]="showDataTable()"
    />
  </main>\`,
  styles: \`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      color: var(--site-text, #18202c);
    }
    main {
      max-width: 1180px;
      padding: 24px 12px;
      margin: auto;
    }
    h1 {
      font-size: 28px;
      font-weight: 500;
    }
    p {
      line-height: 1.6;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 24px 0;
    }
    button {
      min-height: 40px;
      padding: 8px 12px;
      font: inherit;
      color: var(--site-text, #18202c);
      background: var(--site-bg, white);
      border: 1px solid var(--site-border, #d6dce5);
      border-radius: 6px;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 3px;
    }
  \`,
})
export class App {
  readonly theme = input<ChartTheme>('light');
  readonly showDataTable = input(true);
  protected readonly sample = sample;
  protected readonly rows = signal(sample);
  protected readonly dark = linkedSignal(() => this.theme() === 'dark');
  protected refresh(): void {
    this.rows.update((rows) =>
      rows.map((row) => ({ ...row, desktop: row.desktop === null ? null : row.desktop + 10 })),
    );
  }
  protected reverse(): void {
    this.rows.update((rows) => [...rows].reverse());
  }
  protected remove(): void {
    this.rows.update((rows) => rows.filter((row) => row.id !== 'feb'));
  }
}
`;var se=()=>[import(`./chunk-Bify7RSC.js`).then(i=>i.HighlightCode)];function de(i,n){if(i&1&&Og(0,`code`,8),i&2){let t=zw();Ag(`appHighlight`,t.source)}}function le(i,n){if(i&1&&(wi(0,`code`),yC(1),Cl()),i&2){let t=zw();HI(),Zg(t.source)}}function pe(i,n){if(i&1&&(wi(0,`code`),yC(1),Cl()),i&2){let t=zw();HI(),Zg(t.source)}}var Z=class i{showDataTable=m(ne$1).snapshot.data.showDataTable===!0;theme=m(c).theme;source=Y;static ɵfac=function(t){return new(t||i)};static ɵcmp=wT({type:i,selectors:[[`app-linked-dashboard`]],decls:24,vars:2,consts:[[`sourceDetails`,``],[1,`gallery`],[1,`gallery-content`],[3,`theme`,`showDataTable`],[`aria-labelledby`,`dashboard-pattern`,1,`linking-guide`],[`id`,`dashboard-pattern`],[`tabindex`,`0`,`aria-label`,`Composed linked dashboard Angular source`],[`routerLink`,`/linked`],[3,`appHighlight`]],template:function(t,e){t&1&&(wi(0,`div`,1)(1,`div`,2),Og(2,`app-dashboard-pilot`,3),wi(3,`section`,4)(4,`h2`,5),yC(5,`Use this dashboard`),Cl(),wi(6,`p`),yC(7,` Activate a bar, area or trend value, or choose a month. Switch the overview style without changing the selection. Reset returns to all months. Refreshing and reordering retain the selected month by ID; removing it returns to all months. Each legend affects its own chart. `),Cl(),wi(8,`p`),yC(9,` Missing observations remain missing. Recorded device sums may be partial, and the trend requires complete device observations throughout its window. `),Cl(),wi(10,`details`,null,0)(12,`summary`),yC(13,`Standalone Angular dashboard source`),Cl(),wi(14,`pre`,6),gg(15,de,1,1)(16,le,2,1)(17,pe,2,1),Dw(18,15,se,null,16,17),Mw(10),Cl()(),wi(20,`p`),yC(21,` Install the experimental rc.22 package to use this example. Horizontal composed charts are a separate rc.23 source feature. `),Cl(),wi(22,`a`,7),yC(23,`Explore month ranges and previews`),Cl()()()()),t&2&&(HI(2),Ag(`theme`,e.theme())(`showDataTable`,e.showDataTable))},dependencies:[D,fr],styles:[`[_nghost-%COMP%]{display:block}.gallery[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,640px) 150px;gap:64px;max-width:var(--%NS%site-page-width);margin:auto;padding:var(--%NS%site-page-top) var(--%NS%site-page-gutter) var(--%NS%site-page-bottom)}.gallery-content[_ngcontent-%COMP%]{min-width:0}.gallery-heading[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:48px}h1[_ngcontent-%COMP%]{margin:0;font-size:var(--%NS%site-title-size);font-weight:600;line-height:var(--%NS%site-title-line);letter-spacing:-1px}.gallery-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:8px 0 0;color:var(--%NS%site-muted);font-size:14px;line-height:24px}.copy-page[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;flex:none;gap:6px;margin-top:4px;padding:5px 10px;border:1px solid var(--%NS%site-border);border-radius:6px;font:inherit;font-size:12px;line-height:20px;color:var(--%NS%site-muted);background:var(--%NS%site-surface)}.copy-page[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:14px;height:14px}.gallery-examples[_ngcontent-%COMP%]{display:grid;gap:40px}.page-outline[_ngcontent-%COMP%]{position:sticky;top:calc(var(--%NS%site-header-height) + 48px);align-self:start;margin-top:10px;font-size:12px;line-height:20px}.page-outline[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0 0 12px;color:var(--%NS%site-muted)}.page-outline[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:block;padding:8px 0 8px 16px;border-left:1px solid var(--%NS%site-border);color:var(--%NS%site-muted);text-decoration:none;font-size:13px;line-height:20px}.page-outline[_ngcontent-%COMP%]   a.active[_ngcontent-%COMP%]{color:var(--%NS%site-text)}.page-outline[_ngcontent-%COMP%]   .outline-playground[_ngcontent-%COMP%]{display:flex;align-items:center;gap:5px;margin-top:24px;padding-left:0;border:0}.outline-playground[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.gallery-footer[_ngcontent-%COMP%]{border-top:1px solid var(--%NS%site-border);margin-top:48px;padding-top:24px;color:var(--%NS%site-muted);font-size:11px;line-height:18px}.gallery-footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:5px;margin-top:8px;color:var(--%NS%site-text);text-decoration:none}.gallery-footer[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.gallery-note[_ngcontent-%COMP%]{font-size:12px;line-height:20px;color:var(--%NS%site-muted)}@media(max-width:1250px){.gallery[_ngcontent-%COMP%]{display:block}.page-outline[_ngcontent-%COMP%]{display:none}}@media(max-width:600px){.gallery-heading[_ngcontent-%COMP%]{flex-direction:column;gap:16px;margin-bottom:32px}.gallery-examples[_ngcontent-%COMP%]{gap:32px}.copy-page[_ngcontent-%COMP%]{margin-top:0}}`,`.gallery-heading[_ngcontent-%COMP%]{margin-bottom:36px}.linking-guide[_ngcontent-%COMP%]{margin-top:32px}h2[_ngcontent-%COMP%]{font-size:20px;font-weight:500;line-height:32px;margin:0 0 12px}.linking-guide[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:var(--%NS%site-muted);font-size:13px;line-height:22px}details[_ngcontent-%COMP%]{margin:24px 0;border:1px solid var(--%NS%site-border);border-radius:var(--%NS%site-panel-radius);min-width:0}summary[_ngcontent-%COMP%]{padding:12px 16px;cursor:pointer;font-size:12px}pre[_ngcontent-%COMP%]{margin:0;padding:16px;max-height:480px;overflow:auto;font-size:12px;line-height:20px;border-top:1px solid var(--%NS%site-border)}a[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;color:var(--%NS%site-text);font-size:12px;line-height:20px}a[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.code-tools[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;padding:8px 12px;border-top:1px solid var(--%NS%site-border)}.code-tools[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;border:0;background:transparent;font:inherit;color:var(--%NS%site-text);font-size:12px;cursor:pointer;padding:4px}.code-tools[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}@media(min-width:1100px){.gallery[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr);max-width:1180px}.page-outline[_ngcontent-%COMP%]{display:none}}`]})};export{Z as LinkedDashboard};