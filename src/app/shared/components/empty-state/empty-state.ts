import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmptyStateComponent {
  readonly title = input('Nothing to show yet');
  readonly message = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly iconName = input<'search' | 'inbox' | 'calendar'>('inbox');

  readonly action = output<void>();

  onActionClick(): void {
    this.action.emit();
  }
}
