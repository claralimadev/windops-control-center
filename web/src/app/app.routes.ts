import { Routes } from '@angular/router';
import { Assets } from './assets/assets';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'assets' },
  { path: 'assets', component: Assets },
];