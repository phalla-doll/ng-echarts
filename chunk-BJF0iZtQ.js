import{t as hn}from"./chunk-DMTYUkqy.js";import{t as e}from"./chunk-B7Ng-UbO.js";import{i as _t,n as f,t as d}from"./main-YNSGV7CM.js";import{t as Y}from"./chunk-CfUok7pG.js";import"./chunk-DwVZ6-z7.js";import"./chunk-C9puN0_K.js";import"./chunk-N8_KeIBJ.js";import"./chunk-BcD9w5Kk.js";import{Dn as rC,Dt as bg,Gt as gg,Ht as g,J as Po,W as NI,Xn as yw,Yn as yl,_ as Ew,jt as dl,un as mg,yn as pT,zt as fi}from"./chunk-BVyfDG-_.js";var k=`import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import {
  BarChart,
  type ChartSeries,
  type BarRangeSelection,
} from "@ng-echarts/chart-library/bar";
import { PieChart, type ChartMeasure } from "@ng-echarts/chart-library/pie";
interface Month {
  id: string;
  month: string;
  desktop: number | null;
  mobile: number | null;
}
interface Device {
  id: string;
  device: string;
  visits: number | null;
}
export type VisitPeriod =
  | { readonly kind: "month"; readonly id: string }
  | { readonly kind: "range"; readonly from: string; readonly to: string }
  | null;

/** Bounds are stable row IDs. Display order, never label parsing, defines a range. */
export function reconcilePeriod(
  rows: readonly { readonly id: string }[],
  period: VisitPeriod,
): VisitPeriod {
  if (period === null) return null;
  if (period.kind === "month")
    return rows.some((row) => row.id === period.id) ? period : null;
  const from = rows.findIndex((row) => row.id === period.from);
  const to = rows.findIndex((row) => row.id === period.to);
  if (from < 0 || to < 0) return null;
  return from <= to
    ? period
    : { kind: "range", from: period.to, to: period.from };
}

export function periodRows<T extends { readonly id: string }>(
  rows: readonly T[],
  period: VisitPeriod,
): readonly T[] {
  const current = reconcilePeriod(rows, period);
  if (current === null) return rows;
  if (current.kind === "month")
    return rows.filter((row) => row.id === current.id);
  return rows.slice(
    rows.findIndex((row) => row.id === current.from),
    rows.findIndex((row) => row.id === current.to) + 1,
  );
}

/** Moving a bound across its counterpart moves the other bound with it. */
export function changePeriodBound(
  rows: readonly { readonly id: string }[],
  period: VisitPeriod,
  bound: "from" | "to",
  id: string,
): VisitPeriod {
  if (period?.kind !== "range" || !rows.some((row) => row.id === id))
    return period;
  const next = { ...period, [bound]: id };
  if (
    rows.findIndex((row) => row.id === next.from) >
    rows.findIndex((row) => row.id === next.to)
  ) {
    return { kind: "range", from: id, to: id };
  }
  return next;
}
@Component({
  selector: "app-root",
  imports: [BarChart, PieChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(document:keydown.escape)": "cancelRange()" },
  template: \`<label
      >Period
      <select
        #period
        [value]="periodValue()"
        (change)="selectPeriod(period.value)"
      >
        <option value="">All months</option>
        <option value="__range__" [disabled]="!rows().length">
          Custom range
        </option>
        @for (row of rows(); track row.id) {
          <option [value]="'month:' + row.id">{{ row.month }}</option>
        }
      </select>
    </label>
    @if (selection() !== null) {
      <button type="button" (click)="reset()">Reset</button>
    }
    <button
      #rangeButton
      type="button"
      [attr.aria-pressed]="rangeMode()"
      [disabled]="!canSelectRange()"
      (click)="toggleRange()"
    >
      Select range
    </button>
    @if (rangeMode()) {
      <p role="status">Drag across months, then release. Escape cancels.</p>
    }
    @if (range(); as bounds) {
      <fieldset #rangeFields>
        <legend>Custom month range</legend>
        <label
          >From
          <select
            #from
            [value]="bounds.from"
            (change)="selectBound('from', from.value)"
          >
            @for (row of rows(); track row.id) {
              <option [value]="row.id" [selected]="row.id === bounds.from">
                {{ row.month }}
              </option>
            }
          </select>
        </label>
        <label
          >To
          <select
            #to
            [value]="bounds.to"
            (change)="selectBound('to', to.value)"
          >
            @for (row of rows(); track row.id) {
              <option [value]="row.id" [selected]="row.id === bounds.to">
                {{ row.month }}
              </option>
            }
          </select>
        </label>
      </fieldset>
    }
    <p role="status">Device share for {{ context() }}</p>
    <nec-bar-chart
      title="Monthly visits"
      description="Choose a month from a bar, table value or period field."
      [data]="rows()"
      rowIdKey="id"
      categoryKey="month"
      [series]="series"
      [selectedRowIds]="selectedIds()"
      [rangeSelection]="rangeMode()"
      (rangeSelect)="selectRange($event)"
      (pointSelect)="selectMonth($event.rowId)"
    />
    <nec-pie-chart
      [title]="'Device share \xB7 ' + context()"
      [data]="share()"
      rowIdKey="id"
      categoryKey="device"
      [measure]="measure"
      [innerRadius]="0.6"
    />\`,
})
export class App {
  readonly rows = signal<readonly Month[]>([
    { id: "jan", month: "January", desktop: 120, mobile: 80 },
    { id: "feb", month: "February", desktop: 200, mobile: 0 },
    { id: "mar", month: "March", desktop: null, mobile: 40 },
  ]);
  readonly rangeMode = linkedSignal({
    source: this.rows,
    computation: () => false,
  });
  readonly canSelectRange = computed(() =>
    this.rows().some((row) => row.desktop !== null || row.mobile !== null),
  );
  readonly selection = linkedSignal<readonly Month[], VisitPeriod>({
    source: this.rows,
    computation: (rows, previous) =>
      reconcilePeriod(rows, previous?.value ?? null),
  });
  readonly range = computed(() => {
    const value = this.selection();
    return value?.kind === "range" ? value : null;
  });
  readonly periodValue = computed(() => {
    const value = this.selection();
    return value?.kind === "range"
      ? "__range__"
      : value
        ? \`month:\${value.id}\`
        : "";
  });
  readonly scope = computed(() => periodRows(this.rows(), this.selection()));
  readonly selectedIds = computed(() =>
    this.selection() === null ? [] : this.scope().map((row) => row.id),
  );
  readonly context = computed(() => {
    if (this.selection() === null) return "All months";
    const scope = this.scope();
    return scope.length === 1
      ? scope[0]!.month
      : \`\${scope[0]!.month}\u2013\${scope.at(-1)!.month}\`;
  });
  readonly share = computed<readonly Device[]>(() =>
    (["desktop", "mobile"] as const).map((key) => {
      const values = this.scope().flatMap((row) =>
        row[key] === null ? [] : [row[key]],
      );
      return {
        id: key,
        device: key === "desktop" ? "Desktop" : "Mobile",
        visits: values.length
          ? values.reduce((sum, value) => sum + value, 0)
          : null,
      };
    }),
  );
  readonly series: readonly ChartSeries<Month>[] = [
    { id: "desktop", key: "desktop", label: "Desktop" },
    { id: "mobile", key: "mobile", label: "Mobile" },
  ];
  readonly measure: ChartMeasure<Device> = {
    id: "visits",
    key: "visits",
    label: "Visits",
  };
  private readonly periodSelect =
    viewChild.required<ElementRef<HTMLSelectElement>>("period");
  private readonly rangeButton =
    viewChild<ElementRef<HTMLButtonElement>>("rangeButton");
  private readonly rangeFields =
    viewChild<ElementRef<HTMLElement>>("rangeFields");
  constructor() {
    effect(() => {
      const range = this.range();
      const available = this.canSelectRange();
      untracked(() => {
        const fields = this.rangeFields()?.nativeElement;
        const button = this.rangeButton()?.nativeElement;
        const rangeFocused =
          range === null &&
          fields?.contains(fields.ownerDocument.activeElement);
        const unavailableButtonFocused =
          !available && button !== undefined && button.ownerDocument.activeElement === button;
        if (rangeFocused || unavailableButtonFocused)
          this.periodSelect().nativeElement.focus();
      });
    });
  }
  toggleRange(): void {
    this.rangeMode.update((value) => !value);
    this.rangeButton()?.nativeElement.focus();
  }
  cancelRange(): void {
    this.rangeMode.set(false);
  }
  selectRange(event: BarRangeSelection<Month>): void {
    if (!this.rangeMode()) return;
    this.selection.set({
      kind: "range",
      from: event.fromRowId,
      to: event.toRowId,
    });
    this.rangeMode.set(false);
  }
  selectPeriod(value: string): void {
    this.rangeMode.set(false);
    if (value !== "__range__") {
      this.selectMonth(value.startsWith("month:") ? value.slice(6) : "");
      return;
    }
    const rows = this.rows();
    if (!rows.length) return;
    const current = this.selection();
    const anchor = current?.kind === "month" ? current.id : null;
    this.selection.set({
      kind: "range",
      from: anchor ?? rows[0]!.id,
      to: anchor ?? rows.at(-1)!.id,
    });
  }
  selectMonth(id: string): void {
    this.rangeMode.set(false);
    this.selection.set(
      this.rows().some((row) => row.id === id) ? { kind: "month", id } : null,
    );
  }
  selectBound(bound: "from" | "to", id: string): void {
    this.rangeMode.set(false);
    this.selection.update((period) =>
      changePeriodBound(this.rows(), period, bound, id),
    );
  }
  reset(): void {
    this.rangeMode.set(false);
    this.selection.set(null);
    this.periodSelect().nativeElement.focus();
  }
}`;function P(a,p){a&1&&(fi(0,`p`,11),rC(1,` Clipboard access is unavailable. Select the source above to copy it manually. `),dl())}var M=class a{rows=e;theme=g(d).theme;source=k;copied=Po(!1);copyFailed=Po(!1);async copySource(){try{await navigator.clipboard.writeText(this.source),this.copied.set(!0),this.copyFailed.set(!1)}catch{this.copied.set(!1),this.copyFailed.set(!0)}}static ɵfac=function(l){return new(l||a)};static ɵcmp=pT({type:a,selectors:[[`app-linked-charts`]],decls:41,vars:6,consts:[[1,`gallery`],[1,`gallery-content`],[1,`gallery-heading`],[3,`data`,`theme`],[`id`,`linking-pattern`,`aria-labelledby`,`linking-title`,1,`linking-guide`],[`id`,`linking-title`],[1,`code-tools`],[`type`,`button`,3,`click`],[3,`name`],[`tabindex`,`0`,`aria-label`,`Linked charts Angular source`],[3,`appHighlight`],[`role`,`status`],[`href`,`https://github.com/phalla-doll/ng-echarts/blob/main/docs/LINKED_CHARTS.md`],[`name`,`arrow`],[1,`gallery-footer`],[`routerLink`,`/linked-validation`],[`aria-label`,`On this page`,1,`page-outline`],[`routerLink`,`.`,`fragment`,`linking-pattern`],[`routerLink`,`/linked-validation`,1,`outline-playground`]],template:function(l,o){l&1&&(fi(0,`main`,0)(1,`div`,1)(2,`header`,2)(3,`div`)(4,`h1`),rC(5,`Linked Charts`),dl(),fi(6,`p`),rC(7,`Explore device share for a month or a custom range.`),dl()()(),mg(8,`app-linked-visits`,3),fi(9,`section`,4)(10,`h2`,5),rC(11,`Linking pattern`),dl(),fi(12,`p`),rC(13,` Choose a month or an inclusive range to connect the overview and detail. Chart legends stay independent. Use the period fields or the overview’s data table with a keyboard. `),dl(),fi(14,`details`)(15,`summary`),rC(16,`Standalone Angular example`),dl(),fi(17,`div`,6)(18,`button`,7),bg(`click`,function(){return o.copySource()}),mg(19,`app-site-icon`,8),rC(20),dl()(),fi(21,`pre`,9),mg(22,`code`,10),dl()(),yw(23,P,2,0,`p`,11),fi(24,`a`,12),rC(25,`Read the integration guide`),mg(26,`app-site-icon`,13),dl()(),fi(27,`footer`,14)(28,`p`),rC(29,` Examples use the local workspace package. Public npm installation is not available yet. `),dl(),fi(30,`a`,15),rC(31,`Open linked validation`),mg(32,`app-site-icon`,13),dl()()(),fi(33,`aside`,16)(34,`p`),rC(35,`On this page`),dl(),fi(36,`a`,17),rC(37,`Linking pattern`),dl(),fi(38,`a`,18),rC(39,`Linked validation`),mg(40,`app-site-icon`,13),dl()()()),l&2&&(NI(8),gg(`data`,o.rows)(`theme`,o.theme()),NI(11),gg(`name`,o.copied()?`check`:`copy`),NI(),yl(``,o.copied()?`Copied`:`Copy example`,` `),NI(2),gg(`appHighlight`,o.source),NI(),Ew(o.copyFailed()?23:-1))},dependencies:[Y,_t,f,hn],styles:[`[_nghost-%COMP%]{display:block}.gallery[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,640px) 150px;gap:64px;max-width:var(--%NS%site-page-width);margin:auto;padding:var(--%NS%site-page-top) var(--%NS%site-page-gutter) var(--%NS%site-page-bottom)}.gallery-content[_ngcontent-%COMP%]{min-width:0}.gallery-heading[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:64px}h1[_ngcontent-%COMP%]{margin:0;font-size:var(--%NS%site-title-size);font-weight:600;line-height:var(--%NS%site-title-line);letter-spacing:-1px}.gallery-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:8px 0 0;color:var(--%NS%site-muted);font-size:14px;line-height:24px}.copy-page[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;flex:none;gap:6px;margin-top:4px;padding:5px 10px;border:1px solid var(--%NS%site-border);border-radius:6px;font:inherit;font-size:12px;line-height:20px;color:var(--%NS%site-muted);background:var(--%NS%site-surface)}.copy-page[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:14px;height:14px}.gallery-examples[_ngcontent-%COMP%]{display:grid;gap:48px}.page-outline[_ngcontent-%COMP%]{position:sticky;top:calc(var(--%NS%site-header-height) + 48px);align-self:start;margin-top:10px;font-size:12px;line-height:20px}.page-outline[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0 0 12px;color:var(--%NS%site-muted)}.page-outline[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:block;padding:8px 0 8px 16px;border-left:1px solid var(--%NS%site-border);color:var(--%NS%site-muted);text-decoration:none;font-size:11px;line-height:16px}.page-outline[_ngcontent-%COMP%]   a.active[_ngcontent-%COMP%]{color:var(--%NS%site-text)}.page-outline[_ngcontent-%COMP%]   .outline-playground[_ngcontent-%COMP%]{display:flex;align-items:center;gap:5px;margin-top:24px;padding-left:0;border:0}.outline-playground[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.gallery-footer[_ngcontent-%COMP%]{border-top:1px solid var(--%NS%site-border);margin-top:48px;padding-top:24px;color:var(--%NS%site-muted);font-size:11px;line-height:18px}.gallery-footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:5px;margin-top:8px;color:var(--%NS%site-text);text-decoration:none}.gallery-footer[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.gallery-note[_ngcontent-%COMP%]{font-size:12px;line-height:20px;color:var(--%NS%site-muted)}@media(max-width:1250px){.gallery[_ngcontent-%COMP%]{display:block}.page-outline[_ngcontent-%COMP%]{display:none}}@media(max-width:600px){.gallery-heading[_ngcontent-%COMP%]{flex-direction:column;gap:16px;margin-bottom:40px}.gallery-examples[_ngcontent-%COMP%]{gap:40px}.copy-page[_ngcontent-%COMP%]{margin-top:0}}`,`.gallery-heading[_ngcontent-%COMP%]{margin-bottom:36px}.linking-guide[_ngcontent-%COMP%]{margin-top:32px}h2[_ngcontent-%COMP%]{font-size:20px;font-weight:500;line-height:32px;margin:0 0 12px}.linking-guide[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:var(--%NS%site-muted);font-size:13px;line-height:22px}details[_ngcontent-%COMP%]{margin:24px 0;border:1px solid var(--%NS%site-border);border-radius:var(--%NS%site-panel-radius);min-width:0}summary[_ngcontent-%COMP%]{padding:12px 16px;cursor:pointer;font-size:12px}pre[_ngcontent-%COMP%]{margin:0;padding:16px;max-height:480px;overflow:auto;font-size:12px;line-height:20px;border-top:1px solid var(--%NS%site-border)}a[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;color:var(--%NS%site-text);font-size:12px;line-height:20px}a[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.code-tools[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;padding:8px 12px;border-top:1px solid var(--%NS%site-border)}.code-tools[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;border:0;background:transparent;font:inherit;color:var(--%NS%site-text);font-size:12px;cursor:pointer;padding:4px}.code-tools[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}`]})};export{M as LinkedCharts};