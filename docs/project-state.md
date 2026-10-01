# PortfolioPilot — Project State

Single source of truth for progress. Update at the end of every milestone with **actual** results.

- **Last updated:** 2026-10-01
- **Last completed milestone:** 05 — Start PostgreSQL and Redis locally (implementation complete; Docker smoke test blocked)
- **Next milestone:** 06 — Create the Prisma schema and deterministic seed
- **Deployment status:** not deployed; no cloud resources exist.

## Milestone status

| # | Milestone | Status | Notes |
| --- | --- | --- | --- |
| 00 | Project contract and plan | Done | Documentation only |
| 01 | Verify versions and prerequisites | Done | Stable version matrix and local metadata in `docs/versions.md`; installation unverified because Node/npm are inactive and registry access fails locally |
| 02 | Scaffold the monorepo and shared contracts | Done | Install, build, typecheck, Vite proxy smoke check, and browser boundary check passed; generated Next.js instruction files remain pending approval to remove |
| 03 | Build the accessible frontend shell | Done | Six routes, responsive shell, demo fixtures, typed API client, query provider, Chrome desktop/mobile and keyboard smoke tests |
| 04 | Add the first Claude SDK vertical slice | Done | Local development question and answer, mock browser path verified; live call unverified without credentials |
| 05 | Start PostgreSQL and Redis locally | Done, live smoke blocked | Compose configuration, clients, health routes, docs, and local tests complete; Docker engine access denied |
| 06 | Create the Prisma schema and deterministic seed | Not started | |
| 07 | Implement authentication and authorization | Not started | |
| 08 | Build portfolio and transaction APIs | Not started | |
| 09 | Implement valuation and performance calculations | Not started | |
| 10 | Connect the portfolio UI and watchlist | Not started | |
| 11 | Build deterministic provider adapters | Not started | |
| 12 | Add live providers and resilient ingestion | Not started | |
| 13 | Implement caching and the transactional outbox | Not started | |
| 14 | Build replayable authenticated SSE on the API | Not started | |
| 15 | Add frontend streaming and snapshot recovery | Not started | |
| 16 | Build the complete live news experience | Not started | |
| 17 | Create authorized custom tools | Not started | |
| 18 | Build grounded portfolio chat | Not started | |
| 19 | Stream agent answers without duplicate text | Not started | |
| 20 | Implement resumable conversations and structured analysis | Not started | |
| 21 | Build portfolio impact and research recommendations | Not started | |
| 22 | Add recommendation cards and configurable alerts | Not started | |
| 23 | Add focused subagents and an MCP integration | Not started | |
| 24 | Add reusable skills and policy hooks | Not started | |
| 25 | Implement approvals and explicit cancellation | Not started | |
| 26 | Manage context and enforce usage budgets | Not started | |
| 27 | Move execution into a durable worker | Not started | |
| 28 | Persist SDK sessions across restarts | Not started | |
| 29 | Harden the application and execution boundary | Not started | |
| 30 | Add distributed recovery and operational controls | Not started | |
| 31 | Build a meaningful automated test suite | Not started | |
| 32 | Add AI evaluation and observability | Not started | |
| 33 | Build production containers and release CI | Not started | |
| 34 | Generate and validate Azure infrastructure | Not started | |
| 35 | Create Kubernetes deployment and release procedures | Not started | |
| 36 | Finish the capstone and teaching materials | Not started | |

## Environment observed (2026-09-30)

| Tool | Observed | Notes |
| --- | --- | --- |
| OS | Windows 11 Home (10.0.26200) | PowerShell and Git Bash available |
| Node.js | 24.21.0 installed under nvm, **not active** in this shell | `node --version` reports no active version; Node 24 is LTS |
| npm | **Not active** in this shell | Node 24.21.0 bundles npm 11.19.0 per official archive |
| git | 2.52.0.windows.1 | `git status --short` says this workspace is not a Git repository; the earlier observation no longer matches this directory |
| Docker | CLI 28.5.2; Compose 2.40.3 | `docker info` fails with access denied to config/engine pipe; daemon unverified |

