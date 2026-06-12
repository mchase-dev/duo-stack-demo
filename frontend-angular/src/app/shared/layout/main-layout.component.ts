import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/auth/auth.service';
import { RealtimeConnectionService } from '../../core/realtime/realtime-connection.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  // Instantiating the service starts the connect/disconnect-on-auth effect
  // (mirrors React's useRealtimeConnection() in MainLayout)
  protected readonly realtime = inject(RealtimeConnectionService);

  readonly user = this.auth.user;
  readonly isAdmin = computed(() => {
    const role = this.user()?.role;
    return role === 'Admin' || role === 'Superuser';
  });

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}
