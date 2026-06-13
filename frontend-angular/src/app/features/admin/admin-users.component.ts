import {
  Component, OnDestroy, OnInit, computed, inject, signal,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UsersApiService } from '../../core/api/users.api';
import type { User, UserRole } from '../../core/api/api.types';
import { EditUserDialogComponent } from './edit-user-dialog.component';
import type { EditUserDialogResult } from './edit-user-dialog.component';
import { ChangeRoleDialogComponent } from './change-role-dialog.component';

@Component({
  selector: 'app-admin-users',
  imports: [
    SlicePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  private readonly api = inject(UsersApiService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly users = signal<User[]>([]);
  readonly total = signal(0);
  readonly isLoading = signal(true);
  readonly isFetching = signal(false);

  readonly searchControl = new FormControl('');
  private searchSub?: Subscription;

  readonly currentUser = this.auth.user;
  readonly isSuperuser = computed(() => this.currentUser()?.role === 'Superuser');
  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'Admin' || role === 'Superuser';
  });

  ngOnInit(): void {
    void this.loadUsers('');

    this.searchSub = this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe((term) => {
      void this.loadUsers(term ?? '');
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  async loadUsers(search: string): Promise<void> {
    this.isFetching.set(true);
    try {
      const res = await firstValueFrom(this.api.getUsers({ search, pageSize: 100 }));
      this.users.set(res.data.items);
      this.total.set(res.data.total);
    } catch {
      this.snackBar.open('Failed to load users', 'Dismiss', { duration: 5000 });
    } finally {
      this.isLoading.set(false);
      this.isFetching.set(false);
    }
  }

  openEditDialog(user: User): void {
    const ref = this.dialog.open(EditUserDialogComponent, {
      data: { user },
      width: '560px',
    });
    ref.afterClosed().subscribe(async (result: EditUserDialogResult | undefined) => {
      if (!result) return;
      try {
        await firstValueFrom(this.api.updateUser(user.id, {
          firstName: result.firstName || undefined,
          lastName: result.lastName || undefined,
          phoneNumber: result.phoneNumber || undefined,
          bio: result.bio || undefined,
        }));
        this.snackBar.open('User updated', undefined, { duration: 3000 });
        void this.loadUsers(this.searchControl.value ?? '');
      } catch {
        this.snackBar.open('Failed to update user', 'Dismiss', { duration: 5000 });
      }
    });
  }

  openRoleDialog(user: User): void {
    const ref = this.dialog.open(ChangeRoleDialogComponent, {
      data: { user },
      width: '420px',
    });
    ref.afterClosed().subscribe(async (role: UserRole | undefined) => {
      if (!role) return;
      try {
        await firstValueFrom(this.api.updateUserRole(user.id, role));
        this.snackBar.open(`Role updated to ${role}`, undefined, { duration: 3000 });
        void this.loadUsers(this.searchControl.value ?? '');
      } catch {
        this.snackBar.open('Failed to update role', 'Dismiss', { duration: 5000 });
      }
    });
  }

  async deleteUser(user: User): Promise<void> {
    if (!confirm(`Delete user "${user.username}"? This action cannot be undone.`)) return;
    try {
      await firstValueFrom(this.api.deleteUser(user.id));
      this.users.update((list) => list.filter((u) => u.id !== user.id));
      this.total.update((n) => n - 1);
      this.snackBar.open('User deleted', undefined, { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to delete user', 'Dismiss', { duration: 5000 });
    }
  }

  displayName(user: User): string {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
  }

  roleClass(role: UserRole): string {
    if (role === 'Superuser') return 'chip-superuser';
    if (role === 'Admin') return 'chip-admin';
    return 'chip-user';
  }

  adminCount(): number { return this.users().filter((u) => u.role === 'Admin').length; }
  superuserCount(): number { return this.users().filter((u) => u.role === 'Superuser').length; }
}
