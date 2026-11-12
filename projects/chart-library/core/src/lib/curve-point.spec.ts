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
