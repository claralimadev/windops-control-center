import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Assets } from './assets/assets';
import { AssetDetail } from './asset-detail/asset-detail';

export const routes: Routes = [
  { path: '', component: Dashboard, pathMatch: 'full' },
  { path: 'assets', component: Assets },
  { path: 'assets/:id', component: AssetDetail },
];