## Latest milestone report — 05

**What works:** Compose defines pinned PostgreSQL 17.6 and Redis 7.4.5 with health checks, localhost-only ports, and named volumes. npm scripts start, stop, and inspect the stack; volume reset requires an explicit flag. The API has separate liveness and dependency readiness routes. Prisma 7 uses the PostgreSQL adapter; Redis uses node-redis with bounded reconnection. URLs are validated, connections are reused, and a shutdown hook closes them. No Azure resources were provisioned.

**Changed files:** `compose.yaml`, `scripts/infra.mjs`, root and workspace package manifests and lockfile, `packages/db` client and schema, server config and tests, API health routes and tests, instrumentation, local environment example, `README.md`, `docs/lessons/05-local-infrastructure.md`, and this state file.

**Check results:** `docker compose -f compose.yaml config --quiet` passed. `npm run build` and `npm run typecheck` passed with existing Vite warnings and two new Next.js Edge analysis warnings for the Node-only shutdown hook. `npm run test` passed its pre-existing 19 tests; the new API readiness tests then passed separately (6 API tests total). Unconfirmed volume reset exited 2 before calling Docker. `npm run infra:status` failed because Docker engine pipe access was denied. The live container/API smoke test was not run.

**How to demonstrate:** Follow the milestone 05 section of `README.md`. With an accessible Docker Linux engine, run `npm run infra:start`, `npm run infra:status`, copy `apps/api/.env.example` to `apps/api/.env.local`, run `npm run build` and `npm run dev`, then request `/api/health/live` and `/api/health/ready`. Run `docker compose stop redis`; readiness should return 503 while liveness stays 200. Restore with `npm run infra:start`. `npm run infra:stop` preserves volumes; `npm run infra:reset -- --confirm-delete-volumes` deletes them.

**Remaining limitations:** Docker pipe access was denied on this host, so PostgreSQL and Redis container health, API access to both, and the readiness transition on dependency stop are unverified. The exact next smoke test commands are above. The Prisma schema has no application models or migrations until milestone 06. This workspace is not a Git repository, so no commit was made.
## Previous milestone report — 04

**What works:** The Assistant screen sends a bounded question to local-development-only `POST /api/demo/ask` and displays a completed answer or an error. `AgentService` has deterministic mock and Claude Agent SDK implementations. Mock answers are labeled. Claude mode requires an explicit server API key and model ID, uses the installed SDK 0.3.276 `query` API, disables built-in tools with `tools: []`, limits a run to one turn, an estimated USD 0.02 SDK budget, and 20 seconds. SDK settings and runtime data are directed to a configured absolute workspace outside the source repository; session persistence is disabled. Missing credentials fail with a clear configuration error and never fall back to mock. The endpoint is unavailable outside local development and is bound to loopback in the API dev script. It is temporary and must be removed when authenticated run endpoints replace it.

**Changed files:** `packages/agent/src/index.ts` and `test/agent.test.ts`; `packages/contracts/src/index.ts`; `packages/config/src/server.ts` and `test/config.test.ts`; `apps/api/app/api/demo/ask/route.ts` and `route.test.ts`, `apps/api/lib/http.ts`, `apps/api/package.json`, `apps/api/.env.example`; `apps/web/src/app.tsx`, `src/styles.css`, `e2e/shell.spec.ts`; `package-lock.json`; `docs/lessons/04-first-agent-slice.md`; this state file. No instruction files were changed.

**Check results:** `npm ci --no-audit --no-fund` installed 302 packages. `npm run build` passed after two TypeScript fixes, including Next.js production compilation and route typecheck. `npm run typecheck` and `npm run check:browser-boundary` passed. `npm run test` passed 18 tests across contracts, config, agent, web, and API. With `npm run dev` running, `npm run test:browser --workspace=@portfolio-pilot/web` passed all three Chrome tests, including a visible mock answer from a browser question. Vite emitted the existing non-fatal third-party `use client` warnings. `ANTHROPIC_API_KEY`, `AGENT_MODEL_ID`, and `AGENT_WORKSPACE_DIR` were absent in this shell; the live SDK smoke test was not run.

