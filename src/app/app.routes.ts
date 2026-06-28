import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'unary', pathMatch: 'full' },
  {
    path: 'unary',
    loadComponent: () => import('./features/unary/unary-demo.component').then(m => m.UnaryDemoComponent)
  },
  {
    path: 'server-stream',
    loadComponent: () => import('./features/server-stream/server-stream-demo.component').then(m => m.ServerStreamDemoComponent)
  },
  {
    path: 'client-stream',
    loadComponent: () => import('./features/client-stream/client-stream-demo.component').then(m => m.ClientStreamDemoComponent)
  },
  {
    path: 'bidi',
    loadComponent: () => import('./features/bidi-stream/bidi-stream-demo.component').then(m => m.BidiStreamDemoComponent)
  }
];
