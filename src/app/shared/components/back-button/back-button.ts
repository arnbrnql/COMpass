import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

type NavigationCommands = string | unknown[];

/**
 * Payload emitted when the back button needs a custom fallback handler.
 * Call {@link preventDefault} to stop the component from executing its default navigation logic.
 */
export interface BackButtonFallbackEvent {
  preventDefault(): void;
}

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.html',
  styleUrl: './back-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BackButtonComponent {
  private location = inject(Location);
  private router = inject(Router);

  /**
   * Accessible label that is read by screen readers. Defaults to the visual label when provided.
   */
  readonly ariaLabel = input<string | null>(null);

  /**
   * Text displayed next to the chevron icon. Hidden automatically when `iconOnly` is true.
   */
  readonly label = input('Back');

  /**
   * When `true`, renders a compact circular button that only shows the chevron icon.
   */
  readonly iconOnly = input(false);

  /**
   * Size modifier for the button.
   */
  readonly size = input<'sm' | 'md'>('sm');

  /**
   * Optional router commands or url to use when there is no navigation history available.
   */
  readonly fallbackCommands = input<NavigationCommands | null>(null);

  /**
   * Emits when the button needs a fallback handler instead of using router commands.
   */
  readonly fallback = output<BackButtonFallbackEvent>();

  onClick(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
      return;
    }

    let defaultPrevented = false;
    this.fallback.emit({
      preventDefault: () => {
        defaultPrevented = true;
      },
    });

    if (defaultPrevented) {
      return;
    }

    const fallbackCommands = this.fallbackCommands();

    if (fallbackCommands) {
      if (Array.isArray(fallbackCommands)) {
        void this.router.navigate(fallbackCommands as string[]);
      } else {
        void this.router.navigateByUrl(fallbackCommands as string);
      }
      return;
    }

    void this.router.navigate(['/']);
  }

  get computedAriaLabel(): string {
    const ariaLabel = this.ariaLabel();
    if (ariaLabel) {
      return ariaLabel;
    }

    if (this.iconOnly()) {
      return this.label();
    }

    const label = this.label() || 'Back';
    return `${label} button`;
  }
}
