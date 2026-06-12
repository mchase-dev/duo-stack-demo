import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { MessagesApiService } from '../../core/api/messages.api';
import { UsersApiService } from '../../core/api/users.api';
import type { RealtimeAdapter } from '../../core/realtime/realtime-adapter';
import type { Conversation, Message, User } from '../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class MessagesStore {
  private readonly messagesApi = inject(MessagesApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly conversations = signal<Conversation[]>([]);
  readonly currentMessages = signal<Message[]>([]);
  readonly isLoadingConversations = signal(false);
  readonly isLoadingMessages = signal(false);
  readonly allUsers = signal<User[]>([]);
  readonly selectedUserId = signal<string | null>(null);

  private realtimeWired = false;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;

  async loadConversations(): Promise<void> {
    this.isLoadingConversations.set(true);
    try {
      const res = await firstValueFrom(this.messagesApi.getConversations());
      this.conversations.set(res.data);
    } catch {
      this.snackBar.open('Failed to load conversations', 'Dismiss', { duration: 5000 });
    } finally {
      this.isLoadingConversations.set(false);
    }
  }

  async loadConversation(userId: string): Promise<void> {
    this.isLoadingMessages.set(true);
    try {
      const res = await firstValueFrom(this.messagesApi.getConversation(userId));
      this.currentMessages.set(res.data.messages);
    } catch {
      this.snackBar.open('Failed to load messages', 'Dismiss', { duration: 5000 });
    } finally {
      this.isLoadingMessages.set(false);
    }
  }

  async selectConversation(userId: string): Promise<void> {
    this.selectedUserId.set(userId);
    await this.loadConversation(userId);
  }

  async sendMessage(toUserId: string, content: string): Promise<boolean> {
    try {
      await firstValueFrom(this.messagesApi.sendMessage({ toUserId, content }));
      await Promise.all([this.loadConversations(), this.loadConversation(toUserId)]);
      return true;
    } catch {
      this.snackBar.open('Failed to send message', 'Dismiss', { duration: 5000 });
      return false;
    }
  }

  async loadAllUsers(): Promise<void> {
    try {
      const res = await firstValueFrom(this.usersApi.getUsers({ pageSize: 200 }));
      this.allUsers.set(res.data.items);
    } catch {
      // non-critical
    }
  }

  startPolling(): void {
    if (this.pollIntervalId !== null) return;
    this.pollIntervalId = setInterval(() => void this.loadConversations(), 30000);
  }

  stopPolling(): void {
    if (this.pollIntervalId !== null) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  wireRealtime(adapter: RealtimeAdapter): void {
    if (this.realtimeWired) return;
    adapter.onUserMessage((event) => {
      void this.loadConversations();
      const selectedId = this.selectedUserId();
      if (selectedId && (selectedId === event.senderId || selectedId === event.receiverId)) {
        void this.loadConversation(selectedId);
      }
    });
    this.realtimeWired = true;
  }
}
