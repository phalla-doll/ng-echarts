import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TablePagination } from './table-pagination';

@Component({
  selector: 'nec-table-pager',
  template: `
    @let pages = pagination();
    @if (pages.count() > 1) {
      <nav [attr.aria-label]="label() + ' data table pages'">
        <button
          type="button"
          aria-label="Previous table page"
          [attr.aria-disabled]="pages.page() === 0 ? 'true' : null"
          (click)="pages.move(-1)"
        >
          Previous
        </button>
        <span role="status" aria-atomic="true">
          Rows {{ pages.start() + 1 }}–{{ pages.end() }} of {{ pages.total() }}
        </span>
        <button
          type="button"
          aria-label="Next table page"
          [attr.aria-disabled]="pages.page() === pages.count() - 1 ? 'true' : null"
          (click)="pages.move(1)"
        >
          Next
        </button>
      </nav>
    }
  `,
  styles: `
    nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    span {
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
    }
    button {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--nec-border, #d6dce5);
      border-radius: 0.375rem;
      color: inherit;
      background: transparent;
      font: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 3px solid var(--nec-focus, #648dff);
      outline-offset: 3px;
    }
    button[aria-disabled='true'] {
      color: var(--nec-muted, #536176);
      cursor: default;
      border-style: dashed;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePager {
  readonly pagination = input.required<TablePagination>();
  readonly label = input.required<string>();
}
