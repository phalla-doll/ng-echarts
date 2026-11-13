import{t as hn}from"./chunk-hs90fSUX.js";import{t as e}from"./chunk-B7Ng-UbO.js";import{n as f,r as fr,t as d}from"./main-7Z5UHGPN.js";import{t as R}from"./chunk-DxrPBDmN.js";import"./chunk-CbYUXrqy.js";import"./chunk-vKIIeP6J.js";import"./chunk-HOZcQHEo.js";import{A as Lo,Ct as dg,Fn as yI,It as g,Mt as fi,Nt as fl,S as Ig,St as cw,Tn as ug,Zt as nT,pn as qw,vn as sl,yn as sw}from"./chunk-BtXVNPlF.js";var k=`import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
  signal,
} from "@angular/core";
import { BarChart, type ChartSeries } from "@ng-echarts/chart-library/bar";
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
@Component({
  selector: "app-root",
  imports: [BarChart, PieChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<label
      >Month
      <select #month [value]="selectedId()" (change)="selectMonth(month.value)">
        <option value="">All months</option>
        @for (row of rows(); track row.id) {
          <option [value]="row.id">{{ row.month }}</option>
        }
      </select>
    </label>
    <p role="status">Device share for {{ context() }}</p>
    <nec-bar-chart
      title="Monthly visits"
      description="Select a bar or a table value to update device share."
      [data]="rows()"
      rowIdKey="id"
      categoryKey="month"
      [series]="series"
      [selectedRowId]="selectedId() || null"
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
  readonly selectedId = linkedSignal<readonly Month[], string>({
    source: this.rows,
    computation: (rows, previous) =>
      rows.some((row) => row.id === previous?.value) ? previous!.value : "",
  });
  readonly context = computed(
    () =>
      this.rows().find((row) => row.id === this.selectedId())?.month ??
      "All months",
  );
  readonly share = computed<readonly Device[]>(() => {
    const scope = this.selectedId()
      ? this.rows().filter((row) => row.id === this.selectedId())
      : this.rows();
    return (["desktop", "mobile"] as const).map((key) => {
      const values = scope.flatMap((row) =>
        row[key] === null ? [] : [row[key]],
      );
      return {
        id: key,
        device: key === "desktop" ? "Desktop" : "Mobile",
        visits: values.length
          ? values.reduce((sum, value) => sum + value, 0)
          : null,
      };
    });
  });
  readonly series: readonly ChartSeries<Month>[] = [
    { id: "desktop", key: "desktop", label: "Desktop" },
    { id: "mobile", key: "mobile", label: "Mobile" },
  ];
  readonly measure: ChartMeasure<Device> = {
    id: "visits",
    key: "visits",
    label: "Visits",
  };
  selectMonth(id: string): void {
    this.selectedId.set(this.rows().some((row) => row.id === id) ? id : "");
  }
}`;function _(r,d){r&1&&(fi(0,`p`,11),qw(1,` Clipboard access is unavailable. Select the source above to copy it manually. `),sl())}var S=class r{rows=e;theme=g(d).theme;source=k;copied=Lo(!1);copyFailed=Lo(!1);async copySource(){try{await navigator.clipboard.writeText(this.source),this.copied.set(!0),this.copyFailed.set(!1)}catch{this.copied.set(!1),this.copyFailed.set(!0)}}static ɵfac=function(l){return new(l||r)};static ɵcmp=nT({type:r,selectors:[[`app-linked-charts`]],decls:41,vars:6,consts:[[1,`gallery`],[1,`gallery-content`],[1,`gallery-heading`],[3,`data`,`theme`],[`id`,`linking-pattern`,`aria-labelledby`,`linking-title`,1,`linking-guide`],[`id`,`linking-title`],[1,`code-tools`],[`type`,`button`,3,`click`],[3,`name`],[`tabindex`,`0`,`aria-label`,`Linked charts Angular source`],[3,`appHighlight`],[`role`,`status`],[`href`,`https://github.com/phalla-doll/ng-echarts/blob/main/docs/LINKED_CHARTS.md`],[`name`,`arrow`],[1,`gallery-footer`],[`routerLink`,`/linked-validation`],[`aria-label`,`On this page`,1,`page-outline`],[`routerLink`,`.`,`fragment`,`linking-pattern`],[`routerLink`,`/linked-validation`,1,`outline-playground`]],template:function(l,i){l&1&&(fi(0,`main`,0)(1,`div`,1)(2,`header`,2)(3,`div`)(4,`h1`),qw(5,`Linked Charts`),sl(),fi(6,`p`),qw(7,`Select a month to explore its device share.`),sl()()(),dg(8,`app-linked-visits`,3),fi(9,`section`,4)(10,`h2`,5),qw(11,`Linking pattern`),sl(),fi(12,`p`),qw(13,` One selected month connects the overview and detail. Chart legends stay independent. Use the month selector or open the overview’s data table for keyboard selection. `),sl(),fi(14,`details`)(15,`summary`),qw(16,`Standalone Angular example`),sl(),fi(17,`div`,6)(18,`button`,7),Ig(`click`,function(){return i.copySource()}),dg(19,`app-site-icon`,8),qw(20),sl()(),fi(21,`pre`,9),dg(22,`code`,10),sl()(),sw(23,_,2,0,`p`,11),fi(24,`a`,12),qw(25,`Read the integration guide`),dg(26,`app-site-icon`,13),sl()(),fi(27,`footer`,14)(28,`p`),qw(29,` Examples use the local workspace package. Public npm installation is not available yet. `),sl(),fi(30,`a`,15),qw(31,`Open linked validation`),dg(32,`app-site-icon`,13),sl()()(),fi(33,`aside`,16)(34,`p`),qw(35,`On this page`),sl(),fi(36,`a`,17),qw(37,`Linking pattern`),sl(),fi(38,`a`,18),qw(39,`Linked validation`),dg(40,`app-site-icon`,13),sl()()()),l&2&&(yI(8),ug(`data`,i.rows)(`theme`,i.theme()),yI(11),ug(`name`,i.copied()?`check`:`copy`),yI(),fl(``,i.copied()?`Copied`:`Copy example`,` `),yI(2),ug(`appHighlight`,i.source),yI(),cw(i.copyFailed()?23:-1))},dependencies:[R,fr,f,hn],styles:[`[_nghost-%COMP%]{display:block}.gallery[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,640px) 150px;gap:64px;max-width:var(--%NS%site-page-width);margin:auto;padding:var(--%NS%site-page-top) var(--%NS%site-page-gutter) var(--%NS%site-page-bottom)}.gallery-content[_ngcontent-%COMP%]{min-width:0}.gallery-heading[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:64px}h1[_ngcontent-%COMP%]{margin:0;font-size:var(--%NS%site-title-size);font-weight:600;line-height:var(--%NS%site-title-line);letter-spacing:-1px}.gallery-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:8px 0 0;color:var(--%NS%site-muted);font-size:14px;line-height:24px}.copy-page[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;flex:none;gap:6px;margin-top:4px;padding:5px 10px;border:1px solid var(--%NS%site-border);border-radius:6px;font:inherit;font-size:12px;line-height:20px;color:var(--%NS%site-muted);background:var(--%NS%site-surface)}.copy-page[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:14px;height:14px}.gallery-examples[_ngcontent-%COMP%]{display:grid;gap:48px}.page-outline[_ngcontent-%COMP%]{position:sticky;top:calc(var(--%NS%site-header-height) + 48px);align-self:start;margin-top:10px;font-size:12px;line-height:20px}.page-outline[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0 0 12px;color:var(--%NS%site-muted)}.page-outline[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:block;padding:8px 0 8px 16px;border-left:1px solid var(--%NS%site-border);color:var(--%NS%site-muted);text-decoration:none;font-size:11px;line-height:16px}.page-outline[_ngcontent-%COMP%]   a.active[_ngcontent-%COMP%]{color:var(--%NS%site-text)}.page-outline[_ngcontent-%COMP%]   .outline-playground[_ngcontent-%COMP%]{display:flex;align-items:center;gap:5px;margin-top:24px;padding-left:0;border:0}.outline-playground[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.gallery-footer[_ngcontent-%COMP%]{border-top:1px solid var(--%NS%site-border);margin-top:48px;padding-top:24px;color:var(--%NS%site-muted);font-size:11px;line-height:18px}.gallery-footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:5px;margin-top:8px;color:var(--%NS%site-text);text-decoration:none}.gallery-footer[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.gallery-note[_ngcontent-%COMP%]{font-size:12px;line-height:20px;color:var(--%NS%site-muted)}@media(max-width:1250px){.gallery[_ngcontent-%COMP%]{display:block}.page-outline[_ngcontent-%COMP%]{display:none}}@media(max-width:600px){.gallery-heading[_ngcontent-%COMP%]{flex-direction:column;gap:16px;margin-bottom:40px}.gallery-examples[_ngcontent-%COMP%]{gap:40px}.copy-page[_ngcontent-%COMP%]{margin-top:0}}`,`.gallery-heading[_ngcontent-%COMP%]{margin-bottom:36px}.linking-guide[_ngcontent-%COMP%]{margin-top:32px}h2[_ngcontent-%COMP%]{font-size:20px;font-weight:500;line-height:32px;margin:0 0 12px}.linking-guide[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:var(--%NS%site-muted);font-size:13px;line-height:22px}details[_ngcontent-%COMP%]{margin:24px 0;border:1px solid var(--%NS%site-border);border-radius:var(--%NS%site-panel-radius);min-width:0}summary[_ngcontent-%COMP%]{padding:12px 16px;cursor:pointer;font-size:12px}pre[_ngcontent-%COMP%]{margin:0;padding:16px;max-height:480px;overflow:auto;font-size:12px;line-height:20px;border-top:1px solid var(--%NS%site-border)}a[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;color:var(--%NS%site-text);font-size:12px;line-height:20px}a[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.code-tools[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;padding:8px 12px;border-top:1px solid var(--%NS%site-border)}.code-tools[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;border:0;background:transparent;font:inherit;color:var(--%NS%site-text);font-size:12px;cursor:pointer;padding:4px}.code-tools[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}`]})};export{S as LinkedCharts};