import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { CreateRoomRequest } from '../../core/api/api.types';

@Component({
  selector: 'app-create-room-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Create Room</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Room Name</mat-label>
          <input matInput formControlName="name" placeholder="general" autocomplete="off">
          @if (form.controls.name.errors?.['required']) {
            <mat-error>Room name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description (optional)</mat-label>
          <textarea matInput formControlName="description" rows="3"
                    placeholder="Room description" autocomplete="off"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary"
              [disabled]="form.invalid"
              (click)="submit()">
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; } .form { display: flex; flex-direction: column; gap: 4px; }'],
})
export class CreateRoomDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateRoomDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const { name, description } = this.form.value;
    const result: CreateRoomRequest = { name: name!, isPublic: true };
    if (description?.trim()) result.description = description.trim();
    this.dialogRef.close(result);
  }
}
