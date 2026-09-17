import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { App } from './app';

function textOf(fixture: { nativeElement: HTMLElement }): string {
  return (fixture.nativeElement.textContent ?? '') as string;
}

describe('App — indicador de saúde da API', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('começa em "Verificando" enquanto o GET /health está em voo', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(textOf(fixture)).toContain('Verificando');
    httpMock
      .expectOne('http://localhost:3000/health')
      .flush({ status: 'ok' });
  });

  it('mostra "Online" quando a API responde ok', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/health');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'ok' });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Online');
    expect(textOf(fixture)).not.toContain('Indisponível');
  });

  it('mostra "Indisponível" quando a API falha (erro não é vazio)', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/health');
    req.flush('erro', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Indisponível');
  });
});