import type { ValueFormatter } from './chart-types';

const formatterError = 'Value formatting failed. Use a pure function that returns text.';

/** Shared numeric text; missing observations never reach consumer callbacks. */
export function createValueFormatting(
  locale: string,
  options: Intl.NumberFormatOptions | undefined,
  formatter: ValueFormatter | undefined,
  values: readonly (number | null)[],
): { readonly format: ValueFormatter; readonly error: string | null } {
  let numberFormat: Intl.NumberFormat;
  try {
    if (
      typeof locale !== 'string' ||
      !locale ||
      (options !== undefined &&
        (typeof options !== 'object' || options === null || Array.isArray(options)))
    )
      throw new TypeError();
    numberFormat = new Intl.NumberFormat(locale, options);
  } catch {
    return { format: () => '', error: 'The chart locale or number format options are invalid.' };
  }
  if (formatter === undefined) return { format: numberFormat.format, error: null };
  try {
    if (typeof formatter !== 'function') throw new TypeError();
    // Cache known observations so opening a table or tooltip never reruns consumer code.
    const labels = new Map<number | string, string>();
    const format: ValueFormatter = (value) => {
      const key = Object.is(value, -0) ? '-0' : value;
      if (labels.has(key)) return labels.get(key)!;
      try {
        const label = formatter(value);
        if (typeof label !== 'string') throw new TypeError();
        labels.set(key, label);
        return label;
      } catch {
        // Unexpected axis-tick failures are contained by the browser plot controller.
        throw new Error(formatterError);
      }
    };
    for (const value of values) if (value !== null) format(value);
    return { format, error: null };
  } catch {
    return { format: () => '', error: formatterError };
  }
}
