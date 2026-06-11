import { Injectable } from '@angular/core';

// Access token lives in memory only — never localStorage
@Injectable({ providedIn: 'root' })
export class TokenStore {
  private token: string | null = null;

  get(): string | null {
    return this.token;
  }

  set(token: string | null): void {
    this.token = token;
  }
}
