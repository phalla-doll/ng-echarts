# Touch range re-arm verification

The radar source CI run [43437668504](https://github.com/phalla-doll/ng-echarts/actions/runs/43437668504) failed in the existing Chromium CDP touch test at its second range-mode activation. All radar scenarios passed; the browser result was 250 passes, four expected skips and this one failure. An earlier run had the same symptom.

The committed selection text and unpressed range button update in Angular before the browser adapter removes its previous pointer surface on a subsequent animation frame. The test now waits for both the unpressed button and absence of that surface before tapping again, then checks both the pressed button and new surface. It retains the same real horizontal drag, exact range total, real vertical scroll and unchanged selection assertions. There is no retry or added fixed delay, and no chart/API behavior change.

The original symptom did not reproduce locally in 100 ordinary-speed runs or 30 diagnostic runs with sixfold CPU throttling. These passes do not establish the CI failure's complete cause. The new assertions explicitly synchronize the observable transition; CI follow-up remains required. The workflow now retains failed browser traces and error context for seven days using the [official artifact action](https://github.com/actions/upload-artifact), so any recurrence has inspectable evidence.

Validation on Node 24.22.2 / npm 11.19.1: the strengthened Chromium touch scenario passes 30 consecutive runs; the complete graphical-range suite passes 16 browser scenarios across Chromium, Firefox and WebKit with two expected CDP-only skips. Formatting, documentation links and git diff checks pass. Existing candidate archives and human release gates are unchanged.

The follow-up [CI run 43442679687](https://github.com/phalla-doll/ng-echarts/actions/runs/43442679687) passes the complete workspace workflow on source `e43bb9a`, including static Pages, the strengthened real-touch case, all browser scenarios and isolated consumers. This confirms the updated test protocol in CI without assigning an unproven browser-level cause to the earlier failures.
