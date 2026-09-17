# 🧾 MENTORIA_STATE — WindOps Fullstack

## Projeto

- Nome: WindOps Control Center
- Fase: 4 — integração /health concluída (16/09/2026) → próxima: Fase 5/6 — assets
- Nível do aluno: A — Iniciante em integração fullstack (fez Desafio 3 completo)
- Estrutura repo: Opção B — backend `windops-api` fica onde está; workspace fullstack novo `windops-control-center` (ADR-001). Workspace novo contém o pacote de mentoria + futura pasta `web/`
- Tutor: OpenCode / Antigravity
- Nota: para este workspace ser governado pelo AGENTS.md fullstack, abrir o OpenCode a partir de `~/IdeaProjects/windops-control-center`

## Ambiente

### Backend
- diretório: `/home/usuario/IdeaProjects/windops-api/api`
- porta: 3000 (padrão)
- build: `dist/` atualizado e compatível com o fonte ✅
- Swagger: `/docs` retorna 200 ✅
- health: `GET /health` → 200 `{"status":"ok"}` ✅

### Frontend
- diretório: `web/` em `/home/usuario/IdeaProjects/windops-control-center`
- porta: 4200 (padrão ng serve)
- build: `ng build` ok ✅
- testes: `ng test` (Vitest, 3 specs passando — checking/online/offline do health) ✅
- Fase: 4 concluída (CORS escopado + WindOpsApiService com getHealth + indicador API Online/Indisponível) → próxima: Fase 5/6 (assets)
- Notas: scaffold standalone (sem NgModules), Angular 22, SCSS, rotas via `app.routes.ts`, runner de teste `@angular/build:unit-test`; `.npmrc` com `legacy-peer-deps=true` (mesmo contorno do ADR-001 backend, agora aplicado no web); para o Angular 22 reatividade por Signals (sem zone.js); URL base `http://localhost:3000` centralizada em `WindOpsApiService`

## Decisões

- Layout: Opção A — Dashboard operacional (Fase 2, WIREFRAMES.md) — topo: status da API; faixa de KPIs; duas colunas (ativos + alertas recentes). Detalhe do ativo segue o "Detalhe sugerido" do WIREFRAMES.md
- CORS vs proxy: **definido** — CORS escopado no backend (ADR-002)
- Base URL: pendente (Fase 4)
- Reatividade: pendente (Fase 5 — HttpClient/RxJS, Signals se simplificar)
- Agregação KPIs: pendente (Fase 8 — `/dashboard/overview` NÃO existe no backend)
- Estratégia refresh após POST: pendente (Fase 9)
- Estrutura de tipos: pendente

## ADRs

### ADR-001 — Estrutura do repositório
- Problema: onde colocar o frontend (Angular) novo e o pacote de mentoria sem quebrar o backend já estável
- Opções: A) repositório único `windops/` com `api/` + `web/`; B) manter `windops-api` (repo próprio) + criar `windops-control-center` com web + pacote de mentoria
- Recomendação: B
- Escolha: B
- Motivo: backend já tem `.git` próprio e está estável; o Desafio 04 explícita "não migrar só por estética"; isolamento do aprendizado em frontend/integração
- Trade-off: dois locais físicos; iniciar backend a partir da pasta antiga e web a partir da nova
- Reversibilidade: alta (é só reorganizar pastas, nenhum código muda)
- Status: decidido em 16/09/2026

### ADR-002 — CORS vs proxy
- Problema: Angular (origin `http://localhost:4200`) precisa ler respostas do NestJS (origin `http://localhost:3000`); browser bloqueia por padrão
- Opções: A) `enableCors` escopado no backend; B) proxy de desenvolvimento no Angular
- Recomendação: A
- Escolha: A — `app.enableCors({ origin: ['http://localhost:4200'] })` no `main.ts`
- Motivo: aprendizado real do mecanismo de origem/CORS (objetivo da Fase 4); é o comportamento de produção; evita camada que esconde o conceito; `*` rejeitado
- Trade-off: toca o backend (2 linhas, reversível); origins precisarão de manutenção se a porta/painel mudar
- Reversibilidade: alta (remover 2 linhas)
- Status: decidido 16/09/2026; validado por curl (Allow-Origin + preflight OPTIONS 204)

## Divergências auditoria Fase 0 (contrato x backend real)

