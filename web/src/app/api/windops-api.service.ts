import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Health } from './health';

const API_BASE_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class WindOpsApiService {
  constructor(private readonly http: HttpClient) {}

  getHealth(): Observable<Health> {
    return this.http.get<Health>(`${API_BASE_URL}/health`);
  }
}