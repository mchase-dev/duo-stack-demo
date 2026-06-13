import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { User } from '../../core/api/api.types';

export interface EditUserDialogData { user: User; }
export interface EditUserDialogResult {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bio: string;
}

@Component({
  selector: 'app-edit-user-dialog',
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Edit User — {{ data.user.username }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form" autocomplete="off">
        <mat-form-field appearance="outline">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Phone Number</mat-label>
          <input matInput formControlName="phoneNumber" type="tel">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Bio</mat-label>
          <textarea matInput formControlName="bio" rows="4" placeholder="Tell us about this user..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()">Save Changes</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem;
      padding: 0.5rem 0;
    }
    .full-width { grid-column: 1 / -1; }
    mat-form-field { width: 100%; }
  `],
})
export class EditUserDialogComponent {
  readonly data: EditUserDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditUserDialogComponent>);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    firstName: [this.data.user.firstName ?? ''],
    lastName: [this.data.user.lastName ?? ''],
    phoneNumber: [this.data.user.phoneNumber ?? ''],
    bio: [this.data.user.bio ?? ''],
  });

  save(): void {
    this.dialogRef.close(this.form.getRawValue() as EditUserDialogResult);
  }
}