| # | Ponto | API_CONTRACT.md | Backend real | Severidade |
|---|-------|-----------------|--------------|------------|
| 1 | POST /assets/:id/telemetry — shape da resposta | `{ telemetry, classification, alertCreated }` | `{ telemetry, alert? }` (alert ausente quando NORMAL) | 🔴 Alta |
| 2 | Summary sem amostras | apenas números | `averagePowerMw: null`, `maxTemperatureC: null` | 🟠 Média |
| 3 | windSpeedMs no body | presente no exemplo | `@IsOptional` (opcional) | 🟡 Baixa |
| 4 | GET /dashboard/overview | opcional | não existe | 🟡 Baixa (decisão Fase 8) |
| 5 | CORS | — | não habilitado no main.ts | 🟠 Média (Fase 4) |

Obs.: `averagePowerMw` pode vir com precisão de ponto flutuante (ex.: 2.8000000000000003) — formatar na UI.
Obs. 2: divergência #1 é decisão deliberada do Desafio 3 (`{ telemetry, alert? }`). Registrada; decisão se adaptar backend ou aceitar contrato novo fica na Fase 9 (formulário de telemetria).

## Evidências

### Frontend (Fase 4 — saúde da API)
- getHealth p/ `GET /health` via `WindOpsApiService` ✅
- CORS escopado `Origin: http://localhost:4200` validado com curl (Allow-Origin + preflight OPTIONS 204) ✅
- ng build ✅ | ng test 3 specs ✅
- Browser: indicador Online (verde) → API derrubada por kill no processo → Indisponível (vermelho) → API religada → Online ✅
- Network: GET /health 200 (e 304 em reload com cache válido — esperado) ✅
- Observado na prática: PID muda a cada start; identificado com `ss -tlnp` e encerrado com `kill`

### Frontend (Fase 6 — lista de ativos)
- rotas: `'' → redirect /assets`; `/assets → Assets` ✅
- getAssets p/ `GET /assets` ✅
- estados loading/success/empty/error no componente (empty derivado de success; erro separado) ✅
- browser: 3 cartões (WT-001 Operando, WT-002 Manutenção, PV-001 Operando) com tipo/local/potência ✅
- Network: GET /assets 200 ✅
- testes: 6 passando (health 3 + assets 3) ✅

### Backend (Fase 0 — via curl em 16/09/2026)
- health: GET /health → 200 `{"status":"ok"}` ✅
- assets: GET /assets → 200, 3 ativos (WT-001, WT-002, PV-001) ✅
- por id: GET /assets/WT-001 → 200 ✅
- 404: GET /assets/XYZ → 404 `Asset XYZ não encontrado` ✅
- 404 POST: POST /assets/XYZ/telemetry → 404 ✅
- 400: POST body `powerMw: "muito"` → 400 Bad Request ✅
- telemetry: GET /assets/WT-001/telemetry → 200 `[]` (início) / GET /assets/PV-001/telemetry → 200 `[]` ✅
- POST 70 (NORMAL): 201 `{ telemetry }`, sem alerta ✅
- POST 80 (WARNING): 201 `{ telemetry, alert AL-001 }` ✅
- POST 90 (CRITICAL): 201 `{ telemetry, alert AL-002 }` ✅
- alerts: GET /alerts → 200 lista com AL-001 WARNING e AL-002 CRITICAL após POSTs ✅
- summary com dados: `{samples:3, averagePowerMw:2.8000000000000003, maxTemperatureC:90, warningAlerts:1, criticalAlerts:1}` ✅
- summary sem dados: GET /assets/PV-001/summary → `{samples:0, averagePowerMw:null, maxTemperatureC:null, warningAlerts:0, criticalAlerts:0}` ✅ (divergência #2)
- summary 404: GET /assets/XYZ/summary → 404 ✅
- Swagger: GET /docs → 200 ✅

## Bugs conhecidos

- Nenhum. Dados em memória: reiniciar o servidor zera telemetria/alertas (esperado no Desafio 3).

## Dívidas técnicas

- Backend em memória (sem persistência). Bônus: Prisma/PostgreSQL.
- `legacy-peer-deps=true` no .npmrc do backend (contorno registrado no Desafio 3).

## Próximo passo

Fase 7 — detalhe do ativo (`/assets/:id`) com asset + summary + telemetria; decidir paralelo/sequencial e falha parcial. Fase 8 — decisão de agregação dos KPIs.

## Último checkpoint

Fase 6 concluída: lista de ativos real renderizada no browser, GET /assets 200, 6 testes passando. Sem bugs abertos.