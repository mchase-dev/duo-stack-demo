import { Component, inject, signal, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UserMultiSelectComponent } from '../../shared/components/user-multi-select.component';
import { EventsStore } from './events.store';
import type { CalendarEvent, EventVisibility } from '../../core/api/api.types';

export const COLOR_PRESETS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
] as const;

export interface EventModalData {
  event?: CalendarEvent | null;
  initialStart?: string;
  initialEnd?: string;
}

function endAfterStart(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startTime')?.value as string;
  const end = group.get('endTime')?.value as string;
  if (!start || !end) return null;
  return new Date(end) > new Date(start) ? null : { endBeforeStart: true };
}

// Converts FullCalendar date string to datetime-local value (YYYY-MM-DDTHH:mm)
function toDateTimeLocal(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00`;
  }
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-event-modal',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    UserMultiSelectComponent,
  ],
  templateUrl: './event-modal.component.html',
  styles: [`
    .visibility-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .vis-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 8px; border-radius: 8px; border: 2px solid var(--mat-sys-outline);
      background: none; cursor: pointer; font-weight: 500; transition: border-color 0.15s, background 0.15s;
    }
    .vis-btn.selected {
      border-color: var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
      color: var(--mat-sys-primary);
    }
    .color-grid { display: flex; gap: 8px; flex-wrap: wrap; }
    .color-swatch {
      width: 36px; height: 36px; border-radius: 50%; border: 3px solid transparent;
      cursor: pointer; transition: box-shadow 0.15s;
    }
    .color-swatch.selected { box-shadow: 0 0 0 3px white, 0 0 0 5px var(--mat-sys-primary); }
    .form-section { display: flex; flex-direction: column; gap: 12px; }
    .date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .error-text { color: var(--mat-sys-error); font-size: 12px; margin-top: 4px; }
    mat-form-field { width: 100%; }
  `],
})
export class EventModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(EventsStore);
  readonly dialogRef = inject(MatDialogRef<EventModalComponent>);
  readonly data: EventModalData = inject(MAT_DIALOG_DATA);

  readonly colorPresets = COLOR_PRESETS;
  readonly visibilityOptions: { value: EventVisibility; label: string; icon: string }[] = [
    { value: 'Private', label: 'Private', icon: 'lock' },
    { value: 'Public', label: 'Public', icon: 'public' },
    { value: 'Restricted', label: 'Restricted', icon: 'group' },
  ];

  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly isEditing = !!this.data.event;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    location: ['', Validators.maxLength(200)],
    visibility: ['Public' as EventVisibility, Validators.required],
    color: [COLOR_PRESETS[0] as string],
    allowedUserIds: [[] as string[]],
  }, { validators: endAfterStart });

  ngOnInit(): void {
    const { event, initialStart, initialEnd } = this.data;
    if (event) {
      this.form.setValue({
        title: event.title,
        description: event.description ?? '',
        startTime: toDateTimeLocal(event.startTime),
        endTime: toDateTimeLocal(event.endTime),
        location: event.location ?? '',
        visibility: event.visibility,
        color: event.color ?? COLOR_PRESETS[0],
        allowedUserIds: event.allowedUserIds ?? [],
      });
    } else if (initialStart && initialEnd) {
      this.form.patchValue({
        startTime: toDateTimeLocal(initialStart),
        endTime: toDateTimeLocal(initialEnd),
      });
    }
  }

  get visibility() { return this.form.controls.visibility.value; }
  get allowedUserIds() { return this.form.controls.allowedUserIds.value; }

  setVisibility(v: EventVisibility): void { this.form.controls.visibility.setValue(v); }
  setColor(c: string): void { this.form.controls.color.setValue(c); }
  setAllowedUsers(ids: string[]): void { this.form.controls.allowedUserIds.setValue(ids); }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    try {
      const raw = this.form.getRawValue();
      const payload = {
        ...raw,
        startTime: new Date(raw.startTime).toISOString(),
        endTime: new Date(raw.endTime).toISOString(),
        allowedUserIds: raw.visibility === 'Restricted' ? raw.allowedUserIds : [],
      };
      let result: CalendarEvent | null;
      if (this.isEditing && this.data.event) {
        result = await this.store.updateEvent(this.data.event.id, payload);
      } else {
        result = await this.store.createEvent(payload);
      }
      if (result) this.dialogRef.close(true);
    } finally {
      this.isSaving.set(false);
    }
  }

  async onDelete(): Promise<void> {
    if (!this.data.event) return;
    if (!confirm('Delete this event?')) return;
    this.isDeleting.set(true);
    try {
      const ok = await this.store.deleteEvent(this.data.event.id);
      if (ok) this.dialogRef.close(true);
    } finally {
      this.isDeleting.set(false);
    }
  }
}
