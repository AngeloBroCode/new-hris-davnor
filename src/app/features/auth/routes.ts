import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { noAuthGuard } from '@core/guards/no-auth-guard';

export default [
  {
    path: 'login',
    title: 'login',
    canActivate: [noAuthGuard],
    providers: [provideTranslocoScope('auth')],
    loadComponent: () => import('./login/login'),
  },
  {
    path: 'signup',
    title: 'signup',
    canActivate: [noAuthGuard],
    providers: [provideTranslocoScope('auth')],
    loadComponent: () => import('./signup/signup'),
  },
  {
    path: 'reset-password',
    title: 'resetPassword',
    providers: [provideTranslocoScope('auth')],
    loadComponent: () => import('./reset-password/reset-password'),
  },
  {
    path: 'two-step-verification',
    title: 'twoStepVerification',
    providers: [provideTranslocoScope('auth')],
    loadComponent: () => import('./two-step-verification/two-step-verification'),
  },
] as Routes;
