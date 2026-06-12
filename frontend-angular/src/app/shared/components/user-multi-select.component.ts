import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UsersApiService } from '../../core/api/users.api';
import type { User } from '../../core/api/api.types';

@Component({
  selector: 'app-user-multi-select',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <mat-chip-grid #chipGrid>
        @for (user of selectedUsers(); track user.id) {
          <mat-chip (removed)="removeUser(user.id)">
            {{ user.username }}
            <button matChipRemove><mat-icon>cancel</mat-icon></button>
          </mat-chip>
        }
        <input
          [matChipInputFor]="chipGrid"
          [matAutocomplete]="auto"
          [formControl]="searchCtrl"
          placeholder="Search users..."
        />
      </mat-chip-grid>
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelect($event)">
        @for (user of filteredUsers(); track user.id) {
          <mat-option [value]="user.id">
            {{ user.username }}
            @if (user.firstName || user.lastName) {
              <span class="user-name-hint"> — {{ user.firstName }} {{ user.lastName }}</span>
            }
          </mat-option>
        }
        @if (filteredUsers().length === 0 && searchCtrl.value) {
          <mat-option disabled>No users found</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: ['.full-width { width: 100%; } .user-name-hint { color: var(--mat-sys-on-surface-variant); font-size: 0.85em; }'],
})
export class UserMultiSelectComponent implements OnInit, OnDestroy {
  @Input() label = 'Allowed Users';
  @Input() set selectedUserIds(ids: string[]) {
    this._selectedUserIds = ids ?? [];
    void this.refreshSelected();
  }
  @Output() selectedUserIdsChange = new EventEmitter<string[]>();

  private _selectedUserIds: string[] = [];
  private readonly usersApi = inject(UsersApiService);
  private sub?: Subscription;

  readonly searchCtrl = new FormControl('');
  readonly selectedUsers = signal<User[]>([]);
  readonly filteredUsers = signal<User[]>([]);

  ngOnInit(): void {
    this.sub = this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(async (search) => {
      if (!search?.trim()) { this.filteredUsers.set([]); return; }
      try {
        const res = await firstValueFrom(this.usersApi.getUsers({ search, pageSize: 20 }));
        this.filteredUsers.set(res.data.items.filter(u => !this._selectedUserIds.includes(u.id)));
      } catch { /* ignore */ }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async refreshSelected(): Promise<void> {
    if (this._selectedUserIds.length === 0) { this.selectedUsers.set([]); return; }
    try {
      const res = await firstValueFrom(this.usersApi.getUsers({ pageSize: 100 }));
      this.selectedUsers.set(res.data.items.filter(u => this._selectedUserIds.includes(u.id)));
    } catch { /* ignore */ }
  }

  onSelect(event: MatAutocompleteSelectedEvent): void {
    const userId = event.option.value as string;
    if (!this._selectedUserIds.includes(userId)) {
      this.selectedUserIdsChange.emit([...this._selectedUserIds, userId]);
    }
    this.searchCtrl.setValue('');
    this.filteredUsers.set([]);
  }

  removeUser(userId: string): void {
    this.selectedUserIdsChange.emit(this._selectedUserIds.filter(id => id !== userId));
  }
}
