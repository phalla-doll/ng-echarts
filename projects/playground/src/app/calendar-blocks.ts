import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarHeatmap, type CalendarPointSelection } from '@ng-echarts/chart-library/calendar';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';
import { HighlightCode } from './highlight-code';
import { calendarSample, calendarExampleSource, type ActivityDay } from './calendar-examples';
@Component({
  selector: 'app-calendar-blocks',
  imports: [CalendarHeatmap, RouterLink, SiteIcon, HighlightCode],
  templateUrl: './calendar-blocks.html',
  styleUrls: ['./gallery.css', './bar-block.css', './radial-block.css', './calendar-blocks.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarBlocks {
  private readonly appearance = inject(SiteAppearance);
  protected readonly theme = this.appearance.theme;
  protected readonly year = signal(2024);
  protected readonly dataMode = signal<'sample' | 'zero' | 'missing' | 'invalid'>('sample');
  protected readonly data = computed(() => {
    const days = calendarSample(this.year());
    switch (this.dataMode()) {
      case 'zero':
        return days.map((day) => ({ ...day, count: 0 }));
      case 'missing':
        return days.map((day) => ({ ...day, count: null }));
      case 'invalid':
        return [{ date: `${this.year()}-02-30`, count: 8 }];
      default:
        return days;
    }
  });
  protected readonly source = computed(() => calendarExampleSource(this.appearance.dark()));
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mounted = signal(true);
  protected readonly view = signal<'code' | 'preview'>('preview');
  protected readonly selection = signal<CalendarPointSelection<ActivityDay> | null>(null);
  private readonly copiedSource = signal<string | null>(null);
  protected readonly copied = computed(() => this.copiedSource() === this.source());
  protected readonly copyFailed = signal(false);
  protected changeYear(event: Event): void {
    this.year.set(Number((event.target as HTMLInputElement).value));
    this.selection.set(null);
  }
  protected setMode(mode: 'sample' | 'zero' | 'missing' | 'invalid'): void {
    this.dataMode.set(mode);
    this.selection.set(null);
  }
  protected reset(): void {
    this.year.set(2024);
    this.setMode('sample');
    this.loading.set(false);
    this.error.set(null);
    this.mounted.set(true);
  }
  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.source());
      this.copiedSource.set(this.source());
      this.copyFailed.set(false);
    } catch {
      this.copyFailed.set(true);
    }
  }
}
