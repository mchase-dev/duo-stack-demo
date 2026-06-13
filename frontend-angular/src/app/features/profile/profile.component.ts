import {
  Component, ElementRef, OnInit, ViewChild, inject, signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileApiService } from '../../core/api/profile.api';
import type { User } from '../../core/api/api.types';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private readonly api = inject(ProfileApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly profile = signal<User | null>(null);
  readonly isLoading = signal(true);
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly isUploadingAvatar = signal(false);
  readonly isChangingPassword = signal(false);
  readonly isSavingPassword = signal(false);

  profileForm = this.fb.group({
    firstName: ['', Validators.maxLength(100)],
    lastName: ['', Validators.maxLength(100)],
    bio: ['', Validators.maxLength(500)],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  async ngOnInit(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.getProfile());
      this.profile.set(res.data);
      this.patchProfileForm(res.data);
    } catch {
      this.snackBar.open('Failed to load profile', 'Dismiss', { duration: 5000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  private patchProfileForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      bio: user.bio ?? '',
    });
  }

  startEditing(): void {
    const p = this.profile();
    if (p) this.patchProfileForm(p);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    const p = this.profile();
    if (p) this.patchProfileForm(p);
    this.isEditing.set(false);
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    try {
      const { firstName, lastName, bio } = this.profileForm.getRawValue();
      const res = await firstValueFrom(this.api.updateProfile({ firstName: firstName || undefined, lastName: lastName || undefined, bio: bio || undefined }));
      this.profile.set(res.data);
      this.auth.setUser(res.data);
      this.isEditing.set(false);
      this.snackBar.open('Profile updated', undefined, { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to update profile', 'Dismiss', { duration: 5000 });
    } finally {
      this.isSaving.set(false);
    }
  }

  triggerAvatarUpload(): void {
    this.fileInputRef.nativeElement.click();
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('File must be smaller than 5 MB', 'Dismiss', { duration: 5000 });
      return;
    }
    this.isUploadingAvatar.set(true);
    try {
      const res = await firstValueFrom(this.api.uploadAvatar(file));
      this.profile.update((p) => p ? { ...p, avatarUrl: res.data.avatarUrl } : p);
      this.snackBar.open('Avatar updated', undefined, { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to upload avatar', 'Dismiss', { duration: 5000 });
    } finally {
      this.isUploadingAvatar.set(false);
      // Reset input so same file can be re-selected
      this.fileInputRef.nativeElement.value = '';
    }
  }

  async savePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isSavingPassword.set(true);
    try {
      const { currentPassword, newPassword } = this.passwordForm.getRawValue();
      await firstValueFrom(this.api.changePassword({ currentPassword: currentPassword!, newPassword: newPassword! }));
      this.passwordForm.reset();
      this.isChangingPassword.set(false);
      this.snackBar.open('Password changed', undefined, { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to change password', 'Dismiss', { duration: 5000 });
    } finally {
      this.isSavingPassword.set(false);
    }
  }

  cancelPasswordChange(): void {
    this.passwordForm.reset();
    this.isChangingPassword.set(false);
  }

  displayName(): string {
    const p = this.profile();
    if (!p) return '';
    return [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username;
  }
}
