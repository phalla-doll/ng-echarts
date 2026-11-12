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

export type ChartTheme = 'light' | 'dark';
export type BarLayout = 'vertical' | 'horizontal';
