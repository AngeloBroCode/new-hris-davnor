import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layout/app/layout';
import { EmptyLayout } from './layout/empty/empty';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: EmptyLayout,
    loadChildren: () => import('./features/auth/routes'),
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'dashboard',
        data: { breadcrumb: 'navigation.dashboard' },
        loadChildren: () => import('./features/dashboards/dashboard-1/routes'),
      },
      {
        path: 'users',
        title: 'users',
        data: { breadcrumb: 'navigation.users', preload: true },
        loadChildren: () => import('./features/users/routes'),
      },
      {
        path: 'calendar',
        title: 'calendar',
        data: { breadcrumb: 'navigation.calendar', preload: true },
        loadChildren: () => import('./features/calendar/routes'),
      },
      {
        path: 'kanban',
        title: 'kanban',
        data: { breadcrumb: 'navigation.kanban' },
        loadChildren: () => import('./features/kanban/routes'),
      },
      {
        path: 'file-manager',
        title: 'fileManager',
        data: { breadcrumb: 'navigation.fileManager' },
        loadChildren: () => import('./features/file-manager/routes'),
      },
      {
        path: 'settings',
        title: 'settings',
        data: { breadcrumb: 'navigation.settings', preload: true },
        loadChildren: () => import('./features/settings/routes'),
      },
      {
        path: 'assistant',
        title: 'aiAssistant',
        data: { breadcrumb: 'navigation.aiAssistant', preload: true },
        loadChildren: () => import('./features/ai-assistant/routes'),
      },
      {
        path: 'my-leave',
        title: 'myLeave',
        data: { breadcrumb: 'navigation.myLeave' },
        loadComponent: () => import('./features/leave/my-leave/my-leave').then(m => m.MyLeave),
      },
      {
        path: 'leave-application',
        title: 'leaveApplication',
        data: { breadcrumb: 'navigation.leaveApplication' },
        loadComponent: () => import('./features/leave/leave-application/leave-application').then(m => m.LeaveApplication),
      },
    ],
  },

  {
    path: '',
    component: EmptyLayout,
    loadChildren: () => import('./features/errors/routes'),
  },

  { path: '**', redirectTo: '404-not-found' },
];
