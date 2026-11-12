import { barBlocks, barExampleSource, type BarBlock } from './bar-blocks';
import { lineBlocks, lineExampleSource, type LineBlock } from './line-blocks';
import { areaBlocks, areaExampleSource, type AreaBlock } from './area-blocks';
export type ChartBlock = BarBlock | LineBlock | AreaBlock;
export function chartExampleSource(block: ChartBlock, dark: boolean): string {
  switch (block.kind) {
    case 'bar':
      return barExampleSource(block, dark);
    case 'line':
      return lineExampleSource(block, dark);
    case 'area':
      return areaExampleSource(block, dark);
  }
}
export const galleryFamilies = {
  bar: {
    title: 'Bar Blocks',
    noun: 'bar',
    blocks: barBlocks,
    validationRoute: '/playground',
    validationLabel: 'Interactive playground',
  },
  line: {
    title: 'Line Blocks',
    noun: 'line',
    blocks: lineBlocks,
    validationRoute: '/line-validation',
    validationLabel: 'Line validation',
  },
  area: {
    title: 'Area Blocks',
    noun: 'area',
    blocks: areaBlocks,
    validationRoute: '/area-validation',
    validationLabel: 'Area validation',
  },
} as const;
