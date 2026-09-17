import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Alerts } from './alerts';

describe('Alerts', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alerts],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lista alertas com severidade textual, ativo e mensagem', () => {
    const fixture = TestBed.createComponent(Alerts);
    fixture.detectChanges();

    httpMock.expectOne('http://localhost:3000/alerts').flush([
      {
        id: 'AL-001',
        assetId: 'WT-001',
        severity: 'CRITICAL',
        type: 'HIGH_TEMPERATURE',
        message: 'Temperatura em nível crítico.',
        timestamp: '2026-09-16T15:00:00.000Z',
      },
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Crítico');
    expect(text).toContain('WT-001');
    expect(text).toContain('Temperatura em nível crítico');
  });

  it('mostra estado vazio quando não há alertas', () => {
    const fixture = TestBed.createComponent(Alerts);
    fixture.detectChanges();

    httpMock.expectOne('http://localhost:3000/alerts').flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Nenhum alerta registrado',
    );
  });

  it('mostra erro (não vazio) quando a API falha', () => {
    const fixture = TestBed.createComponent(Alerts);
    fixture.detectChanges();

    httpMock
      .expectOne('http://localhost:3000/alerts')
      .flush('erro', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Não foi possível carregar os alertas',
    );
  });
});