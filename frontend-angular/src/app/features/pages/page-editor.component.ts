import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { PagesApiService } from '../../core/api/pages.api';
import type { Page } from '../../core/api/api.types';

@Component({
  selector: 'app-page-editor',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './page-editor.component.html',
  styleUrl: './page-editor.component.scss',
})
export class PageEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PagesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly isPreview = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  private editingPage: Page | null = null;

  // The route is either /pages/new (no slug param) or /pages/edit/:slug
  readonly slug = this.route.snapshot.paramMap.get('slug');
  readonly isEditing = !!this.slug;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', Validators.required],
    isPublished: [false],
  });

  async ngOnInit(): Promise<void> {
    if (!this.isEditing) return;
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.getPageBySlug(this.slug!));
      this.editingPage = res.data;
      this.form.patchValue({
        title: res.data.title,
        content: res.data.content,
        isPublished: res.data.isPublished,
      });
    } catch {
      this.snackBar.open('Failed to load page', 'Dismiss', { duration: 5000 });
      this.router.navigate(['/pages']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, content, isPublished } = this.form.getRawValue();
    this.isSaving.set(true);
    try {
      if (this.isEditing && this.editingPage) {
        await firstValueFrom(
          this.api.updatePage(this.editingPage.id, { title: title!, content: content!, isPublished: isPublished! })
        );
        this.snackBar.open('Page updated', undefined, { duration: 3000 });
      } else {
        await firstValueFrom(
          this.api.createPage({ title: title!, content: content!, isPublished: isPublished! })
        );
        this.snackBar.open('Page created', undefined, { duration: 3000 });
      }
      this.router.navigate(['/pages']);
    } catch {
      this.snackBar.open('Failed to save page', 'Dismiss', { duration: 5000 });
    } finally {
      this.isSaving.set(false);
    }
  }

  get titleValue(): string { return this.form.get('title')?.value ?? ''; }
  get contentValue(): string { return this.form.get('content')?.value ?? ''; }

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
}
