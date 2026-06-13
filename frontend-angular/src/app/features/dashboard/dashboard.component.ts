import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dashboard">
      <div class="hero">
        <mat-icon class="hero-icon">dashboard</mat-icon>
        <h1>Welcome back, {{ displayName() }}!</h1>
        <p class="subtitle">Role: <span class="role-chip">{{ user()?.role }}</span></p>
      </div>

      <div class="card-grid">
        <mat-card class="nav-card" routerLink="/calendar">
          <mat-card-content>
            <mat-icon color="primary">calendar_month</mat-icon>
            <h3>Calendar</h3>
            <p>View and manage your events</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="nav-card" routerLink="/messages">
          <mat-card-content>
            <mat-icon color="primary">message</mat-icon>
            <h3>Messages</h3>
            <p>Direct messages with other users</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="nav-card" routerLink="/rooms">
          <mat-card-content>
            <mat-icon color="primary">chat</mat-icon>
            <h3>Rooms</h3>
            <p>Join group chat rooms</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="nav-card" routerLink="/pages">
          <mat-card-content>
            <mat-icon color="primary">article</mat-icon>
            <h3>Pages</h3>
            <p>Browse CMS content</p>
          </mat-card-content>
        </mat-card>

        @if (isAdmin()) {
          <mat-card class="nav-card" routerLink="/admin/users">
            <mat-card-content>
              <mat-icon color="accent">manage_accounts</mat-icon>
              <h3>Admin</h3>
              <p>Manage users and roles</p>
            </mat-card-content>
          </mat-card>
        }

        <mat-card class="nav-card" routerLink="/profile">
          <mat-card-content>
            <mat-icon color="primary">person</mat-icon>
            <h3>Profile</h3>
            <p>Update your profile and settings</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .hero { text-align: center; margin-bottom: 2.5rem; }
    .hero-icon { font-size: 3rem; height: 3rem; width: 3rem; color: var(--mat-sys-primary); }
    h1 { font-size: 2rem; font-weight: 600; margin: 0.5rem 0; }
    .subtitle { color: var(--mat-sys-on-surface-variant); }
    .role-chip {
      display: inline-block; padding: 2px 10px; border-radius: 12px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-weight: 500; font-size: 0.85rem;
    }
    .card-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;
    }
    .nav-card {
      cursor: pointer; transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
      mat-card-content {
        display: flex; flex-direction: column; align-items: center;
        text-align: center; padding: 1.5rem 1rem; gap: 0.5rem;
        mat-icon { font-size: 2rem; height: 2rem; width: 2rem; }
        h3 { margin: 0; font-size: 1rem; font-weight: 600; }
        p { margin: 0; font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }
      }
    }
  `],
})
export class DashboardComponent {
  private auth = inject(AuthService);
  readonly user = this.auth.user;
  readonly displayName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username;
  });
  readonly isAdmin = computed(() => {
    const role = this.user()?.role;
    return role === 'Admin' || role === 'Superuser';
  });
}
