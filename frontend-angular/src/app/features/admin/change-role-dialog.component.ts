import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import type { User, UserRole } from '../../core/api/api.types';

export interface ChangeRoleDialogData { user: User; }

@Component({
  selector: 'app-change-role-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Change Role — {{ data.user.username }}</h2>
    <mat-dialog-content>
      <p class="prompt">Select the new role for this user:</p>
      <div class="role-list">
        @for (role of roles; track role) {
          <button class="role-btn" [class.current]="isCurrent(role)" (click)="select(role)">
            <div class="role-info">
              <mat-icon>{{ roleIcon(role) }}</mat-icon>
              <span class="role-name">{{ role }}</span>
            </div>
            @if (isCurrent(role)) {
              <span class="current-label">Current</span>
            }
          </button>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .prompt { color: var(--mat-sys-on-surface-variant); margin-bottom: 1rem; }
    .role-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .role-btn {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.75rem 1rem; border: 2px solid var(--mat-sys-outline);
      border-radius: 8px; background: transparent; cursor: pointer;
      transition: border-color 0.15s;
      &:hover:not(.current) { border-color: var(--mat-sys-primary); }
      &.current { border-color: var(--mat-sys-primary); background: var(--mat-sys-primary-container); cursor: default; }
    }
    .role-info { display: flex; align-items: center; gap: 0.5rem; }
    .role-name { font-weight: 500; }
    .current-label { font-size: 0.8rem; color: var(--mat-sys-primary); font-weight: 500; }
  `],
})
export class ChangeRoleDialogComponent {
  readonly data: ChangeRoleDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ChangeRoleDialogComponent>);

  readonly roles: UserRole[] = ['User', 'Admin', 'Superuser'];

  isCurrent(role: UserRole): boolean {
    return this.data.user.role?.toLowerCase() === role.toLowerCase();
  }

  select(role: UserRole): void {
    if (!this.isCurrent(role)) this.dialogRef.close(role);
  }

  roleIcon(role: UserRole): string {
    return role === 'Superuser' ? 'admin_panel_settings'
      : role === 'Admin' ? 'shield'
      : 'person';
  }
}
