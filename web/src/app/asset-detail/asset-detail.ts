import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WindOpsApiService } from '../api/windops-api.service';
import { ASSET_STATUS_LABEL, ASSET_TYPE_LABEL } from '../api/asset';
import { ALERT_SEVERITY_LABEL } from '../api/alert';
import type { Asset } from '../api/asset';
import type { AssetSummary } from '../api/asset-summary';
import type { Telemetry } from '../api/telemetry';
import type { Alert } from '../api/alert';

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

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; alert?: Alert }
  | {
      status: 'error';
      kind: 'validation' | 'notfound' | 'network';
      message: string;
    };

@Component({
  selector: 'app-asset-detail',
  imports: [RouterLink, DecimalPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.scss',
})
export class AssetDetail {
  protected readonly assetState = signal<AssetState>({ status: 'loading' });
  protected readonly extrasState = signal<ExtrasState>({ status: 'idle' });
  protected readonly submitState = signal<SubmitState>({ status: 'idle' });
  protected readonly statusLabel = ASSET_STATUS_LABEL;
  protected readonly typeLabel = ASSET_TYPE_LABEL;
  protected readonly severityLabel = ALERT_SEVERITY_LABEL;

  readonly form;

  private assetId = '';

  constructor(
    private readonly api: WindOpsApiService,
    private readonly route: ActivatedRoute,
    fb: FormBuilder,
  ) {
    this.form = fb.group({
      powerMw: [0, [Validators.required, Validators.min(0)]],
      windSpeedMs: [null as number | null],
      temperatureC: [0, [Validators.required]],
      timestamp: [this.nowLocal(), [Validators.required]],
    });

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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const date = new Date(value.timestamp ?? '');
    const payload = {
      powerMw: value.powerMw ?? 0,
      temperatureC: value.temperatureC ?? 0,
      timestamp: Number.isNaN(date.getTime()) ? '' : date.toISOString(),
      ...(value.windSpeedMs !== null && value.windSpeedMs !== undefined
        ? { windSpeedMs: value.windSpeedMs }
        : {}),
    };

    this.submitState.set({ status: 'submitting' });
    this.api.createTelemetry(this.assetId, payload).subscribe({
      next: (created) => {
        this.submitState.set({ status: 'success', alert: created.alert });
        this.form.reset({
          powerMw: 0,
          windSpeedMs: null,
          temperatureC: 0,
          timestamp: this.nowLocal(),
        });
        this.loadExtras();
      },
      error: (err: { status?: number }) => {
        if (err.status === 400) {
          this.submitState.set({
            status: 'error',
            kind: 'validation',
            message: 'Dados inválidos. Confira os campos e tente de novo.',
          });
        } else if (err.status === 404) {
          this.submitState.set({
            status: 'error',
            kind: 'notfound',
            message: 'Ativo não encontrado.',
          });
        } else {
          this.submitState.set({
            status: 'error',
            kind: 'network',
            message: 'Não foi possível enviar a leitura. A API está no ar?',
          });
        }
      },
    });
  }

  private nowLocal(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
}