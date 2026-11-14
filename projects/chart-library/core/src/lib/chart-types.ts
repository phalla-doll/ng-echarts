type FieldKey<T, Value> = {
  [K in keyof T]-?: 0 extends 1 & T[K]
    ? never
    : [NonNullable<T[K]>] extends [never]
      ? never
      : NonNullable<T[K]> extends Value
        ? K
        : never;
}[keyof T] &
  string;

export type NumericKey<T> = FieldKey<T, number>;
export type StringKey<T> = FieldKey<T, string>;

export interface ChartSeries<T> {
  readonly id: string;
  readonly key: NumericKey<T>;
  readonly label: string;
  readonly color?: string;
}

export interface PointSelection<T> {
  readonly rowId: string;
  readonly seriesId: string;
  readonly row: T;
  readonly value: number;
  readonly source: 'plot' | 'table';
}

export interface LegendVisibilityChange {
  readonly seriesId: string;
  readonly visible: boolean;
}

/** Transient context; never commits a selection. Null clears the preview. */
export interface PointPreview<T> extends PointSelection<T> {
  readonly trigger: 'pointer' | 'focus';
}

export type ChartTheme = 'light' | 'dark';
export type BarLayout = 'vertical' | 'horizontal';

/** Pure, synchronous axis-only formatting. Use identical functions on server and client. */
export type CategoryTickFormatter = (category: string, index: number) => string;

/** Pure, synchronous numeric text shared by axes, tooltips, and table actions. */
export type ValueFormatter = (value: number) => string;

/** One numeric measure; each row becomes a category slice. */
export interface ChartMeasure<T> {
  readonly id: string;
  readonly key: NumericKey<T>;
  readonly label: string;
}
export interface CategoryVisibilityChange {
  readonly rowId: string;
  readonly visible: boolean;
}
