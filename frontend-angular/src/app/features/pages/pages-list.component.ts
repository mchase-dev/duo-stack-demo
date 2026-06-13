import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PagesApiService } from '../../core/api/pages.api';
import type { Page } from '../../core/api/api.types';

@Component({
  selector: 'app-pages-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './pages-list.component.html',
  styleUrl: './pages-list.component.scss',
})
export class PagesListComponent implements OnInit {
  private readonly api = inject(PagesApiService);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly pages = signal<Page[]>([]);
  readonly isLoading = signal(true);
  readonly deletingId = signal<string | null>(null);

  readonly isSuperuser = computed(() => this.auth.user()?.role === 'Superuser');

  async ngOnInit(): Promise<void> {
    await this.loadPages();
  }

  async loadPages(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.getPages());
      this.pages.set(res.data);
    } catch {
      this.snackBar.open('Failed to load pages', 'Dismiss', { duration: 5000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  async deletePage(page: Page): Promise<void> {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    this.deletingId.set(page.id);
    try {
      await firstValueFrom(this.api.deletePage(page.id));
      this.pages.update((list) => list.filter((p) => p.id !== page.id));
      this.snackBar.open('Page deleted', undefined, { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to delete page', 'Dismiss', { duration: 5000 });
    } finally {
      this.deletingId.set(null);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }
}
