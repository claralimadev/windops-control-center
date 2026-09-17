# ⚡ WindOps Control Center — Fullstack Mentor Pack

## Objetivo

Construir o primeiro projeto **Angular + NestJS integrado** da trilha usando OpenCode/Antigravity como tutor.

## Arquivos

- `AGENTS.md`
- `FULLSTACK_MENTOR_PROTOCOL.md`
- `DESAFIO_04_WINDOPS_CONTROL_CENTER_FULLSTACK.md`
- `API_CONTRACT.md`
- `WIREFRAMES.md`
- `MENTORIA_STATE.md`
- `prompts/`

## Como usar

1. Coloque este pacote na raiz do workspace.
2. Coloque ou referencie o backend WindOps anterior.
3. Abra o workspace no OpenCode/Antigravity.
4. Cole `prompts/00_INICIAR_FULLSTACK.md`.
5. O tutor deve auditar o backend antes de criar Angular.
6. Escolha wireframe antes do layout.
7. Integre uma feature por vez.
8. Valide com Network.

## Progressão

```text
Angular
→ Angular + API pública
→ NestJS API
→ Angular + NestJS
→ agentes próprios
→ simulação de squad
```

## Execução do projeto

### Backend (NestJS) — repo `windops-api/api`
```bash
cd ~/IdeaProjects/windops-api/api
npm install
npm run build
npm run start:prod        # ou: node dist/main
# API:     http://localhost:3000
# Swagger: http://localhost:3000/docs
# testes:  npm test
```

### Frontend (Angular 22) — pasta `web/`
```bash
cd web
npm install               # .npmrc já define legacy-peer-deps=true
npm start                 # http://localhost:4200
npm run build
npm test
```

### Integração
- Suba o **backend antes** do web.
- Base URL `http://localhost:3000` centralizada em `web/src/app/api/windops-api.service.ts`.
- CORS escopado para `http://localhost:4200` em `windops-api/api/src/main.ts`.

### Endpoints consumidos
`GET /health`, `GET /assets`, `GET /assets/:id`, `GET /assets/:id/telemetry`,
`GET /assets/:id/summary`, `POST /assets/:id/telemetry`, `GET /alerts`,
`GET /dashboard/overview`.

## Regra central

```text
contrato
→ endpoint validado
→ tipo frontend
→ service
→ estado
→ UI
→ Network
→ edge case
```