**How to demonstrate:** With Node/npm active, run `npm ci`, `npm run build`, then `npm run dev`. Open `http://127.0.0.1:5173/assistant`, enter a question, and select Send message. The result is labeled “Mock answer.” Run `npm run test`, `npm run typecheck`, `npm run check:browser-boundary`, and, while dev servers run, `npm run test:browser --workspace=@portfolio-pilot/web`. On this host use the direct Node 24.21.0/npm CLI invocation described in the milestone 03 report if the npm shim is inactive. For an optional live check, set `AGENT_MODE=claude`, `AGENT_MODEL_ID` to a model available to your Anthropic API account, `AGENT_WORKSPACE_DIR` to an absolute path outside this repository, and `ANTHROPIC_API_KEY` in the API server environment, restart dev, then ask one short question. The SDK budget remains USD 0.02; no account login is used.

**Remaining limitations:** Live Claude behavior is unverified because no application API key or model configuration was present; configure those server variables and run the one-question browser check above. The dev endpoint has no authenticated user and must not be deployed as a user API. It returns one completed answer, with no persistence, streaming, portfolio context, news grounding, citations, or durable cancellation. The source directory is not a Git repository, so no commit was made. The pre-existing Next.js-generated `apps/api/AGENTS.md` and `CLAUDE.md` remain pending approval to remove.

**Documentation follow-up (2026-10-01):** Created the root `README.md` for students. It explains milestone 04's purpose, the actual implementation sequence, observed checks, mock and optional live run commands, and remaining limits. The README was absent in this workspace before the follow-up. Only documentation changed; application checks were not rerun.

## Previous milestone report — 03

**What works:** The React app has Dashboard, Portfolios, News, Assistant, Watchlist, and Settings routes. A sidebar becomes a mobile drawer; the portfolio selector updates summary and holdings. Dashboard cards, holdings table, news, and a clearly disabled assistant preview use deterministic fixture DTOs. Every page visibly labels demo data and a fixed UTC snapshot. The shell has a skip link, named navigation, table semantics, labeled controls, visible focus, responsive layouts, and reusable empty/loading/error/stale state components. The API client validates JSON with a supplied schema and distinguishes HTTP envelope errors, invalid responses, timeouts, cancellation, and network failures. TanStack Query manages the API health query.

**Changed files:** `apps/web/package.json`, `src/main.tsx`, new `src/app.tsx`, `src/styles.css`, `src/data/demo.ts`, `src/lib/api-client.ts`, `src/lib/api-client.test.ts`, `src/lib/format.ts`, `playwright.config.ts`, and `e2e/shell.spec.ts`; `packages/contracts/src/index.ts`; `package-lock.json`; `docs/versions.md`; `docs/lessons/03-ui-shell.md`; this state file. No instruction files were changed.

**Check results:** `npm run build`, `npm run typecheck`, `npm run lint` (the current project script runs TypeScript), `npm run test`, and `npm run check:browser-boundary` passed using the installed Node 24.21.0 executable and npm CLI with its directory prepended to `PATH`. Ten unit tests passed (two contracts, four config, four web API client). With `npm run dev` running, `npm run test:browser --workspace=@portfolio-pilot/web` passed two Chrome tests covering routes, portfolio selection, keyboard Tab/Enter, the mobile drawer and Escape, and no page-wide horizontal overflow at 390 px. Desktop 1440 px and mobile 390 px screenshots were captured and visually inspected. The first browser run failed because a text locator matched three demo labels; the locator was made specific and the final run passed. The first root unit run picked up the Playwright spec; the web Vitest command now scopes to `src`, and the final root run passed. An experiment with Playwright-managed server startup passed the tests but hung at teardown on Windows, so the final test configuration uses the manual `npm run dev` workflow and exits cleanly. Vite emitted non-fatal third-party `use client` directive warnings during the successful build.

