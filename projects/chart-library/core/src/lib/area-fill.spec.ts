import { buildAreaFill } from './area-fill';

it.each([
  ['#112233', 'rgba(17,34,51,0.16)', 'rgba(17,34,51,0.22)', 'rgba(17,34,51,0.04)'],
  ['#AABBCC', 'rgba(170,187,204,0.16)', 'rgba(170,187,204,0.22)', 'rgba(170,187,204,0.04)'],
  ['rgb(17, 34, 51)', 'rgba(17,34,51,0.16)', 'rgba(17,34,51,0.22)', 'rgba(17,34,51,0.04)'],
  ['rgba(17, 34, 51, 0.5)', 'rgba(17,34,51,0.08)', 'rgba(17,34,51,0.11)', 'rgba(17,34,51,0.02)'],
  ['rgba(17,34,51,0)', 'rgba(17,34,51,0)', 'rgba(17,34,51,0)', 'rgba(17,34,51,0)'],
  ['var(--accent)', 'transparent', 'transparent', 'transparent'],
  ['rgb(17,34,51) trailing', 'transparent', 'transparent', 'transparent'],
  ['rgb(17,34,51', 'transparent', 'transparent', 'transparent'],
])(
  'preserves independent solid/gradient alpha and complete-color fallback for %s',
  (color, solid, top, bottom) => {
    expect(buildAreaFill(color!, false)).toEqual({ opacity: 1, color: solid });
    expect(buildAreaFill(color!, true)).toEqual({
      opacity: 1,
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: top },
          { offset: 1, color: bottom },
        ],
      },
    });
  },
);
