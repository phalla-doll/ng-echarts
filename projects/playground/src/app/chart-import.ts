import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** A fixed import statement does not need the full syntax-highlighting engine. */
@Component({
  selector: 'app-chart-import',
  template: `<code class="syntax-code"
    ><span class="hljs-keyword">import</span>{{ ' { ' + name() + ' } '
    }}<span class="hljs-keyword">from</span>{{ ' '
    }}<span class="hljs-string">{{ "'@ng-echarts/chart-library/" + family() + "'" }}</span
    >;</code
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartImport {
  readonly family = input.required<'bar' | 'line' | 'area' | 'pie' | 'composed'>();
  protected readonly name = computed(
    () =>
      ({
        bar: 'BarChart',
        line: 'LineChart',
        area: 'AreaChart',
        pie: 'PieChart',
        composed: 'ComposedChart',
      })[this.family()],
  );
}
