import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { MainLayoutComponent } from './shared/layout/main-layout.component';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },

  // Authenticated shell
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/messages/messages.component').then((m) => m.MessagesComponent),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./features/rooms/rooms.component').then((m) => m.RoomsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'pages',
        loadComponent: () =>
          import('./features/pages/pages-list.component').then((m) => m.PagesListComponent),
      },
      // Static segments must precede :slug param
      {
        path: 'pages/new',
        canActivate: [roleGuard('Superuser')],
        loadComponent: () =>
          import('./features/pages/page-editor.component').then((m) => m.PageEditorComponent),
      },
      {
        path: 'pages/edit/:slug',
        canActivate: [roleGuard('Superuser')],
        loadComponent: () =>
          import('./features/pages/page-editor.component').then((m) => m.PageEditorComponent),
      },
      {
        path: 'pages/:slug',
        loadComponent: () =>
          import('./features/pages/page-view.component').then((m) => m.PageViewComponent),
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard('Admin')],
        loadComponent: () =>
          import('./features/admin/admin-users.component').then((m) => m.AdminUsersComponent),
      },
    ],
  },

  // 404
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
