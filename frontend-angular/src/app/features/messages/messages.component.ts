import {
  Component, ElementRef, OnDestroy, OnInit, ViewChild,
  computed, effect, inject, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth/auth.service';
import { RealtimeAdapter } from '../../core/realtime/realtime-adapter';
import { RealtimeConnectionService } from '../../core/realtime/realtime-connection.service';
import { MessagesStore } from './messages.store';
import {
  NewMessageDialogComponent,
  type NewMessageDialogResult,
} from './new-message-dialog.component';

@Component({
  selector: 'app-messages',
  imports: [
    FormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  readonly store = inject(MessagesStore);
  private readonly auth = inject(AuthService);
  private readonly adapter = inject(RealtimeAdapter);
  private readonly realtime = inject(RealtimeConnectionService);

  readonly currentUser = this.auth.user;
  readonly messageInput = signal('');
  readonly onlineUserIds = signal(new Set<string>());

  readonly selectedConversation = computed(() =>
    this.store.conversations().find(c => c.user.id === this.store.selectedUserId())
  );

  @ViewChild('messagesEnd') messagesEndRef?: ElementRef<HTMLDivElement>;

  private onlineListenersWired = false;

  constructor() {
    effect(() => {
      if (this.realtime.status() === 'connected') {
        this.store.wireRealtime(this.adapter);
        if (!this.onlineListenersWired) {
          this.adapter.onUserOnline(e =>
            this.onlineUserIds.update(s => new Set([...s, e.userId]))
          );
          this.adapter.onUserOffline(e =>
            this.onlineUserIds.update(s => {
              const next = new Set(s);
              next.delete(e.userId);
              return next;
            })
          );
          this.onlineListenersWired = true;
        }
      }
    });

    // Auto-scroll when messages change
    effect(() => {
      const msgs = this.store.currentMessages();
      if (msgs.length > 0) {
        setTimeout(() => this.messagesEndRef?.nativeElement?.scrollIntoView({ behavior: 'smooth' }), 0);
      }
    });
  }

  ngOnInit(): void {
    void this.store.loadConversations();
    void this.store.loadAllUsers();
    this.store.startPolling();
  }

  ngOnDestroy(): void {
    this.store.stopPolling();
  }

  async selectConversation(userId: string): Promise<void> {
    await this.store.selectConversation(userId);
  }

  async sendMessage(): Promise<void> {
    const content = this.messageInput().trim();
    const toUserId = this.store.selectedUserId();
    if (!content || !toUserId) return;
    this.messageInput.set('');
    await this.store.sendMessage(toUserId, content);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.sendMessage();
    }
  }

  openNewMessageDialog(): void {
    const ref = this.dialog.open(NewMessageDialogComponent, {
      width: '500px',
      maxHeight: '80vh',
      data: {
        currentUserId: this.currentUser()?.id ?? '',
        conversations: this.store.conversations(),
        allUsers: this.store.allUsers(),
      },
    });
    ref.afterClosed().subscribe(async (result: NewMessageDialogResult | undefined) => {
      if (!result) return;
      const ok = await this.store.sendMessage(result.toUserId, result.content);
      if (ok) {
        await this.store.selectConversation(result.toUserId);
      }
    });
  }

  isOnline(userId: string): boolean {
    return this.onlineUserIds().has(userId);
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  getInitial(username: string): string {
    return username[0]?.toUpperCase() ?? '?';
  }
}
