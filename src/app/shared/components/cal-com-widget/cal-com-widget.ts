import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cal-com-widget',
  imports: [],
  template: `
    @if (safeUrl()) {
      <div class="w-full min-h-[650px] rounded-lg overflow-hidden border border-base-300">
        <iframe
          [src]="safeUrl()"
          class="w-full h-full min-h-[650px] border-0"
          allow="camera; microphone; fullscreen"
        ></iframe>
      </div>
    } @else {
      <div class="flex flex-col items-center justify-center min-h-[400px] text-center bg-base-200 rounded-lg p-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-xl font-bold mb-2">Booking Not Available</h3>
        <p class="text-base-content/70 max-w-sm">This mentor has not set up their booking calendar yet. Please check back later.</p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalComWidget {
  calUsername = input<string>();

  private sanitizer = inject(DomSanitizer);

  safeUrl = computed<SafeResourceUrl | null>(() => {
    const username = this.calUsername();
    if (!username) return null;
    const url = `https://cal.com/${username}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
