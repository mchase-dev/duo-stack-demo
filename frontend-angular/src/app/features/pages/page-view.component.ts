import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PagesApiService } from '../../core/api/pages.api';
import type { Page } from '../../core/api/api.types';

@Component({
  selector: 'app-page-view',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './page-view.component.html',
  styleUrl: './page-view.component.scss',
})
export class PageViewComponent implements OnInit {
  private readonly api = inject(PagesApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly page = signal<Page | null>(null);
  readonly isLoading = signal(true);
  readonly isSuperuser = computed(() => this.auth.user()?.role === 'Superuser');

  async ngOnInit(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    try {
      const res = await firstValueFrom(this.api.getPageBySlug(slug));
      this.page.set(res.data);
    } catch {
      this.page.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  renderMarkdown(content: string): string {
    return content
      .replace(/^### (.*)$/gim, '<h3>$1</h3>')
      .replace(/^## (.*)$/gim, '<h2>$1</h2>')
      .replace(/^# (.*)$/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}
