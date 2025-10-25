import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  templateUrl: './loading-state.html',
  styleUrl: './loading-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoadingStateComponent {
  readonly title = input('Loading content');
  readonly message = input<string | null>('Just a moment while we prepare everything for you.');
  readonly showBackdrop = input(false);
}
