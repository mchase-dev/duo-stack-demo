import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { RoomsApiService } from '../../core/api/rooms.api';
import type { CreateRoomRequest, Room } from '../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class RoomsStore {
  private readonly api = inject(RoomsApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly rooms = signal<Room[]>([]);
  readonly isLoading = signal(false);

  async loadRooms(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.getRooms());
      this.rooms.set(res.data);
    } catch {
      this.snackBar.open('Failed to load rooms', 'Dismiss', { duration: 5000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  async createRoom(data: CreateRoomRequest): Promise<Room | null> {
    try {
      const res = await firstValueFrom(this.api.createRoom(data));
      this.snackBar.open('Room created', undefined, { duration: 3000 });
      await this.loadRooms();
      return res.data;
    } catch {
      this.snackBar.open('Failed to create room', 'Dismiss', { duration: 5000 });
      return null;
    }
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.deleteRoom(roomId));
      this.snackBar.open('Room deleted', undefined, { duration: 3000 });
      await this.loadRooms();
      return true;
    } catch {
      this.snackBar.open('Failed to delete room', 'Dismiss', { duration: 5000 });
      return false;
    }
  }
}
