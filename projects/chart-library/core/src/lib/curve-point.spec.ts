import { curvePoint } from './curve-point';
const options = {
  series: [
    {
      id: 'visible',
      data: [
        { id: 'a', value: 0 },
        { id: 'gap', value: '-' },
        { id: 'c', value: -7 },
      ],
    },
  ],
};
for (const selfType of ['line', 'area'])
  it(`selects raw observations for ${selfType} paths and rejects gaps/disposed options`, () => {
    const event = { selfType, seriesIndex: 0, event: { offsetX: 42 } };
    expect(curvePoint(event, options, () => 0)).toEqual({ rowId: 'a', seriesId: 'visible' });
    expect(curvePoint(event, options, () => 1)).toBeUndefined();
    expect(curvePoint(event, options, () => 2)).toEqual({ rowId: 'c', seriesId: 'visible' });
    expect(curvePoint(event, null, () => 0)).toBeUndefined();
    expect(curvePoint(event, options, () => NaN)).toBeUndefined();
  });
it('accepts marker identities and ignores malformed chart events', () => {
  expect(curvePoint({ data: { id: 'a' }, seriesId: 'visible' }, options, () => 0)).toEqual({
    rowId: 'a',
    seriesId: 'visible',
  });
  expect(
    curvePoint({ selfType: 'area', seriesIndex: 4, event: { offsetX: 1 } }, options, () => 0),
  ).toBeUndefined();
  expect(
    curvePoint({ selfType: 'grid', seriesIndex: 0, event: { offsetX: 1 } }, options, () => 0),
  ).toBeUndefined();
});

it('uses only the vertical pointer coordinate for horizontal curves and rejects missing cells', () => {
  const convert = vi.fn(() => 2);
  const event = { selfType: 'area', seriesIndex: 0, event: { offsetX: NaN, offsetY: 42 } };
  expect(curvePoint(event, options, convert, true)).toEqual({ rowId: 'c', seriesId: 'visible' });
  expect(convert).toHaveBeenCalledWith(42);
  expect(curvePoint(event, options, () => 1, true)).toBeUndefined();
  expect(curvePoint({ ...event, event: { offsetX: 42 } }, options, convert, true)).toBeUndefined();
});
