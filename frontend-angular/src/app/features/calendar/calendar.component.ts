import { Component, effect, inject, signal, computed, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { CalendarOptions } from '@fullcalendar/core';
import { EventsStore } from './events.store';
import { EventModalComponent, type EventModalData } from './event-modal.component';
import { FullCalendarComponent } from './full-calendar.component';
import { RealtimeAdapter } from '../../core/realtime/realtime-adapter';
import { RealtimeConnectionService } from '../../core/realtime/realtime-connection.service';
import type { CalendarEvent, EventVisibility } from '../../core/api/api.types';

function getVisibilityColor(v: EventVisibility): string {
  if (v === 'Private') return '#6B7280';
  if (v === 'Restricted') return '#10B981';
  return '#3B82F6';
}

type VisibilityFilter = EventVisibility | 'All';

@Component({
  selector: 'app-calendar',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FullCalendarComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  readonly store = inject(EventsStore);
  private readonly adapter = inject(RealtimeAdapter);
  private readonly realtime = inject(RealtimeConnectionService);

  constructor() {
    // Listener registration needs a live connection object, so wire only
    // once the transport reports connected (the store keeps it idempotent)
    effect(() => {
      if (this.realtime.status() === 'connected') {
        this.store.wireRealtime(this.adapter);
      }
    });
  }

  readonly visibilityFilter = signal<VisibilityFilter>('All');
  readonly filterOptions: VisibilityFilter[] = ['All', 'Private', 'Public', 'Restricted'];
  readonly visibilityColors: Partial<Record<EventVisibility, string>> = {
    Private: '#6B7280', Public: '#3B82F6', Restricted: '#10B981',
  };

  private readonly fcEvents = computed(() => {
    const events = this.store.events();
    const filter = this.visibilityFilter();
    const filtered = filter === 'All' ? events : events.filter(e => e.visibility === filter);
    return filtered.map(e => ({
      id: e.id,
      title: e.title,
      start: e.startTime,
      end: e.endTime,
      backgroundColor: e.color ?? getVisibilityColor(e.visibility),
      borderColor: e.color ?? getVisibilityColor(e.visibility),
      extendedProps: { description: e.description, location: e.location, visibility: e.visibility },
    }));
  });

  readonly calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: this.fcEvents(),
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    editable: true,
    height: 'auto',
    eventTimeFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
    select: (info) => this.openCreate(info.startStr, info.endStr),
    eventClick: (info) => this.openEdit(info.event.id),
    eventDrop: (info) => void this.handleDrop(info.event.id, info.event.start, info.event.end, info.revert),
    eventResize: (info) => void this.handleResize(info.event.id, info.event.start, info.event.end, info.revert),
  }));

  readonly upcomingEvents = computed(() => {
    const filter = this.visibilityFilter();
    const now = new Date();
    return this.store.events()
      .filter(e => (filter === 'All' || e.visibility === filter) && new Date(e.startTime) >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  });

  ngOnInit(): void {
    void this.store.loadEvents();
  }

  openCreate(startStr?: string, endStr?: string): void {
    const data: EventModalData = { initialStart: startStr, initialEnd: endStr };
    this.dialog.open(EventModalComponent, { data, width: '620px', maxHeight: '90vh' });
  }

  openEdit(eventId: string): void {
    const event = this.store.events().find(e => e.id === eventId);
    if (!event) return;
    const data: EventModalData = { event };
    this.dialog.open(EventModalComponent, { data, width: '620px', maxHeight: '90vh' });
  }

  openAgendaEvent(event: CalendarEvent): void {
    const data: EventModalData = { event };
    this.dialog.open(EventModalComponent, { data, width: '620px', maxHeight: '90vh' });
  }

  private async handleDrop(
    id: string,
    start: Date | null,
    end: Date | null,
    revert: () => void,
  ): Promise<void> {
    if (!start) { revert(); return; }
    const result = await this.store.updateEvent(id, {
      startTime: start.toISOString(),
      endTime: (end ?? start).toISOString(),
    });
    if (!result) revert();
  }

  private async handleResize(
    id: string,
    start: Date | null,
    end: Date | null,
    revert: () => void,
  ): Promise<void> {
    if (!start || !end) { revert(); return; }
    const result = await this.store.updateEvent(id, {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
    if (!result) revert();
  }

  formatEventTime(startTime: string): string {
    return new Date(startTime).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }
}
