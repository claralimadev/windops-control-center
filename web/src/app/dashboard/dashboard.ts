import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WindOpsApiService } from '../api/windops-api.service';
import type { DashboardOverview } from '../api/dashboard-overview';

type DashboardState =
  | { status: 'loading' }
  | { status: 'success'; overview: DashboardOverview }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly state = signal<DashboardState>({ status: 'loading' });

  constructor(private readonly api: WindOpsApiService) {
    this.load();
  }

  load(): void {
    this.state.set({ status: 'loading' });
    this.api.getDashboardOverview().subscribe({
      next: (overview) => this.state.set({ status: 'success', overview }),
      error: () =>
        this.state.set({
          status: 'error',
          message: 'Não foi possível carregar os indicadores.',
        }),
    });
  }
}