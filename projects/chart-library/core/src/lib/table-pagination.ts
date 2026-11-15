import { computed, linkedSignal } from '@angular/core';

/** Internal table window; paging never changes plot data or selection ownership. */
export class TablePagination {
  readonly error = computed(() => {
    const size = this.pageSize();
    return size === null || (Number.isSafeInteger(size) && size > 0)
      ? null
      : 'Table page size must be a positive safe integer or null.';
  });
  readonly total = computed(() => {
    const rows = this.data();
    return Array.isArray(rows) ? rows.length : 0;
  });
  private readonly requestedPage = linkedSignal(() => {
    // New immutable data and page-size changes restart at the first page.
    this.data();
    this.pageSize();
    return 0;
  });
  readonly count = computed(() => {
    const size = this.pageSize();
    return !this.error() && size !== null ? Math.max(1, Math.ceil(this.total() / size)) : 1;
  });
  readonly page = computed(() => Math.min(this.requestedPage(), this.count() - 1));
  readonly start = computed(() => this.page() * (this.pageSize() ?? this.total()));
  readonly end = computed(() =>
    Math.min(this.total(), this.start() + (this.pageSize() ?? this.total())),
  );

  constructor(
    private readonly data: () => readonly unknown[],
    private readonly pageSize: () => number | null,
  ) {}

  rows<T>(rows: readonly T[]): readonly T[] {
    return this.pageSize() === null ? rows : rows.slice(this.start(), this.end());
  }

  move(delta: number): void {
    this.requestedPage.set(Math.max(0, Math.min(this.page() + delta, this.count() - 1)));
  }
}
