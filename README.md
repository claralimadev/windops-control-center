# ⚡ WindOps Control Center — Fullstack

Painel integrado de operação e alertas para ativos de energia renovável (aerogeradores e painéis solares).

**Stack:** Angular 22 (zoneless, signals) · TypeScript · NestJS backend REST · Swagger/OpenAPI · dados em memória.

> Frontend consumindo uma API NestJS real — o desafio #4 da trilha (Angular + NestJS integrados),
> desde o `GET /health` até o painel de KPIs agregados no backend.

---

## ✨ Funcionalidades

| Rota | O que faz |
|---|---|
| `/` | Painel com KPIs agregados (`/dashboard/overview`): ativos totais, online, em atenção, manutenção e alertas críticos |
| `/assets` | Lista de ativos reais vindos da API (`GET /assets`), com estados loading/empty/error |
| `/assets/:id` | Detalhe do ativo: resumo + telemetria carregados **em paralelo** |
| `/assets/:id` | Formulário de telemetria (**Reactive Forms**) → `POST /assets/:id/telemetry`, com refetch automático |
| `/alerts` | Página de alertas (`GET /alerts`) com severidade, ativo, mensagem e horário |

Tratamento de estado completo em toda tela: **loading · success · empty · error** (com "Tentar novamente"). **Erro ≠ vazio**:
falha de rede mostra mensagem de falha; recurso inexistente mostra 404 próprio.

## 🧱 Arquitetura

```text
Angular (porta 4200)                    NestJS (porta 3000)
┌────────────────────┐                 ┌─────────────────────────┐
│ componentes/signals│  HTTP (GET/POST)│  Controller → Service    │
│ service central    │ ───────────────►│  DTO + ValidationPipe    │
│ (windops-api)      │ ◄───────────────│  Regra (75/85 °C) → dado │
└────────────────────┘      JSON        └─────────────────────────┘
```

- **Um único ponto de rede**: `web/src/app/api/windops-api.service.ts` (`baseURL = http://localhost:3000`).
- **Tipos de contrato** espelhando o JSON da API (sem `any`).
- **CORS escopado** no backend para `http://localhost:4200`.

## 🔧 Como rodar

Pré-requisitos: Node.js ≥ 22 e npm.

### 1. Backend (NestJS)

```bash
cd <seu-repo>/windops-api      # ou outro clone do backend
npm install
npm run build
npm run start:prod             # sobe em http://localhost:3000
```

- Swagger: **http://localhost:3000/docs** · spec JSON em `/docs-json`
- Testes: `npm test` (18 testes)

### 2. Frontend (Angular) — este repositório

```bash
cd web
npm install                    # .npmrc já define legacy-peer-deps=true
npm start                      # sobe em http://localhost:4200
```

- Build: `npm run build`
- Testes: `npm test` (15 testes — Vitest via `@angular/build:unit-test`)

> Suba o **backend antes do frontend**. Com o backend desligado, a UI mostra estados de erro
> com "Tentar novamente" (testado no navegador).

## 🧪 Testes

- **Backend (18):** regra de temperatura NORMAL/WARNING/CRITICAL, ativo inexistente, summary, alertas, KPIs agregados.
- **Frontend (15):** pares sucesso/falha (ex.: mostra "Online"… / mostra "Indisponível"…), loading, empty, 404, erro de rede, validação do formulário.

## 📂 Estrutura

```text
web/src/app/
├── api/               # service central + tipos de contrato (health, asset, telemetry, ...)
├── assets/            # lista /assets (cards são links)
├── asset-detail/      # detalhe + formulário de telemetria (paralelo summary+telemetry)
├── dashboard/         # painel de KPIs (GET /dashboard/overview)
├── alerts/            # página /alerts
└── app.{ts,html}      # shell + navegação (Painel / Ativos / Alertas)
```

## 📦 Pacote de mentoria

Este repositório também contém o "mentor pack" da trilha: `AGENTS.md`,
`FULLSTACK_MENTOR_PROTOCOL.md`, `DESAFIO_04_WINDOPS_CONTROL_CENTER_FULLSTACK.md`,
`API_CONTRACT.md`, `WIREFRAMES.md`, `MENTORIA_STATE.md` (histórico de decisões, ADRs e evidências) e `prompts/`.