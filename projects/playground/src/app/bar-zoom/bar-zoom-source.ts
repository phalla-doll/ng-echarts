import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SourceSnippet } from '../code-examples/source-snippet';
import { barZoomExampleSource } from './bar-zoom-example-source';

@Component({
  selector: 'app-bar-zoom-source',
  imports: [SourceSnippet],
  template: '<app-source-snippet [source]="source" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarZoomSource {
  protected readonly source = barZoomExampleSource;
}
