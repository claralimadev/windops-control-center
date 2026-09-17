import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Assets } from './assets';
import type { Asset } from '../api/asset';

const WIND_TURBINE: Asset = {
  id: 'WT-001',
  name: 'Aerogerador 01',
  type: 'WIND_TURBINE',
  status: 'ONLINE',
  ratedPowerMw: 3.2,
  location: 'Parque Demo A',
};

function textOf(fixture: { nativeElement: HTMLElement }): string {
  return (fixture.nativeElement.textContent ?? '') as string;
}

describe('Assets', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Assets],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mostra "Carregando" e depois os ativos', () => {
    const fixture = TestBed.createComponent(Assets);
    fixture.detectChanges();
    expect(textOf(fixture)).toContain('Carregando');

    httpMock.expectOne('http://localhost:3000/assets').flush([WIND_TURBINE]);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('WT-001');
    expect(textOf(fixture)).toContain('Operando');
  });

  it('mostra estado vazio quando a API responde []', () => {
    const fixture = TestBed.createComponent(Assets);
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/assets').flush([]);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Nenhum ativo');
  });

  it('mostra erro (não vazio) quando a API falha', () => {
    const fixture = TestBed.createComponent(Assets);
    fixture.detectChanges();
    httpMock
      .expectOne('http://localhost:3000/assets')
      .flush('erro', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Não foi possível carregar');
    expect(textOf(fixture)).not.toContain('Nenhum ativo');
  });
});