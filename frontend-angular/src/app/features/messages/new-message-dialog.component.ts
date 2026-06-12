import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import type { Conversation, User } from '../../core/api/api.types';

export interface NewMessageDialogData {
  currentUserId: string;
  conversations: Conversation[];
  allUsers: User[];
}

export interface NewMessageDialogResult {
  toUserId: string;
  content: string;
}

@Component({
  selector: 'app-new-message-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
  template: `
    <h2 mat-dialog-title>New Message</h2>
    <mat-dialog-content>
      @if (!selectedUser()) {
        <p class="hint">Select a user to message:</p>
        @if (availableUsers().length === 0) {
          <p class="empty">No users available to message.</p>
        } @else {
          <mat-nav-list>
            @for (user of availableUsers(); track user.id) {
              <mat-list-item (click)="selectUser(user)" class="user-item">
                <span matListItemTitle>{{ user.username }}</span>
                <span matListItemLine>{{ user.email }}</span>
              </mat-list-item>
            }
          </mat-nav-list>
        }
      } @else {
        <div class="to-row">
          <span class="to-label">To:</span>
          <strong>{{ selectedUser()!.username }}</strong>
          <button mat-button color="primary" (click)="selectedUser.set(null)">Change</button>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Message</mat-label>
          <textarea matInput [formControl]="messageCtrl" rows="6"
                    placeholder="Type your message..." autofocus></textarea>
        </mat-form-field>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      @if (selectedUser()) {
        <button mat-button (click)="selectedUser.set(null)">Back</button>
        <button mat-flat-button color="primary"
                [disabled]="!messageCtrl.value?.trim()"
                (click)="submit()">
          Send
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .hint { margin: 0 0 8px; color: rgba(0,0,0,.6); font-size: 14px; }
    .empty { color: rgba(0,0,0,.38); text-align: center; padding: 24px; }
    .to-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .to-label { font-size: 14px; color: rgba(0,0,0,.6); }
    .full-width { width: 100%; }
    .user-item { cursor: pointer; }
  `],
})
export class NewMessageDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NewMessageDialogComponent>);
  readonly data = inject<NewMessageDialogData>(MAT_DIALOG_DATA);

  readonly selectedUser = signal<User | null>(null);
  readonly messageCtrl = new FormControl('', Validators.required);

  readonly availableUsers = signal<User[]>(
    this.data.allUsers.filter(
      u =>
        u.id !== this.data.currentUserId &&
        !this.data.conversations.some(c => c.user.id === u.id)
    )
  );

  selectUser(user: User): void {
    this.selectedUser.set(user);
  }

  submit(): void {
    const content = this.messageCtrl.value?.trim();
    const user = this.selectedUser();
    if (!content || !user) return;
    this.dialogRef.close({ toUserId: user.id, content } satisfies NewMessageDialogResult);
  }
}
