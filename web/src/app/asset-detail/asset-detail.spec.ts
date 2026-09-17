import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AssetDetail } from './asset-detail';
import type { Asset } from '../api/asset';

const WIND_TURBINE: Asset = {
  id: 'WT-001',
  name: 'Aerogerador 01',
  type: 'WIND_TURBINE',
  status: 'ONLINE',
  ratedPowerMw: 3.2,
  location: 'Parque Demo A',
};

describe('AssetDetail', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'assets/:id', component: AssetDetail }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mostra "Ativo não encontrado" quando o backend responde 404', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/assets/XYZ', AssetDetail);

    httpMock
      .expectOne('http://localhost:3000/assets/XYZ')
      .flush('not found', { status: 404, statusText: 'Not Found' });
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain(
      'Ativo não encontrado',
    );
  });

  it('carrega ativo e, em paralelo, summary + telemetria', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/assets/WT-001', AssetDetail);

    httpMock.expectOne('http://localhost:3000/assets/WT-001').flush(WIND_TURBINE);
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('WT-001 — Aerogerador 01');

    httpMock.expectOne('http://localhost:3000/assets/WT-001/summary').flush({
      assetId: 'WT-001',
      samples: 1,
      averagePowerMw: 2.8,
      maxTemperatureC: 90,
      warningAlerts: 0,
      criticalAlerts: 1,
    });
    httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry').flush([
      {
        assetId: 'WT-001',
        powerMw: 2.8,
        windSpeedMs: 10.2,
        temperatureC: 90,
        timestamp: '2026-09-16T12:00:00.000Z',
      },
    ]);
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Resumo');
    expect(text).toContain('90 °C');
  });

  it('envia leitura e, no sucesso, recarrega o resumo (CRITICAL vira alerta)', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/assets/WT-001', AssetDetail);

    httpMock.expectOne('http://localhost:3000/assets/WT-001').flush(WIND_TURBINE);
    httpMock
      .expectOne('http://localhost:3000/assets/WT-001/summary')
      .flush({
        assetId: 'WT-001',
        samples: 0,
        averagePowerMw: null,
        maxTemperatureC: null,
        warningAlerts: 0,
        criticalAlerts: 0,
      });
    httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry').flush([]);
    harness.detectChanges();

    component.form.setValue({
      powerMw: 2.5,
      windSpeedMs: null,
      temperatureC: 90,
      timestamp: '2026-09-16T12:00',
    });
    component.submit();

    const post = httpMock.expectOne({
      method: 'POST',
      url: 'http://localhost:3000/assets/WT-001/telemetry',
    });
    expect(post.request.body.temperatureC).toBe(90);
    post.flush({
      telemetry: {
        assetId: 'WT-001',
        powerMw: 2.5,
        temperatureC: 90,
        timestamp: '2026-09-16T15:00:00.000Z',
      },
      alert: {
        id: 'AL-001',
        assetId: 'WT-001',
        severity: 'CRITICAL',
        type: 'HIGH_TEMPERATURE',
        message: 'Temperatura em nível crítico.',
        timestamp: '2026-09-16T15:00:00.000Z',
      },
    });

    httpMock
      .expectOne('http://localhost:3000/assets/WT-001/summary')
      .flush({
        assetId: 'WT-001',
        samples: 1,
        averagePowerMw: 2.5,
        maxTemperatureC: 90,
        warningAlerts: 0,
        criticalAlerts: 1,
      });
    httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry').flush([
      {
        assetId: 'WT-001',
        powerMw: 2.5,
        temperatureC: 90,
        timestamp: '2026-09-16T15:00:00.000Z',
      },
    ]);
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Temperatura em nível crítico');
  });

  it('mostra erro de validação quando o backend responde 400', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/assets/WT-001', AssetDetail);

    httpMock.expectOne('http://localhost:3000/assets/WT-001').flush(WIND_TURBINE);
    httpMock
      .expectOne('http://localhost:3000/assets/WT-001/summary')
      .flush({
        assetId: 'WT-001',
        samples: 0,
        averagePowerMw: null,
        maxTemperatureC: null,
        warningAlerts: 0,
        criticalAlerts: 0,
      });
    httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry').flush([]);
    harness.detectChanges();

    component.form.setValue({
      powerMw: 2.5,
      windSpeedMs: null,
      temperatureC: 70,
      timestamp: 'nao-e-uma-data',
    });
    component.submit();

    httpMock
      .expectOne({
        method: 'POST',
        url: 'http://localhost:3000/assets/WT-001/telemetry',
      })
      .flush({ message: 'bad' }, { status: 400, statusText: 'Bad Request' });
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Dados inválidos');
  });
});