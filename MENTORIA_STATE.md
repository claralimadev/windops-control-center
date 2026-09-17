# 🧾 MENTORIA_STATE — WindOps Fullstack

## Projeto

- Nome: WindOps Control Center
- Fase: 10 — página de alertas concluída (16/09/2026) → próxima: fechamento (fases 11–16)
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
- testes: `ng test` (Vitest, 15 testes passando) ✅
- Fase: 9 concluída (formulário de telemetria + refetch) → próxima: Fase 10 (alertas)
- Notas: scaffold standalone (sem NgModules), Angular 22, SCSS, rotas via `app.routes.ts`, runner de teste `@angular/build:unit-test`; `.npmrc` com `legacy-peer-deps=true` (mesmo contorno do ADR-001 backend, agora aplicado no web); para o Angular 22 reatividade por Signals (sem zone.js); URL base `http://localhost:3000` centralizada em `WindOpsApiService`

## Decisões

- Layout: Opção A — Dashboard operacional (Fase 2, WIREFRAMES.md) — topo: status da API; faixa de KPIs; duas colunas (ativos + alertas recentes). Detalhe do ativo segue o "Detalhe sugerido" do WIREFRAMES.md
- CORS vs proxy: **definido** — CORS escopado no backend (ADR-002)
- Base URL: definido — `http://localhost:3000` centralizada em `WindOpsApiService`
- Reatividade: definido — HttpClient/RxJS para rede + Signals para estado local/derivado
- Agregação KPIs: **definido** — Opção B: backend entrega `/dashboard/overview` (ADR-003)
- Estratégia refresh após POST: **definido** — refetch de summary + telemetria (backend como fonte da verdade)
- Estrutura de tipos: em andamento — um arquivo por contrato em `web/src/app/api/`

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

### ADR-003 — Onde agregar os KPIs do dashboard
- Problema: KPIs (total/online/atenção/críticos) podem ser calculados no front (A) ou entregues por um endpoint agregado no backend (B)
- Opções: A) front chama `/assets` + `/alerts` e deriva; B) backend entrega `GET /dashboard/overview`
- Recomendação: B
- Escolha: B — `DashboardModule` (importa `AssetsModule`, usa `AssetsService` + `TelemetryService`)
- Motivo: KPI é regra de negócio agregada; fonte única de verdade; 1 request; reutilizável por qualquer cliente; front magro
- Trade-off: cria endpoint novo no repo do backend; mais um contrato para manter; decisão do aluno ("decide você") — critério, alternativa descartada e reversibilidade registrados
- Reversibilidade: alta (remover endpoint e voltar a calcular no front)
- Status: decidido 16/09/2026; backend validado por curl (KPI mudou 0→1/0→2 após gerar alertas)

## Divergências auditoria Fase 0 (contrato x backend real)

| # | Ponto | API_CONTRACT.md | Backend real | Severidade |
|---|-------|-----------------|--------------|------------|
| 1 | POST /assets/:id/telemetry — shape da resposta | `{ telemetry, classification, alertCreated }` | `{ telemetry, alert? }` (alert ausente quando NORMAL) | ✅ resolvido — front adapta-se ao backend real (Fase 9) |
| 2 | Summary sem amostras | apenas números | `averagePowerMw: null`, `maxTemperatureC: null` | 🟠 Média |
| 3 | windSpeedMs no body | presente no exemplo | `@IsOptional` (opcional) | 🟡 Baixa |
| 4 | GET /dashboard/overview | opcional | não existia | ✅ resolvido — implementado (ADR-003) |
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

### Frontend (Fase 7 — detalhe do ativo)
- rota `/assets/:id` com leitura de param via `route.paramMap` (suporta troca de ativo sem recriar componente) ✅
- fluxo Opção B: `getAsset` primeiro (404 → "Ativo não encontrado") → `forkJoin(summary, telemetry)` em paralelo ✅
- tipos com `number | null` (averagePowerMw/maxTemperatureC) e tratamento "—" ✅
- browser: detalhe WT-001 (amostras 0, null → "—", telemetria vazia) ✅; `/assets/XYZ` → "Ativo não encontrado" ✅
- Network: /assets/WT-001 → 200; /summary + /telemetry em paralelo → 200 ✅
- cards da lista agora são `<a routerLink>` (acessíveis) ✅
- testes: 8 passando ✅

### Frontend (Fase 8 — painel de KPIs)
- decisão ADR-003: Opção B — backend entrega `/dashboard/overview`; KPI é regra de negócio agregada (fonte única de verdade) ✅
- `getDashboardOverview()` no único service; tipo `DashboardOverview` ✅
- home `''` → componente `Dashboard` (1 request, faixa de 6 KPIs, loading/error com retry) ✅
- browser: home mostra "Painel operacional" com `3 · 2 · 0 · 1 · 1 · 2` ✅
- Network: `GET /dashboard/overview → 200` na home ✅
- bug corrigido: `RouterLinkActive` não estava importado no `App` (o `routerLinkActive="active"` era ignorado silenciosamente) ✅
- testes: 10 passando ✅

### Frontend (Fase 9 — formulário de telemetria)
- decisão: front adapta-se ao shape real do backend `{ telemetry, alert? }` (não alterar backend estável) — divergência #1 ✅
- decisão: pós-sucesso faz **refetch** de summary + telemetria (backend é a verdade) ✅
- Reactive Forms (`powerMw`, `windSpeedMs` opcional, `temperatureC`, `timestamp` datetime-local) ✅
- estados `idle/submitting/success/error` distinguindo 400 (validação), 404 (não encontrado) e rede ✅
- browser: `temperatureC=90` → verde "Alerta Crítico: Temperatura em nível crítico", Resumo atualiza ✅
- Network: POST /telemetry 201 → GET /summary + GET /telemetry 200 (refetch) ✅
- validação de front barra `powerMw=-1` antes de sair request (min(0)) ✅
- testes: 12 passando ✅

### Frontend (Fase 10 — alertas)
- `getAlerts()` p/ `GET /alerts`; componente `Alerts` em `/alerts` + link no nav e no painel ✅
- severidade **textual** (Atenção/Crítico) além de cor; ativo, mensagem e horário ✅
- estados loading/success/empty/error ✅
- browser: lista com Atenção (WT-001) e Crítico (PV-001/WT-001); Network `GET /alerts → 200` ✅
- testes: 15 passando ✅

### Backend (Fase 8 — endpoint agregado, 16/09/2026)
- GET /dashboard/overview → 200 `{totalAssets:3, onlineAssets:2, attentionAssets:0, maintenanceAssets:1, criticalAlerts:0, totalAlerts:0}` (estado limpo) ✅
- após POST WARNING (WT-001, 80) + POST CRITICAL (PV-001, 90): criticalAlerts 0→1, totalAlerts 0→2 ✅ (KPI calculado de verdade)
- rota mapeada no boot: `Mapped {/dashboard/overview, GET}` ✅

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

Fechamento (fases 11–16): revisão de estado (11), erros fullstack (12), acessibilidade (13), testes (14), auditoria Network (15) e explicação final (16).

## Último checkpoint

Fase 10 concluída e validada no browser (lista de alertas com severidade textual, GET /alerts 200). 15 testes passando. Pendente: commit da Fase 10 e fechamento.