import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-load-more',
  template: `
    <div class="flex justify-center py-6">
      @if (isLoading()) {
        <div class="flex items-center gap-2 text-base-content/70">
          <span class="loading loading-spinner loading-sm"></span>
          Loading more...
        </div>
      } @else if (hasMore()) {
        <button
          class="btn btn-outline btn-primary"
          (click)="loadMore.emit()"
        >
          Load More
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      } @else if (hasLoaded()) {
        <div class="text-base-content/50 text-sm">
          You've reached the end
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoadMore {
  isLoading = input.required<boolean>();
  hasMore = input.required<boolean>();
  hasLoaded = input<boolean>(false);

  loadMore = output<void>();
}