**How to demonstrate:** With Node/npm active, run `npm install`, `npm run dev`, then open `http://127.0.0.1:5173/`. Visit all six routes, switch from Growth to Income Portfolio, resize below 850 px to use the drawer, and use Tab/Enter and Escape. Run `npm run test:browser --workspace=@portfolio-pilot/web` to repeat the Chrome smoke test; run `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run check:browser-boundary` for project checks. On this host, invoke npm through `C:\Users\luisc\AppData\Local\Author Software\nvm\installs\v24.21.0\node.exe` and its adjacent `node_modules\npm\bin\npm-cli.js`, with the Node install directory first in `PATH`.

**Remaining limitations:** Portfolio, watchlist, news, and market figures are fixtures, not persisted or live provider data. The Assistant input is disabled until milestone 04. Only the health endpoint uses the API client so far. Browser smoke coverage is limited to installed Chrome at 1440 px and 390 px, not a full accessibility audit or other browser engines. This workspace has no `.git` directory, so no commit was made. Next.js-generated `apps/api/AGENTS.md` and `apps/api/CLAUDE.md` remain from milestone 02 because their removal was rejected by automatic approval review.

**Documentation follow-up (2026-09-30):** Added `README.md` as a beginner-friendly guide to milestone 03, its verified results, run commands, and current limits. This follow-up changed documentation only; no application checks were rerun. A static check confirmed the requested sections and fenced command examples are present.

## Previous milestone report — 02

**What works:** npm workspaces cover the three applications and seven shared packages with explicit exports and ordered shared builds. React/Vite serves on 5173; the Node.js Next Route Handler serves `GET /api/health/live` on 3001 through the Vite `/api` proxy. The route returns a UUID request ID in both the JSON body and `x-request-id` header; invalid server configuration uses the shared error envelope. Browser and server config have separate Zod entry points, with empty example placeholders and mock defaults. The worker reports its role and exits cleanly on its shutdown message. The browser package graph is limited to web, contracts, and config.

**Changed files:** Root `package.json`, `.gitignore`, `tsconfig.base.json`, `package-lock.json`, `scripts/`; new `apps/web`, `apps/api`, `apps/worker`, and `packages/contracts`, `packages/domain`, `packages/db`, `packages/providers`, `packages/agent`, `packages/config`, `packages/observability`; `docs/versions.md`, `docs/lessons/02-monorepo-contracts.md`, and this state file. Next.js generated `apps/api/AGENTS.md` and `apps/api/CLAUDE.md` during the dev smoke check; they remain in the workspace because automatic approval review rejected their removal. `agentRules: false` now prevents regeneration.

**Check results:** Direct Node invocation of the installed npm 11.19.0 CLI ran `npm install --no-audit --no-fund` successfully (295 packages; lockfile created), then `npm run build`, `npm run typecheck`, `npm run lint`, and `npm run test` successfully. The test run has six passing focused contract/config assertions; other workspaces currently have no test files. `npm run check:browser-boundary` passed, and source/built asset scans found no agent SDK, Prisma, Node-only import, or server secret marker in web code. `npm ls` confirmed the approved core versions. `npm run dev` started Vite and Next.js; HTTP checks returned 200 for `/` and `/api/health/live` through port 5173, with matching request IDs. The worker printed its role and a graceful IPC shutdown message, then exited 0. Normal `npm` invocation is blocked by the local NVM trust shim; direct Node + npm CLI invocation works. A separate single-workspace npm build attempt failed intermittently through that shim, while the final root build and typecheck passed.

**How to demonstrate:** In a shell with Node/npm active, run `npm install`, `npm run build`, `npm run typecheck`, `npm run test`, `npm run check:browser-boundary`, then `npm run dev`. Open `http://127.0.0.1:5173/` and `http://127.0.0.1:5173/api/health/live`. For the worker, run `npm run start --workspace=@portfolio-pilot/worker` after build and stop with Ctrl+C. On this host, substitute `& 'C:\Users\luisc\AppData\Local\Author Software\nvm\installs\v24.21.0\node.exe' 'C:\Users\luisc\AppData\Local\Author Software\nvm\installs\v24.21.0\node_modules\npm\bin\npm-cli.js'` for `npm`.

