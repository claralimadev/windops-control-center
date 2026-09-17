import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Health } from './health';
import type { Asset } from './asset';
import type { Telemetry } from './telemetry';
import type { AssetSummary } from './asset-summary';

const API_BASE_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class WindOpsApiService {
  constructor(private readonly http: HttpClient) {}

  getHealth(): Observable<Health> {
    return this.http.get<Health>(`${API_BASE_URL}/health`);
  }

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${API_BASE_URL}/assets`);
  }

  getAsset(id: string): Observable<Asset> {
    return this.http.get<Asset>(`${API_BASE_URL}/assets/${encodeURIComponent(id)}`);
  }

  getTelemetry(id: string): Observable<Telemetry[]> {
    return this.http.get<Telemetry[]>(
      `${API_BASE_URL}/assets/${encodeURIComponent(id)}/telemetry`,
    );
  }

  getSummary(id: string): Observable<AssetSummary> {
    return this.http.get<AssetSummary>(
      `${API_BASE_URL}/assets/${encodeURIComponent(id)}/summary`,
    );
  }
}