import { composedBlocks, composedExampleSource, type ComposedBlock } from './composed-blocks';
import { barBlocks, barExampleSource, type BarBlock } from './bar-blocks';
import { lineBlocks, lineExampleSource, type LineBlock } from './line-blocks';
import { areaBlocks, areaExampleSource, type AreaBlock } from './area-blocks';
import { pieBlocks, pieExampleSource, type PieBlock } from './pie-blocks';
export type CartesianBlock = BarBlock | LineBlock | AreaBlock | ComposedBlock;
export type ChartBlock = CartesianBlock | PieBlock;
export function chartExampleSource(block: ChartBlock, dark: boolean): string {
  switch (block.kind) {
    case 'composed':
      return composedExampleSource(block, dark);
    case 'pie':
      return pieExampleSource(block, dark);
    case 'bar':
      return barExampleSource(block, dark);
    case 'line':
      return lineExampleSource(block, dark);
    case 'area':
      return areaExampleSource(block, dark);
  }
}
export const galleryFamilies = {
  composed: {
    title: 'Composed Blocks',
    noun: 'composed',
    blocks: composedBlocks,
    validationRoute: '/composed-validation',
    validationLabel: 'Composed validation',
  },
  pie: {
    title: 'Pie & Donut Blocks',
    noun: 'pie and donut',
    blocks: pieBlocks,
    validationRoute: '/pie-validation',
    validationLabel: 'Pie validation',
  },
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
