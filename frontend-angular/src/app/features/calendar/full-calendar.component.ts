import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';
import { Calendar } from '@fullcalendar/core';
import type { CalendarOptions } from '@fullcalendar/core';

// Minimal zoneless-safe wrapper around the FullCalendar core API.
// Replaces @fullcalendar/angular, whose connector calls
// ChangeDetectorRef.detectChanges() during render and breaks zoneless
// change detection (NG0100 loop). Plain options/callbacks only — no
// Angular-template content injection, which this app doesn't use.
@Component({
  selector: 'app-full-calendar',
  template: '',
  styles: [':host { display: block; }'],
})
export class FullCalendarComponent implements OnDestroy {
  readonly options = input.required<CalendarOptions>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private calendar: Calendar | null = null;

  constructor() {
    afterNextRender(() => {
      this.calendar = new Calendar(this.host.nativeElement, this.options());
      this.calendar.render();
    });
    // Push subsequent option changes (events array, callbacks) into the
    // calendar; FullCalendar diffs internally and preserves view/date state
    effect(() => {
      const options = this.options();
      this.calendar?.resetOptions(options);
    });
  }

  ngOnDestroy(): void {
    this.calendar?.destroy();
    this.calendar = null;
  }
}
