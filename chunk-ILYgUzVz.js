import{t as Se}from"./chunk-Cx6W3sfb.js";import{t as Oe}from"./chunk-DC5W9wvI.js";import{n as fr,r as ne,t as c}from"./main-JO3ACXYL.js";import"./chunk-B1JFOHU7.js";import{$n as zw,Ct as Zg,D as HI,E as Gg,Gn as yC,L as KF,Ln as wT,Mn as ud,On as tC,Q as Og,Rn as wi,Rt as eC,S as FC,V as LC,Wn as xg,Wt as gg,_ as Dw,_t as Ww,a as Ag,cn as lm,et as Pw,f as Bg,gt as Wo,ht as Wg,it as Rw,j as JF,l as Aw,ln as m,p as Cl,q as Mw,rn as kd,sn as ld,w as Fw}from"./chunk-BCV1fTjr.js";import{n as s,t as r}from"./chunk-B6Fy8hbW.js";var le=[`month`];var ce=[`resetMonth`];var $=(o,t)=>t.id;function pe(o,t){if(o&1&&(wi(0,`option`,8),yC(1),Cl()),o&2){let n=t.$implicit;Ag(`value`,n.id),HI(),Zg(n.month)}}function he(o,t){if(o&1&&(wi(0,`option`,8),yC(1),Cl()),o&2){let n=t.$implicit;Ag(`value`,n.id),HI(),Zg(n.month)}}function me(o,t){if(o&1&&(wi(0,`option`,8),yC(1),Cl()),o&2){let n=t.$implicit;Ag(`value`,n.id),HI(),Zg(n.month)}}function ue(o,t){if(o&1){let n=Ww();wi(0,`button`,10,5),Bg(`click`,function(){ld(n);let c=zw();return ud(c.reset())}),yC(2,`Reset dashboard month`),Cl()}}function A(o,t){if(t===null)return null;let n=o.findIndex(s=>s.id===t.from),e=o.findIndex(s=>s.id===t.to);if(n<0||e<0)return null;return Math.min(n,e)===0&&Math.max(n,e)===o.length-1?null:n<=e?t:{from:t.to,to:t.from}}function F(o,t){let n=A(o,t);return n===null?o:o.slice(o.findIndex(e=>e.id===n.from),o.findIndex(e=>e.id===n.to)+1)}function be(o,t,n,e=null){if(!o.length)return null;let c=F(o,t),l=o.findIndex(R=>R.id===c[0].id),s=c.length,C=n===`in`?Math.max(1,Math.ceil(s/2)):n===`out`?Math.min(o.length,s*2):s,V=c.findIndex(R=>R.id===e),se=l+(V<0?Math.floor((s-1)/2):V),de=n===`previous`?l-s:n===`next`?l+s:se-Math.floor((C-1)/2),B=Math.max(0,Math.min(o.length-C,de));return C===o.length?null:{from:o[B].id,to:o[B+C-1].id}}function ge(o){return o.map((t,n)=>{let e=o.slice(Math.max(0,n-2),n+1),c=e.every(l=>l.desktop!==null&&l.mobile!==null);return s(r({},t),{trend:c?e.reduce((l,s)=>l+s.desktop+s.mobile,0)/e.length:null})})}function ve(o){return[`desktop`,`mobile`].map(t=>{let n=o.flatMap(e=>e[t]===null?[]:[e[t]]);return{id:t,device:t===`desktop`?`Desktop`:`Mobile`,visits:n.length?n.reduce((e,c)=>e+c,0):null,missing:o.length-n.length}})}var O=class o{data=KF.required();theme=KF(`light`);showDataTable=KF(!0);monthField=JF.required(`month`);resetButton=JF(`resetMonth`);kind=Wo(`bar`);window=FC({source:this.data,computation:(t,n)=>A(t,n?.value??null)});visibleRows=LC(()=>F(this.data(),this.window()));fullWindow=LC(()=>this.visibleRows().length===this.data().length);canMovePrevious=LC(()=>this.visibleRows()[0]?.id!==this.data()[0]?.id);canMoveNext=LC(()=>this.visibleRows().at(-1)?.id!==this.data().at(-1)?.id);windowContext=LC(()=>{let t=this.visibleRows();return t.length?`Viewing ${t[0].month}\u2013${t.at(-1).month} \xB7 ${t.length} of ${this.data().length} months.`:`No months to display.`});selectedDevice=Wo(null);selectedId=FC({source:this.visibleRows,computation:(t,n)=>t.some(e=>e.id===n?.value)?n.value:null});overview=LC(()=>F(ge(this.data()),this.window()));series=LC(()=>[{id:`desktop`,key:`desktop`,label:`Desktop`,kind:this.kind(),stack:`visits`},{id:`mobile`,key:`mobile`,label:`Mobile`,kind:this.kind(),stack:`visits`},{id:`trend`,key:`trend`,label:`3-month mean`,kind:`line`}]);scope=LC(()=>this.selectedId()===null?this.visibleRows():this.visibleRows().filter(t=>t.id===this.selectedId()));detail=LC(()=>{let t=this.selectedDevice();return t===null?ve(this.scope()):this.visibleRows().map(n=>({id:n.id,device:n.month,visits:n[t],missing:n[t]===null?1:0}))});context=LC(()=>this.data().length?this.selectedId()===null?this.fullWindow()?`All months selected.`:`All visible months selected.`:`${this.scope()[0].month} selected.`:`No months available.`);detailTitle=LC(()=>this.selectedDevice()===null?`Recorded device visits \xB7 ${this.selectedId()===null?this.fullWindow()?`All months`:`Visible months`:this.scope()[0].month}`:`${this.selectedDevice()===`desktop`?`Desktop`:`Mobile`} visits by month`);completeness=LC(()=>{if(!this.data().length)return`No device observations available.`;let t=this.detail().reduce((n,e)=>n+e.missing,0);return t?`${t} missing device observation${t===1?``:`s`}. Recorded sums may be partial.`:`All device observations are recorded for this period.`});action=FC({source:()=>[this.data(),this.selectedId(),this.window(),this.selectedDevice()],computation:()=>``});detailSeries=[{id:`visits`,key:`visits`,label:`Visits`}];monthTick=t=>t.slice(0,3);constructor(){kd(()=>{let t=this.selectedId();lm(()=>{let n=this.resetButton()?.nativeElement;t===null&&n&&n.ownerDocument.activeElement===n&&this.monthField().nativeElement.focus()})})}selectMonth(t){this.selectedId.set(this.visibleRows().some(n=>n.id===t)?t:null),this.action.set(``)}changeWindowBound(t,n){let e=this.data(),c=this.visibleRows();if(!e.some(s=>s.id===n)||!c.length)return;let l={from:c[0].id,to:c.at(-1).id,[t]:n};e.findIndex(s=>s.id===l.from)>e.findIndex(s=>s.id===l.to)&&(l.from=l.to=n),this.window.set(A(e,l))}moveWindow(t){!this.data().length||t===`in`&&this.visibleRows().length<=1||t===`out`&&this.fullWindow()||t===`previous`&&!this.canMovePrevious()||t===`next`&&!this.canMoveNext()||this.window.set(be(this.data(),this.window(),t,this.selectedId()))}resetWindow(){this.fullWindow()||this.window.set(null)}selectDevice(t){this.selectedDevice.set(t===`desktop`||t===`mobile`?t:null),this.action.set(``)}selectDetailPoint(t){this.selectedDevice()===null?this.selectDevice(t.rowId):(this.selectMonth(t.rowId),this.action.set(`${this.data().find(n=>n.id===t.rowId)?.month}: ${this.selectedDevice()}, ${new Intl.NumberFormat(`en-US`).format(t.value)} visits (${t.source}).`))}selectPoint(t){this.selectMonth(t.rowId);let n=t.seriesId===`trend`?`3-month mean`:t.seriesId===`desktop`?`Desktop`:`Mobile`;this.action.set(`${t.row.month}: ${n}, ${new Intl.NumberFormat(`en-US`).format(t.value)} visits (${t.source}).`)}reset(){this.selectMonth(``),this.monthField().nativeElement.focus()}static ɵfac=function(n){return new(n||o)};static ɵcmp=wT({type:o,selectors:[[`app-composed-dashboard`]],viewQuery:function(n,e){n&1&&Wg(e.monthField,le,5)(e.resetButton,ce,5),n&2&&eC(2)},hostVars:1,hostBindings:function(n,e){n&2&&xg(`data-theme`,e.theme())},inputs:{data:[1,`data`],theme:[1,`theme`],showDataTable:[1,`showDataTable`]},decls:65,vars:42,consts:[[`from`,``],[`to`,``],[`month`,``],[`device`,``],[`style`,``],[`resetMonth`,``],[1,`dashboard-window-controls`],[3,`change`,`value`,`disabled`],[3,`value`],[1,`dashboard-window-actions`],[`type`,`button`,3,`click`],[`role`,`status`,1,`dashboard-window`],[1,`dashboard-controls`],[3,`change`,`value`],[`value`,``],[`value`,`desktop`],[`value`,`mobile`],[`value`,`bar`],[`value`,`area`],[`type`,`button`],[`role`,`status`,1,`dashboard-context`],[1,`dashboard-pair`],[`title`,`Monthly visits and trend`,`description`,`Desktop and mobile share a stack. The line uses up to three supplied months, including observations before the visible window. Incomplete windows have no mean. Choose a month from either chart or the Month field.`,`rowIdKey`,`id`,`categoryKey`,`month`,3,`pointSelect`,`data`,`series`,`theme`,`showDataTable`,`height`,`categoryTickFormatter`],[`rowIdKey`,`id`,`categoryKey`,`device`,`layout`,`horizontal`,3,`pointSelect`,`title`,`description`,`data`,`series`,`selectedRowId`,`theme`,`showDataTable`,`height`],[1,`dashboard-missing`],[`role`,`status`,1,`dashboard-action`]],template:function(n,e){if(n&1){let c=Ww();wi(0,`fieldset`,6)(1,`legend`),yC(2,`Visible months`),Cl(),wi(3,`label`),yC(4,`From `),wi(5,`select`,7,0),Bg(`change`,function(){ld(c);let s=tC(6);return ud(e.changeWindowBound(`from`,s.value))}),Pw(7,pe,2,2,`option`,8,$),Cl()(),wi(9,`label`),yC(10,`To `),wi(11,`select`,7,1),Bg(`change`,function(){ld(c);let s=tC(12);return ud(e.changeWindowBound(`to`,s.value))}),Pw(13,he,2,2,`option`,8,$),Cl()(),wi(15,`div`,9)(16,`button`,10),Bg(`click`,function(){return e.moveWindow(`in`)}),yC(17,` Zoom in `),Cl(),wi(18,`button`,10),Bg(`click`,function(){return e.moveWindow(`out`)}),yC(19,` Zoom out `),Cl(),wi(20,`button`,10),Bg(`click`,function(){return e.moveWindow(`previous`)}),yC(21,` Previous window `),Cl(),wi(22,`button`,10),Bg(`click`,function(){return e.moveWindow(`next`)}),yC(23,` Next window `),Cl(),wi(24,`button`,10),Bg(`click`,function(){return e.resetWindow()}),yC(25,` Reset zoom `),Cl()()(),wi(26,`p`,11),yC(27),Cl(),wi(28,`div`,12)(29,`label`),yC(30,`Month `),wi(31,`select`,13,2),Bg(`change`,function(){ld(c);let s=tC(32);return ud(e.selectMonth(s.value))}),wi(33,`option`,14),yC(34),Cl(),Pw(35,me,2,2,`option`,8,$),Cl()(),wi(37,`label`),yC(38,`Device `),wi(39,`select`,13,3),Bg(`change`,function(){ld(c);let s=tC(40);return ud(e.selectDevice(s.value))}),wi(41,`option`,14),yC(42,`All devices`),Cl(),wi(43,`option`,15),yC(44,`Desktop`),Cl(),wi(45,`option`,16),yC(46,`Mobile`),Cl()()(),wi(47,`label`),yC(48,`Overview style `),wi(49,`select`,13,4),Bg(`change`,function(){ld(c);let s=tC(50);return ud(e.kind.set(s.value===`area`?`area`:`bar`))}),wi(51,`option`,17),yC(52,`Stacked bars`),Cl(),wi(53,`option`,18),yC(54,`Stacked areas`),Cl()()(),Aw(55,ue,3,0,`button`,19),Cl(),wi(56,`p`,20),yC(57),Cl(),wi(58,`div`,21)(59,`nec-composed-chart`,22),Bg(`pointSelect`,function(s){return e.selectPoint(s)}),Cl(),wi(60,`nec-bar-chart`,23),Bg(`pointSelect`,function(s){return e.selectDetailPoint(s)}),Cl()(),wi(61,`p`,24),yC(62),Cl(),wi(63,`p`,25),yC(64),Cl()}n&2&&(HI(5),Gg(`color-scheme`,e.theme()),Ag(`value`,e.visibleRows()[0]?.id??``)(`disabled`,!e.data().length),HI(2),Fw(e.data()),HI(4),Gg(`color-scheme`,e.theme()),Ag(`value`,e.visibleRows().at(-1)?.id??``)(`disabled`,!e.data().length),HI(2),Fw(e.data()),HI(3),xg(`aria-disabled`,e.visibleRows().length<=1?`true`:null),HI(2),xg(`aria-disabled`,e.fullWindow()?`true`:null),HI(2),xg(`aria-disabled`,e.canMovePrevious()?null:`true`),HI(2),xg(`aria-disabled`,e.canMoveNext()?null:`true`),HI(2),xg(`aria-disabled`,e.fullWindow()?`true`:null),HI(3),Zg(e.windowContext()),HI(4),Gg(`color-scheme`,e.theme()),Ag(`value`,e.selectedId()??``),HI(3),Zg(e.fullWindow()?`All months`:`All visible months`),HI(),Fw(e.visibleRows()),HI(4),Gg(`color-scheme`,e.theme()),Ag(`value`,e.selectedDevice()??``),HI(10),Gg(`color-scheme`,e.theme()),Ag(`value`,e.kind()),HI(6),Rw(e.selectedId()!==null?55:-1),HI(2),Zg(e.context()),HI(2),Ag(`data`,e.overview())(`series`,e.series())(`theme`,e.theme())(`showDataTable`,e.showDataTable())(`height`,280)(`categoryTickFormatter`,e.monthTick),HI(),Ag(`title`,e.detailTitle())(`description`,e.selectedDevice()===null?`Recorded visits for the selected period. Choose a device to explore its months. Missing observations are excluded from sums. Legends are independent.`:`Monthly recorded visits for the chosen device in the visible window. Choose a month here to update the overview selection. Missing values stay missing.`)(`data`,e.detail())(`series`,e.detailSeries)(`selectedRowId`,e.selectedDevice()===null?null:e.selectedId())(`theme`,e.theme())(`showDataTable`,e.showDataTable())(`height`,280),HI(2),Zg(e.completeness()),HI(2),Zg(e.action()))},dependencies:[Oe,Se],styles:[`[_nghost-%COMP%]{display:block;min-width:0;container:dashboard / inline-size;--%NS%nec-background: var(--%NS%site-bg, #fff);--%NS%nec-text: var(--%NS%site-text, #18202c);--%NS%nec-muted: var(--%NS%site-muted, #536176);--%NS%nec-border: var(--%NS%site-border, #d6dce5)}[data-theme="light"][_nghost-%COMP%]{--%NS%site-bg: #fff;--%NS%site-text: #18202c;--%NS%site-muted: #536176;--%NS%site-border: #d6dce5}[data-theme="dark"][_nghost-%COMP%]{--%NS%site-bg: #18202c;--%NS%site-text: #edf2fa;--%NS%site-muted: #b2bfd2;--%NS%site-border: #3b4a61}.dashboard-window-controls[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:end;gap:12px 20px;margin:0;padding:16px;border:1px solid var(--%NS%site-border, #d6dce5);border-radius:8px;min-width:0}legend[_ngcontent-%COMP%]{padding:0 6px;font-size:14px}.dashboard-window-actions[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px}button[_ngcontent-%COMP%]:disabled, button[aria-disabled=true][_ngcontent-%COMP%]{opacity:.5;cursor:default}.dashboard-window[_ngcontent-%COMP%]{font-size:13px;line-height:1.6;color:var(--%NS%site-muted, #536176)}.dashboard-controls[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:end}label[_ngcontent-%COMP%]{display:grid;gap:6px;font-size:13px;color:var(--%NS%site-muted, #536176)}select[_ngcontent-%COMP%], button[_ngcontent-%COMP%]{min-height:40px;max-width:100%;padding:8px 12px;font:inherit;border:1px solid var(--%NS%site-border, #d6dce5);border-radius:6px;color:var(--%NS%site-text, #18202c);background:var(--%NS%site-bg, #fff);cursor:pointer}select[_ngcontent-%COMP%]:focus-visible, button[_ngcontent-%COMP%]:focus-visible{outline:2px solid #2563eb;outline-offset:3px}.dashboard-context[_ngcontent-%COMP%]{margin:20px 0;font-size:14px;color:var(--%NS%site-text, #18202c)}.dashboard-pair[_ngcontent-%COMP%]{display:grid;gap:20px}.dashboard-pair[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]{min-width:0;border:1px solid var(--%NS%site-border, #d6dce5);border-radius:8px}.dashboard-missing[_ngcontent-%COMP%], .dashboard-action[_ngcontent-%COMP%]{font-size:13px;line-height:1.6;color:var(--%NS%site-muted, #536176)}.dashboard-action[_ngcontent-%COMP%]{min-height:21px}@container dashboard (min-width: 820px){.dashboard-pair[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);align-items:start}}`]})};var ie=[{id:`jan`,month:`January`,desktop:120,mobile:80},{id:`feb`,month:`February`,desktop:200,mobile:0},{id:`mar`,month:`March`,desktop:null,mobile:40},{id:`apr`,month:`April`,desktop:60,mobile:null}];var I=class o{theme=KF(`light`);showDataTable=KF(!0);sample=ie;rows=Wo(ie);dark=FC(()=>this.theme()===`dark`);refresh(){this.rows.update(t=>t.map(n=>s(r({},n),{desktop:n.desktop===null?null:n.desktop+10})))}reverse(){this.rows.update(t=>[...t].reverse())}remove(){this.rows.update(t=>t.filter(n=>n.id!==`feb`))}static ɵfac=function(n){return new(n||o)};static ɵcmp=wT({type:o,selectors:[[`app-root`],[`app-dashboard-pilot`]],inputs:{theme:[1,`theme`],showDataTable:[1,`showDataTable`]},decls:19,vars:4,consts:[[1,`controls`],[`type`,`button`,3,`click`],[3,`data`,`theme`,`showDataTable`]],template:function(n,e){n&1&&(wi(0,`main`)(1,`h1`),yC(2,`Visits dashboard`),Cl(),wi(3,`p`),yC(4,`Explore recorded device visits and compare monthly trends.`),Cl(),wi(5,`div`,0)(6,`button`,1),Bg(`click`,function(){return e.refresh()}),yC(7,`Refresh visits`),Cl(),wi(8,`button`,1),Bg(`click`,function(){return e.reverse()}),yC(9,`Reverse months`),Cl(),wi(10,`button`,1),Bg(`click`,function(){return e.remove()}),yC(11,`Remove February`),Cl(),wi(12,`button`,1),Bg(`click`,function(){return e.rows.set([])}),yC(13,`Clear months`),Cl(),wi(14,`button`,1),Bg(`click`,function(){return e.rows.set(e.sample)}),yC(15,`Restore months`),Cl(),wi(16,`button`,1),Bg(`click`,function(){return e.dark.set(!e.dark())}),yC(17,` Dark theme `),Cl()(),Og(18,`app-composed-dashboard`,2),Cl()),n&2&&(HI(16),xg(`aria-pressed`,e.dark()),HI(2),Ag(`data`,e.rows())(`theme`,e.dark()?`dark`:`light`)(`showDataTable`,e.showDataTable()))},dependencies:[O],styles:[`[_nghost-%COMP%]{display:block;font-family:system-ui,sans-serif;color:var(--%NS%site-text, #18202c)}main[_ngcontent-%COMP%]{max-width:1180px;padding:24px 12px;margin:auto}h1[_ngcontent-%COMP%]{font-size:28px;font-weight:500}p[_ngcontent-%COMP%]{line-height:1.6}.controls[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0}button[_ngcontent-%COMP%]{min-height:40px;padding:8px 12px;font:inherit;color:var(--%NS%site-text, #18202c);background:var(--%NS%site-bg, white);border:1px solid var(--%NS%site-border, #d6dce5);border-radius:6px;cursor:pointer}button[_ngcontent-%COMP%]:focus-visible{outline:2px solid #2563eb;outline-offset:3px}`]})};var ae=`import {
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

export type DashboardWindow = { readonly from: string; readonly to: string } | null;

/** Stable endpoint IDs follow supplied order; removing either endpoint restores the full window. */
export function reconcileDashboardWindow(
  rows: readonly DashboardMonth[],
  window: DashboardWindow,
): DashboardWindow {
  if (window === null) return null;
  const from = rows.findIndex((row) => row.id === window.from);
  const to = rows.findIndex((row) => row.id === window.to);
  if (from < 0 || to < 0) return null;
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  if (start === 0 && end === rows.length - 1) return null;
  return from <= to ? window : { from: window.to, to: window.from };
}

export function dashboardWindowRows<T extends DashboardMonth>(
  rows: readonly T[],
  window: DashboardWindow,
): readonly T[] {
  const current = reconcileDashboardWindow(rows, window);
  return current === null
    ? rows
    : rows.slice(
        rows.findIndex((row) => row.id === current.from),
        rows.findIndex((row) => row.id === current.to) + 1,
      );
}

/** Zoom/pan clamp to supplied rows, preserving size at either boundary. */
export function moveDashboardWindow(
  rows: readonly DashboardMonth[],
  window: DashboardWindow,
  action: 'in' | 'out' | 'previous' | 'next',
  anchor: string | null = null,
): DashboardWindow {
  if (!rows.length) return null;
  const current = dashboardWindowRows(rows, window);
  const first = rows.findIndex((row) => row.id === current[0]!.id);
  const size = current.length;
  const count =
    action === 'in'
      ? Math.max(1, Math.ceil(size / 2))
      : action === 'out'
        ? Math.min(rows.length, size * 2)
        : size;
  const selected = current.findIndex((row) => row.id === anchor);
  const center = first + (selected < 0 ? Math.floor((size - 1) / 2) : selected);
  const requested =
    action === 'previous'
      ? first - size
      : action === 'next'
        ? first + size
        : center - Math.floor((count - 1) / 2);
  const start = Math.max(0, Math.min(rows.length - count, requested));
  return count === rows.length ? null : { from: rows[start]!.id, to: rows[start + count - 1]!.id };
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
    <fieldset class="dashboard-window-controls">
      <legend>Visible months</legend>
      <label
        >From
        <select
          #from
          [value]="visibleRows()[0]?.id ?? ''"
          [disabled]="!data().length"
          [style.color-scheme]="theme()"
          (change)="changeWindowBound('from', from.value)"
        >
          @for (row of data(); track row.id) {
            <option [value]="row.id">{{ row.month }}</option>
          }
        </select>
      </label>
      <label
        >To
        <select
          #to
          [value]="visibleRows().at(-1)?.id ?? ''"
          [disabled]="!data().length"
          [style.color-scheme]="theme()"
          (change)="changeWindowBound('to', to.value)"
        >
          @for (row of data(); track row.id) {
            <option [value]="row.id">{{ row.month }}</option>
          }
        </select>
      </label>
      <div class="dashboard-window-actions">
        <button
          type="button"
          [attr.aria-disabled]="visibleRows().length <= 1 ? 'true' : null"
          (click)="moveWindow('in')"
        >
          Zoom in
        </button>
        <button
          type="button"
          [attr.aria-disabled]="fullWindow() ? 'true' : null"
          (click)="moveWindow('out')"
        >
          Zoom out
        </button>
        <button
          type="button"
          [attr.aria-disabled]="!canMovePrevious() ? 'true' : null"
          (click)="moveWindow('previous')"
        >
          Previous window
        </button>
        <button
          type="button"
          [attr.aria-disabled]="!canMoveNext() ? 'true' : null"
          (click)="moveWindow('next')"
        >
          Next window
        </button>
        <button
          type="button"
          [attr.aria-disabled]="fullWindow() ? 'true' : null"
          (click)="resetWindow()"
        >
          Reset zoom
        </button>
      </div>
    </fieldset>
    <p class="dashboard-window" role="status">{{ windowContext() }}</p>
    <div class="dashboard-controls">
      <label
        >Month
        <select
          #month
          [value]="selectedId() ?? ''"
          [style.color-scheme]="theme()"
          (change)="selectMonth(month.value)"
        >
          <option value="">{{ fullWindow() ? 'All months' : 'All visible months' }}</option>
          @for (row of visibleRows(); track row.id) {
            <option [value]="row.id">{{ row.month }}</option>
          }
        </select>
      </label>
      <label
        >Device
        <select
          #device
          [value]="selectedDevice() ?? ''"
          [style.color-scheme]="theme()"
          (change)="selectDevice(device.value)"
        >
          <option value="">All devices</option>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
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
        description="Desktop and mobile share a stack. The line uses up to three supplied months, including observations before the visible window. Incomplete windows have no mean. Choose a month from either chart or the Month field."
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
        [description]="
          selectedDevice() === null
            ? 'Recorded visits for the selected period. Choose a device to explore its months. Missing observations are excluded from sums. Legends are independent.'
            : 'Monthly recorded visits for the chosen device in the visible window. Choose a month here to update the overview selection. Missing values stay missing.'
        "
        [data]="detail()"
        rowIdKey="id"
        categoryKey="device"
        [series]="detailSeries"
        [selectedRowId]="selectedDevice() === null ? null : selectedId()"
        (pointSelect)="selectDetailPoint($event)"
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
    .dashboard-window-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: 12px 20px;
      margin: 0;
      padding: 16px;
      border: 1px solid var(--site-border, #d6dce5);
      border-radius: 8px;
      min-width: 0;
    }
    legend {
      padding: 0 6px;
      font-size: 14px;
    }
    .dashboard-window-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    button:disabled,
    button[aria-disabled='true'] {
      opacity: 0.5;
      cursor: default;
    }
    .dashboard-window {
      font-size: 13px;
      line-height: 1.6;
      color: var(--site-muted, #536176);
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
  protected readonly window = linkedSignal<readonly DashboardMonth[], DashboardWindow>({
    source: this.data,
    computation: (rows, previous) => reconcileDashboardWindow(rows, previous?.value ?? null),
  });
  protected readonly visibleRows = computed(() => dashboardWindowRows(this.data(), this.window()));
  protected readonly fullWindow = computed(() => this.visibleRows().length === this.data().length);
  protected readonly canMovePrevious = computed(
    () => this.visibleRows()[0]?.id !== this.data()[0]?.id,
  );
  protected readonly canMoveNext = computed(
    () => this.visibleRows().at(-1)?.id !== this.data().at(-1)?.id,
  );
  protected readonly windowContext = computed(() => {
    const rows = this.visibleRows();
    return rows.length
      ? \`Viewing \${rows[0]!.month}\u2013\${rows.at(-1)!.month} \xB7 \${rows.length} of \${this.data().length} months.\`
      : 'No months to display.';
  });
  protected readonly selectedDevice = signal<'desktop' | 'mobile' | null>(null);
  protected readonly selectedId = linkedSignal<readonly DashboardMonth[], string | null>({
    source: this.visibleRows,
    computation: (rows, previous) =>
      rows.some((row) => row.id === previous?.value) ? previous!.value : null,
  });
  // Calculate the trailing mean before slicing so zoom does not change its meaning.
  protected readonly overview = computed(() =>
    dashboardWindowRows(dashboardRows(this.data()), this.window()),
  );
  protected readonly series = computed<
    readonly ComposedSeries<ReturnType<typeof dashboardRows>[number]>[]
  >(() => [
    { id: 'desktop', key: 'desktop', label: 'Desktop', kind: this.kind(), stack: 'visits' },
    { id: 'mobile', key: 'mobile', label: 'Mobile', kind: this.kind(), stack: 'visits' },
    { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line' },
  ]);
  protected readonly scope = computed(() =>
    this.selectedId() === null
      ? this.visibleRows()
      : this.visibleRows().filter((row) => row.id === this.selectedId()),
  );
  protected readonly detail = computed(() => {
    const device = this.selectedDevice();
    return device === null
      ? dashboardBreakdown(this.scope())
      : this.visibleRows().map((row) => ({
          id: row.id,
          device: row.month,
          visits: row[device],
          missing: row[device] === null ? 1 : 0,
        }));
  });
  protected readonly context = computed(() =>
    !this.data().length
      ? 'No months available.'
      : this.selectedId() === null
        ? this.fullWindow()
          ? 'All months selected.'
          : 'All visible months selected.'
        : \`\${this.scope()[0]!.month} selected.\`,
  );
  protected readonly detailTitle = computed(() =>
    this.selectedDevice() === null
      ? \`Recorded device visits \xB7 \${this.selectedId() === null ? (this.fullWindow() ? 'All months' : 'Visible months') : this.scope()[0]!.month}\`
      : \`\${this.selectedDevice() === 'desktop' ? 'Desktop' : 'Mobile'} visits by month\`,
  );
  protected readonly completeness = computed(() => {
    if (!this.data().length) return 'No device observations available.';
    const missing = this.detail().reduce((sum, row) => sum + row.missing, 0);
    return missing
      ? \`\${missing} missing device observation\${missing === 1 ? '' : 's'}. Recorded sums may be partial.\`
      : 'All device observations are recorded for this period.';
  });
  protected readonly action = linkedSignal({
    source: () => [this.data(), this.selectedId(), this.window(), this.selectedDevice()],
    computation: () => '',
  });
  protected readonly detailSeries: readonly ChartSeries<{
    id: string;
    device: string;
    visits: number | null;
    missing: number;
  }>[] = [{ id: 'visits', key: 'visits', label: 'Visits' }];
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
    this.selectedId.set(this.visibleRows().some((row) => row.id === id) ? id : null);
    this.action.set('');
  }
  protected changeWindowBound(bound: 'from' | 'to', id: string): void {
    const rows = this.data();
    const current = this.visibleRows();
    if (!rows.some((row) => row.id === id) || !current.length) return;
    const next = { from: current[0]!.id, to: current.at(-1)!.id, [bound]: id };
    if (
      rows.findIndex((row) => row.id === next.from) > rows.findIndex((row) => row.id === next.to)
    ) {
      next.from = next.to = id;
    }
    this.window.set(reconcileDashboardWindow(rows, next));
  }
  protected moveWindow(action: 'in' | 'out' | 'previous' | 'next'): void {
    if (
      !this.data().length ||
      (action === 'in' && this.visibleRows().length <= 1) ||
      (action === 'out' && this.fullWindow()) ||
      (action === 'previous' && !this.canMovePrevious()) ||
      (action === 'next' && !this.canMoveNext())
    )
      return;
    this.window.set(moveDashboardWindow(this.data(), this.window(), action, this.selectedId()));
  }
  protected resetWindow(): void {
    if (!this.fullWindow()) this.window.set(null);
  }
  protected selectDevice(id: string): void {
    this.selectedDevice.set(id === 'desktop' || id === 'mobile' ? id : null);
    this.action.set('');
  }
  protected selectDetailPoint(point: PointSelection<{ readonly id: string }>): void {
    if (this.selectedDevice() === null) {
      this.selectDevice(point.rowId);
    } else {
      this.selectMonth(point.rowId);
      this.action.set(
        \`\${this.data().find((row) => row.id === point.rowId)?.month}: \${this.selectedDevice()}, \${new Intl.NumberFormat('en-US').format(point.value)} visits (\${point.source}).\`,
      );
    }
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
`;var we=()=>[import(`./chunk-Bify7RSC.js`).then(o=>o.HighlightCode)];function fe(o,t){if(o&1&&Og(0,`code`,8),o&2){let n=zw();Ag(`appHighlight`,n.source)}}function ye(o,t){if(o&1&&(wi(0,`code`),yC(1),Cl()),o&2){let n=zw();HI(),Zg(n.source)}}function xe(o,t){if(o&1&&(wi(0,`code`),yC(1),Cl()),o&2){let n=zw();HI(),Zg(n.source)}}var re=class o{showDataTable=m(ne).snapshot.data.showDataTable===!0;theme=m(c).theme;source=ae;static ɵfac=function(n){return new(n||o)};static ɵcmp=wT({type:o,selectors:[[`app-linked-dashboard`]],decls:24,vars:2,consts:[[`sourceDetails`,``],[1,`gallery`],[1,`gallery-content`],[3,`theme`,`showDataTable`],[`aria-labelledby`,`dashboard-pattern`,1,`linking-guide`],[`id`,`dashboard-pattern`],[`tabindex`,`0`,`aria-label`,`Composed linked dashboard Angular source`],[`routerLink`,`/linked`],[3,`appHighlight`]],template:function(n,e){n&1&&(wi(0,`div`,1)(1,`div`,2),Og(2,`app-dashboard-pilot`,3),wi(3,`section`,4)(4,`h2`,5),yC(5,`Use this dashboard`),Cl(),wi(6,`p`),yC(7,` Choose visible months with From/To or the zoom controls. Select a device to explore its monthly detail, then choose a month in either chart or the Month field. Reset month clears selection; Reset zoom restores the full window. Refreshing and reordering retain available IDs. Each legend affects its own chart. `),Cl(),wi(8,`p`),yC(9,` Missing observations remain missing. Recorded device sums may be partial, and the trend requires complete device observations throughout its window. `),Cl(),wi(10,`details`,null,0)(12,`summary`),yC(13,`Standalone Angular dashboard source`),Cl(),wi(14,`pre`,6),gg(15,fe,1,1)(16,ye,2,1)(17,xe,2,1),Dw(18,15,we,null,16,17),Mw(10),Cl()(),wi(20,`p`),yC(21,` This complete example also runs on the preserved rc.22 package. The current experimental package is rc.28; install it with the next tag. `),Cl(),wi(22,`a`,7),yC(23,`Explore month ranges and previews`),Cl()()()()),n&2&&(HI(2),Ag(`theme`,e.theme())(`showDataTable`,e.showDataTable))},dependencies:[I,fr],styles:[`[_nghost-%COMP%]{display:block}.gallery[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,640px) 150px;gap:64px;max-width:var(--%NS%site-page-width);margin:auto;padding:var(--%NS%site-page-top) var(--%NS%site-page-gutter) var(--%NS%site-page-bottom)}.gallery-content[_ngcontent-%COMP%]{min-width:0}.gallery-heading[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:48px}h1[_ngcontent-%COMP%]{margin:0;font-size:var(--%NS%site-title-size);font-weight:600;line-height:var(--%NS%site-title-line);letter-spacing:-1px}.gallery-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:8px 0 0;color:var(--%NS%site-muted);font-size:14px;line-height:24px}.copy-page[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;flex:none;gap:6px;margin-top:4px;padding:5px 10px;border:1px solid var(--%NS%site-border);border-radius:6px;font:inherit;font-size:12px;line-height:20px;color:var(--%NS%site-muted);background:var(--%NS%site-surface)}.copy-page[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:14px;height:14px}.gallery-examples[_ngcontent-%COMP%]{display:grid;gap:40px}.page-outline[_ngcontent-%COMP%]{position:sticky;top:calc(var(--%NS%site-header-height) + 48px);align-self:start;margin-top:10px;font-size:12px;line-height:20px}.page-outline[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0 0 12px;color:var(--%NS%site-muted)}.page-outline[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:block;padding:8px 0 8px 16px;border-left:1px solid var(--%NS%site-border);color:var(--%NS%site-muted);text-decoration:none;font-size:13px;line-height:20px}.page-outline[_ngcontent-%COMP%]   a.active[_ngcontent-%COMP%]{color:var(--%NS%site-text)}.page-outline[_ngcontent-%COMP%]   .outline-playground[_ngcontent-%COMP%]{display:flex;align-items:center;gap:5px;margin-top:24px;padding-left:0;border:0}.outline-playground[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.gallery-footer[_ngcontent-%COMP%]{border-top:1px solid var(--%NS%site-border);margin-top:48px;padding-top:24px;color:var(--%NS%site-muted);font-size:11px;line-height:18px}.gallery-footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:5px;margin-top:8px;color:var(--%NS%site-text);text-decoration:none}.gallery-footer[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.gallery-note[_ngcontent-%COMP%]{font-size:12px;line-height:20px;color:var(--%NS%site-muted)}@media(max-width:1250px){.gallery[_ngcontent-%COMP%]{display:block}.page-outline[_ngcontent-%COMP%]{display:none}}@media(max-width:600px){.gallery-heading[_ngcontent-%COMP%]{flex-direction:column;gap:16px;margin-bottom:32px}.gallery-examples[_ngcontent-%COMP%]{gap:32px}.copy-page[_ngcontent-%COMP%]{margin-top:0}}`,`.gallery-heading[_ngcontent-%COMP%]{margin-bottom:36px}.linking-guide[_ngcontent-%COMP%]{margin-top:32px}h2[_ngcontent-%COMP%]{font-size:20px;font-weight:500;line-height:32px;margin:0 0 12px}.linking-guide[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:var(--%NS%site-muted);font-size:13px;line-height:22px}details[_ngcontent-%COMP%]{margin:24px 0;border:1px solid var(--%NS%site-border);border-radius:var(--%NS%site-panel-radius);min-width:0}summary[_ngcontent-%COMP%]{padding:12px 16px;cursor:pointer;font-size:12px}pre[_ngcontent-%COMP%]{margin:0;padding:16px;max-height:480px;overflow:auto;font-size:12px;line-height:20px;border-top:1px solid var(--%NS%site-border)}a[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;color:var(--%NS%site-text);font-size:12px;line-height:20px}a[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.code-tools[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;padding:8px 12px;border-top:1px solid var(--%NS%site-border)}.code-tools[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;border:0;background:transparent;font:inherit;color:var(--%NS%site-text);font-size:12px;cursor:pointer;padding:4px}.code-tools[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}@media(min-width:1100px){.gallery[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr);max-width:1180px}.page-outline[_ngcontent-%COMP%]{display:none}}`]})};export{re as LinkedDashboard};