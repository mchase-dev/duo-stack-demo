import {
  Component, ElementRef, OnDestroy, OnInit, ViewChild,
  computed, effect, inject, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth/auth.service';
import { RealtimeAdapter } from '../../core/realtime/realtime-adapter';
import type { RoomMessageEvent, UserJoinedRoomEvent, UserLeftRoomEvent } from '../../core/realtime/realtime-adapter';
import { RealtimeConnectionService } from '../../core/realtime/realtime-connection.service';
import { RoomsStore } from './rooms.store';
import { CreateRoomDialogComponent } from './create-room-dialog.component';
import type { CreateRoomRequest, Room } from '../../core/api/api.types';

interface RoomMember { userId: string; username: string; }

interface RoomMessageDisplay {
  id: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: string;
}

interface RoomMembersEvent { roomId: string; members: RoomMember[]; }

@Component({
  selector: 'app-rooms',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent implements OnInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  readonly store = inject(RoomsStore);
  private readonly auth = inject(AuthService);
  private readonly adapter = inject(RealtimeAdapter);
  private readonly realtime = inject(RealtimeConnectionService);

  readonly currentUser = this.auth.user;
  readonly selectedRoom = signal<Room | null>(null);
  readonly roomMessages = signal<RoomMessageDisplay[]>([]);
  readonly onlineMembers = signal<RoomMember[]>([]);
  readonly messageInput = signal('');

  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'Admin' || role === 'Superuser';
  });

  @ViewChild('messagesEnd') messagesEndRef?: ElementRef<HTMLDivElement>;

  private realtimeWired = false;

  constructor() {
    effect(() => {
      if (this.realtime.status() === 'connected') {
        this.wireRealtime();
      }
    });

    // Auto-scroll when messages change
    effect(() => {
      const msgs = this.roomMessages();
      if (msgs.length > 0) {
        setTimeout(() => this.messagesEndRef?.nativeElement?.scrollIntoView({ behavior: 'smooth' }), 0);
      }
    });
  }

  ngOnInit(): void {
    void this.store.loadRooms();
  }

  ngOnDestroy(): void {
    const room = this.selectedRoom();
    if (room) {
      this.adapter.leaveRoom(room.id).catch(() => void 0);
    }
    // Clean up room-only listeners
    this.adapter.off('roomMessage');
    this.adapter.off('RoomMessage');
    this.adapter.off('userJoinedRoom');
    this.adapter.off('UserJoinedRoom');
    this.adapter.off('userLeftRoom');
    this.adapter.off('UserLeftRoom');
    this.adapter.off('roomMembers');
    this.adapter.off('RoomMembers');
  }

  async selectRoom(room: Room): Promise<void> {
    const prev = this.selectedRoom();
    if (prev) {
      await this.adapter.leaveRoom(prev.id).catch(() => void 0);
    }
    this.selectedRoom.set(room);
    this.roomMessages.set([]);
    this.onlineMembers.set([]);
    try {
      await this.adapter.joinRoom(room.id);
    } catch {
      // If not connected yet, joinRoom will be called when connected
    }
  }

  async sendMessage(): Promise<void> {
    const content = this.messageInput().trim();
    const room = this.selectedRoom();
    if (!content || !room) return;
    this.messageInput.set('');
    try {
      await this.adapter.sendToRoom(room.id, content);
    } catch {
      this.messageInput.set(content);
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.sendMessage();
    }
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CreateRoomDialogComponent, { width: '420px' });
    ref.afterClosed().subscribe(async (data: CreateRoomRequest | undefined) => {
      if (data) {
        await this.store.createRoom(data);
      }
    });
  }

  async deleteRoom(room: Room): Promise<void> {
    if (!confirm(`Delete room "${room.name}"?`)) return;
    const ok = await this.store.deleteRoom(room.id);
    if (ok && this.selectedRoom()?.id === room.id) {
      this.selectedRoom.set(null);
      this.roomMessages.set([]);
      this.onlineMembers.set([]);
    }
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getInitial(username: string): string {
    return username[0]?.toUpperCase() ?? '?';
  }

  private wireRealtime(): void {
    if (this.realtimeWired) return;

    this.adapter.onRoomMessage((event: RoomMessageEvent) => {
      if (this.selectedRoom()?.id !== event.roomId) return;
      this.roomMessages.update(msgs => [
        ...msgs,
        { id: event.messageId, senderId: event.senderId, senderUsername: event.senderUsername, message: event.message, timestamp: event.timestamp },
      ]);
    });

    this.adapter.on('roomMembers', (raw: unknown) => {
      const event = raw as RoomMembersEvent;
      if (this.selectedRoom()?.id !== event.roomId) return;
      const currentUser = this.currentUser();
      this.onlineMembers.update(prev => {
        const merged = [...prev];
        for (const m of event.members) {
          if (!merged.some(u => u.userId === m.userId)) merged.push(m);
        }
        if (currentUser && !merged.some(u => u.userId === currentUser.id)) {
          merged.push({ userId: currentUser.id, username: currentUser.username });
        }
        return merged;
      });
    });

    this.adapter.onUserJoinedRoom((event: UserJoinedRoomEvent) => {
      if (this.selectedRoom()?.id !== event.roomId) return;
      this.onlineMembers.update(prev =>
        prev.some(u => u.userId === event.userId)
          ? prev
          : [...prev, { userId: event.userId, username: event.username }]
      );
    });

    this.adapter.onUserLeftRoom((event: UserLeftRoomEvent) => {
      if (this.selectedRoom()?.id !== event.roomId) return;
      this.onlineMembers.update(prev => prev.filter(u => u.userId !== event.userId));
    });

    this.realtimeWired = true;
  }
}
