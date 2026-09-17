import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mostra os KPIs retornados pelo endpoint agregado', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    httpMock.expectOne('http://localhost:3000/dashboard/overview').flush({
      totalAssets: 3,
      onlineAssets: 2,
      attentionAssets: 0,
      maintenanceAssets: 1,
      criticalAlerts: 1,
      totalAlerts: 2,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Alertas críticos');
    expect(text).toContain('1');
    expect(text).not.toContain('Erro');
  });

  it('mostra erro (não zero) quando o endpoint falha', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    httpMock
      .expectOne('http://localhost:3000/dashboard/overview')
      .flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Não foi possível carregar os indicadores');
  });
});