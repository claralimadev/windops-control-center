import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WindOpsApiService } from '../api/windops-api.service';
import { ALERT_SEVERITY_LABEL } from '../api/alert';
import type { Alert } from '../api/alert';

type AlertsState =
  | { status: 'loading' }
  | { status: 'success'; alerts: Alert[] }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-alerts',
  imports: [DatePipe],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class Alerts {
  protected readonly state = signal<AlertsState>({ status: 'loading' });
  protected readonly severityLabel = ALERT_SEVERITY_LABEL;

  constructor(private readonly api: WindOpsApiService) {
    this.load();
  }

  load(): void {
    this.state.set({ status: 'loading' });
    this.api.getAlerts().subscribe({
      next: (alerts) => this.state.set({ status: 'success', alerts }),
      error: () =>
        this.state.set({
          status: 'error',
          message: 'Não foi possível carregar os alertas.',
        }),
    });
  }
}