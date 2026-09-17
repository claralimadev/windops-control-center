import { Component, signal } from '@angular/core';
import { WindOpsApiService } from '../api/windops-api.service';
import { ASSET_STATUS_LABEL, ASSET_TYPE_LABEL } from '../api/asset';
import type { Asset } from '../api/asset';

type AssetsState =
  | { status: 'loading' }
  | { status: 'success'; assets: Asset[] }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-assets',
  templateUrl: './assets.html',
  styleUrl: './assets.scss',
})
export class Assets {
  protected readonly state = signal<AssetsState>({ status: 'loading' });
  protected readonly statusLabel = ASSET_STATUS_LABEL;
  protected readonly typeLabel = ASSET_TYPE_LABEL;

  constructor(private readonly api: WindOpsApiService) {
    this.load();
  }

  load(): void {
    this.state.set({ status: 'loading' });
    this.api.getAssets().subscribe({
      next: (assets) => this.state.set({ status: 'success', assets }),
      error: () =>
        this.state.set({
          status: 'error',
          message: 'Não foi possível carregar os ativos.',
        }),
    });
  }
}