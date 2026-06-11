import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieConsentComponent } from './shared/components/cookie-consent.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookieConsentComponent],
  template: `<router-outlet /><app-cookie-consent />`,
  styles: [':host { display: block; height: 100dvh; }'],
})
export class App {}
