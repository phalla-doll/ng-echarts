import { createValueFormatting } from './value-formatting';
import type { ValueFormatter } from '@mantha911/ng-echarts/core';

describe('shared numeric formatting', () => {
  it('uses explicit locales and options for zero, negative, and fractional values', () => {
    const defaults = createValueFormatting('en-US', undefined, undefined, []);
    expect(defaults.error).toBeNull();
    expect(defaults.format(1234.5)).toBe('1,234.5');
    expect(defaults.format(0)).toBe('0');
    expect(defaults.format(-42)).toBe('-42');
    const currency = createValueFormatting(
      'de-DE',
      { style: 'currency', currency: 'EUR' },
      undefined,
      [],
    );
    expect(currency.format(1234.5)).toBe('1.234,50\u00a0€');
    expect(createValueFormatting('en-US', { style: 'percent' }, undefined, []).format(0.125)).toBe(
      '13%',
    );
  });

  it('shares cached custom labels, skips missing values, and distinguishes signed zero', () => {
    const formatter = vi.fn((value: number) => (Object.is(value, -0) ? '-zero' : `<${value}>`));
    const result = createValueFormatting('en-US', undefined, formatter, [0, -0, null, 2, 2]);
    expect(result.error).toBeNull();
    expect(formatter.mock.calls.map(([value]) => value)).toEqual([0, -0, 2]);
    expect(result.format(0)).toBe('<0>');
    expect(result.format(-0)).toBe('-zero');
    expect(result.format(2)).toBe('<2>');
    expect(formatter).toHaveBeenCalledTimes(3);
    expect(result.format(1)).toBe('<1>');
    expect(result.format(1)).toBe('<1>');
    expect(formatter).toHaveBeenCalledTimes(4);
  });

  it.each([
    ['bad_locale', undefined],
    ['', undefined],
    ['en-US', { style: 'currency' }],
    ['en-US', { minimumFractionDigits: 4, maximumFractionDigits: 1 }],
    ['en-US', null],
    ['en-US', []],
  ])('contains invalid locale/options (%s, %s)', (locale, options) => {
    expect(
      createValueFormatting(locale as string, options as Intl.NumberFormatOptions, undefined, [])
        .error,
    ).toBe('The chart locale or number format options are invalid.');
  });

  it.each([
    42,
    () => 42,
    () => Promise.resolve('value'),
    () => {
      throw new Error('Private formatter details');
    },
  ])('contains invalid runtime formatters without exposing exceptions (%s)', (formatter) => {
    const result = createValueFormatting(
      'en-US',
      undefined,
      formatter as unknown as ValueFormatter,
      [0],
    );
    expect(result.error).toBe('Value formatting failed. Use a pure function that returns text.');
    expect(result.format(0)).toBe('');
  });

  it('sanitizes failures for generated axis ticks absent from the dataset', () => {
    const result = createValueFormatting(
      'en-US',
      undefined,
      (value) => {
        if (value === 0) throw new Error('Private axis details');
        return String(value);
      },
      [5],
    );
    expect(result.error).toBeNull();
    expect(() => result.format(0)).toThrow(
      'Value formatting failed. Use a pure function that returns text.',
    );
  });
});
