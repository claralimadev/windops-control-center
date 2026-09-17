import { Routes } from '@angular/router';
import { Assets } from './assets/assets';
import { AssetDetail } from './asset-detail/asset-detail';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'assets' },
  { path: 'assets', component: Assets },
  { path: 'assets/:id', component: AssetDetail },
];