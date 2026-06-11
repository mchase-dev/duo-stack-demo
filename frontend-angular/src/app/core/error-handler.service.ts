import { ErrorHandler, inject, Injectable, Injector } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: unknown): void {
    console.error('Uncaught error:', error);
    try {
      const snackBar = this.injector.get(MatSnackBar);
      const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
      snackBar.open(msg, 'Dismiss', { duration: 5000 });
    } catch {
      // Silently ignore if snackbar unavailable during early bootstrap
    }
  }
}
