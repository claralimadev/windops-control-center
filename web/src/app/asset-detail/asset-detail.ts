import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { WindOpsApiService } from '../api/windops-api.service';
import { ASSET_STATUS_LABEL, ASSET_TYPE_LABEL } from '../api/asset';
import type { Asset } from '../api/asset';
import type { AssetSummary } from '../api/asset-summary';
import type { Telemetry } from '../api/telemetry';

type AssetState =
  | { status: 'loading' }
  | { status: 'notfound' }
  | { status: 'error' }
  | { status: 'success'; asset: Asset };

type ExtrasState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; summary: AssetSummary; telemetry: Telemetry[] };

@Component({
  selector: 'app-asset-detail',
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.scss',
})
export class AssetDetail {
  protected readonly assetState = signal<AssetState>({ status: 'loading' });
  protected readonly extrasState = signal<ExtrasState>({ status: 'idle' });
  protected readonly statusLabel = ASSET_STATUS_LABEL;
  protected readonly typeLabel = ASSET_TYPE_LABEL;

  private assetId = '';

  constructor(
    private readonly api: WindOpsApiService,
    private readonly route: ActivatedRoute,
  ) {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.assetId = params.get('id') ?? '';
      this.loadAsset();
    });
  }

  loadAsset(): void {
    this.assetState.set({ status: 'loading' });
    this.extrasState.set({ status: 'idle' });
    this.api.getAsset(this.assetId).subscribe({
      next: (asset) => {
        this.assetState.set({ status: 'success', asset });
        this.loadExtras();
      },
      error: (err: { status?: number }) => {
        this.assetState.set(
          err.status === 404 ? { status: 'notfound' } : { status: 'error' },
        );
      },
    });
  }

  loadExtras(): void {
    this.extrasState.set({ status: 'loading' });
    forkJoin({
      summary: this.api.getSummary(this.assetId),
      telemetry: this.api.getTelemetry(this.assetId),
    }).subscribe({
      next: ({ summary, telemetry }) =>
        this.extrasState.set({ status: 'success', summary, telemetry }),
      error: () => this.extrasState.set({ status: 'error' }),
    });
  }
}