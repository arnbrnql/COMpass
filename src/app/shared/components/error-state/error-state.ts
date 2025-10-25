import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.html',
  styleUrl: './error-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ErrorStateComponent {
  readonly title = input('Something went wrong');
  readonly message = input<string | null>('Please try again.');
  readonly retryLabel = input('Retry');
  readonly showRetry = input(false);

  readonly retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
