import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WindOpsApiService } from './api/windops-api.service';
import type { ApiHealthStatus } from './api/health';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected healthStatus = signal<ApiHealthStatus>('checking');

  constructor(private readonly api: WindOpsApiService) {
    this.refreshHealth();
  }

  refreshHealth(): void {
    this.healthStatus.set('checking');
    this.api.getHealth().subscribe({
      next: (health) => {
        this.healthStatus.set(health.status === 'ok' ? 'online' : 'offline');
      },
      error: () => {
        this.healthStatus.set('offline');
      },
    });
  }
}