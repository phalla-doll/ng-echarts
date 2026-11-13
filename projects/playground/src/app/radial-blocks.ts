import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteAppearance } from './site-appearance';
import { RadialBlockExample } from './radial-block';
import { radialBlocks } from './radial-examples';
@Component({
  selector: 'app-radial-blocks',
  imports: [RadialBlockExample, RouterLink],
  templateUrl: './radial-blocks.html',
  styleUrl: './gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadialBlocks {
  protected readonly dark = inject(SiteAppearance).dark;
  protected readonly blocks = radialBlocks;
}
