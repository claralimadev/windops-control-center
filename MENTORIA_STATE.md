# 🧾 MENTORIA_STATE — WindOps Fullstack

## Projeto

- Nome: WindOps Control Center
- Fase: 0 — Auditoria da base (concluída 16/09/2026)
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
- testes: `ng test` (Vitest, 2 specs de fábrica) ✅
- Fase: 3 concluída (scaffold Angular 22 validado) → próxima: Fase 4 (integração /health) 
- Notas: scaffold standalone (sem NgModules), Angular 22, SCSS, rotas via `app.routes.ts`, runner de teste `@angular/build:unit-test`; `.npmrc` com `legacy-peer-deps=true` (mesmo contorno do ADR-001 backend, agora aplicado no web)

## Decisões

- Layout: Opção A — Dashboard operacional (Fase 2, WIREFRAMES.md) — topo: status da API; faixa de KPIs; duas colunas (ativos + alertas recentes). Detalhe do ativo segue o "Detalhe sugerido" do WIREFRAMES.md
- CORS vs proxy: pendente (Fase 4 — explicar antes de optar)
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

### ADR-002 — CORS vs proxy (pendente — Fase 4)
- Problema: —
- Opções: —
- Recomendação: —
- Escolha: —
- Motivo: —
- Trade-off: —
- Reversibilidade: —

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

Fase 1 — Arquitetura fullstack: decidir estrutura de repositório, colocar o pacote de mentoria no local final, ADR inicial.

## Último checkpoint

Fase 0 concluída com evidência real em todos os endpoints do contrato. 5 divergências registradas. Pendente: resposta do aluno ao checkpoint ("qual endpoint usar como primeiro teste de integração — recomendado /health").