**Remaining limitations:** No browser automation or visual inspection was run; the HTTP and production build checks verify delivery but not browser rendering. The database and agent packages expose boundaries only; their persistence and SDK behavior belong to later milestones. Prisma install scripts were not allowlisted by npm, and no Prisma schema/generation is needed until milestone 06. This directory is still not a Git repository, so no commit was made. Automatic approval review rejected removing Next.js-generated `apps/api/AGENTS.md` and `apps/api/CLAUDE.md`, citing the contract's protection of instruction files; removal requires explicit user approval.

## Previous milestone report — 01

**What works:** A stable, exact dependency version set and Node 24.21.0 LTS/npm 11.19.0 baseline are documented in `docs/versions.md`, with official compatibility references. Root metadata pins the runtime and package manager. `.gitignore` excludes credentials, SDK transcripts, generated output, and local database files.

**Changed files:** `.nvmrc`, `.npmrc`, `package.json`, `.gitignore`, `docs/versions.md`, `docs/lessons/01-toolchain.md`, and this state file. No application code or packages were installed.

**Check results:** `git --version` passed (2.52.0.windows.1); `docker --version` passed (28.5.2); `docker compose version` passed (2.40.3); `nvm list` found 24.21.0 installed. `node --version` and `npm --version` failed because no active Node version is configured. `docker info --format '{{.ServerVersion}}'` failed with access denied to the Docker config/engine pipe. `git status --short` failed because this directory is not a Git repository. Direct PowerShell request to `https://registry.npmjs.org/react/latest` failed to connect; registry package pages and official docs were reviewed through web access. `Get-Content package.json -Raw | ConvertFrom-Json` passed, confirming valid JSON and the selected engine/package manager fields. Static checks found the intended `.gitignore` exclusions and both new docs; `package-lock.json` does not exist. A local install, lockfile resolution, build, and tests were not run.

**How to demonstrate:** Review `docs/versions.md`, `.nvmrc`, `.npmrc`, `package.json`, and `.gitignore`. In Windows PowerShell, run `nvm use 24.21.0; node --version; npm --version`. In Linux/WSL2 with `nvm-sh`, run `nvm install 24.21.0 && nvm use 24.21.0 && node --version && npm --version`. After milestone 02 creates workspace manifests and network access works, run `npm install --package-lock-only --ignore-scripts`, `npm install`, and the `npm ls ...` command in `docs/versions.md`.

**Remaining limitations:** This shell cannot currently activate Node/npm, access the npm registry directly, use the Docker engine, or inspect Git history. SDK installed types and full resolved peer graph must be checked when dependencies are installed. There is no lockfile because no dependency manifests or install exist yet. Docker and credentials are unnecessary for milestone 01.

## Previous milestone report — 00

**What works:** The project contract, assistant pointer file, 36-milestone plan, state tracker, and
ADR index exist. No application code has been generated.

**Changed files (all new):**
- `AGENTS.md`, `CLAUDE.md`
- `docs/project-plan.md`, `docs/project-state.md`
- `docs/decisions/README.md`, `docs/decisions/0001-architecture-baseline.md`
- `docs/lessons/00-project-contract.md`
- `README.md` (added after the milestone at the user's request; a student-facing explanation of
  Prompt 00. Milestone 36 replaces it with the full application README.)

**Check results:** Documentation-only milestone; no build, lint, or test tooling exists yet.
Verified that the workspace was empty beforehand, so no existing instruction files were overwritten.

**How to demonstrate:** Open `AGENTS.md`, then `docs/project-plan.md`. Start a fresh assistant
session and confirm it reads `CLAUDE.md` → `AGENTS.md` → `docs/project-state.md`.

**Remaining limitations:**
- ~~The folder is not a git repository.~~ Resolved: the user initialized the repository and added
  the GitHub remote; the Milestone 00 docs and README were committed and pushed to `main` on request.
- No versions are pinned yet; that is milestone 01.

## Open decisions and blockers

- Authentication library, live quote/news provider, and gateway controller are decided in their
  milestones (07, 12, 35) and recorded as ADRs.



