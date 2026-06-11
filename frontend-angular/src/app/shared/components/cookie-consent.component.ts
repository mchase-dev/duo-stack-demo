import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cookie-consent',
  imports: [MatButtonModule],
  template: `
    @if (visible()) {
      <div class="cookie-banner" role="dialog" aria-label="Cookie consent">
        <div class="cookie-content">
          <h3 class="cookie-title">Cookie Consent</h3>
          <p class="cookie-body">
            We use cookies to enhance your browsing experience, serve personalized content, and
            analyze our traffic. By clicking "Accept All", you consent to our use of cookies for
            authentication and session management.
          </p>
          <div class="cookie-actions">
            <button mat-raised-button color="primary" (click)="accept()">Accept All</button>
            <button mat-button (click)="decline()">Decline</button>
            <a href="/pages/privacy-policy" class="learn-more">Learn more</a>
          </div>
        </div>
        <button mat-button class="close-btn" (click)="decline()" aria-label="Close">✕</button>
      </div>
    }
  `,
  styles: [`
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #e0e0e0;
      box-shadow: 0 -4px 12px rgba(0,0,0,.12);
      padding: 16px 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      z-index: 1000;
    }
    .cookie-content { flex: 1; }
    .cookie-title { margin: 0 0 8px; font-size: 1rem; font-weight: 500; }
    .cookie-body { margin: 0 0 12px; font-size: 14px; color: #666; }
    .cookie-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .learn-more { font-size: 14px; color: #1976d2; text-decoration: none; }
    .learn-more:hover { text-decoration: underline; }
    .close-btn { min-width: 36px; padding: 0; font-size: 18px; line-height: 36px; }
  `],
})
export class CookieConsentComponent implements OnInit {
  readonly visible = signal(false);

  ngOnInit(): void {
    if (!localStorage.getItem('cookieConsent')) {
      this.visible.set(true);
    }
  }

  accept(): void {
    localStorage.setItem('cookieConsent', 'accepted');
    this.visible.set(false);
  }

  decline(): void {
    localStorage.setItem('cookieConsent', 'declined');
    this.visible.set(false);
  }
}
