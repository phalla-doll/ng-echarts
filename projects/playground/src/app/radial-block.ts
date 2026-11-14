import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RadialProgress } from '@mantha911/ng-echarts/radial';
import { SiteIcon } from './site-icon';
import { HighlightCode } from './highlight-code';
import { radialExampleSource, type RadialBlock } from './radial-examples';
@Component({
  selector: 'app-radial-block',
  imports: [RadialProgress, RouterLink, SiteIcon, HighlightCode],
  templateUrl: './radial-block.html',
  styleUrls: ['./bar-block.css', './radial-block.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadialBlockExample {
  readonly block = input.required<RadialBlock>();
  readonly dark = input.required<boolean>();
  readonly controls = input(false);
  protected readonly theme = computed(() => (this.dark() ? 'dark' : 'light'));
  private readonly chosenValue = signal<number | null | undefined>(undefined);
  protected readonly value = computed<number | null>(() => {
    const chosen = this.chosenValue();
    return chosen === undefined ? this.block().value : chosen;
  });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mounted = signal(true);
  protected readonly view = signal<'preview' | 'code'>('preview');
  protected readonly source = computed(() => radialExampleSource(this.block(), this.dark()));
  private readonly copiedSource = signal<string | null>(null);
  protected readonly copied = computed(() => this.copiedSource() === this.source());
  protected readonly copyFailed = signal(false);
  protected setValue(value: number | null): void {
    this.chosenValue.set(value);
  }
  protected inputValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.chosenValue.set(input.value === '' ? null : input.valueAsNumber);
  }
  protected reset(): void {
    this.chosenValue.set(undefined);
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
