# Local PostgreSQL and Redis

PortfolioPilot is a teaching stock portfolio application. This README focuses on milestone 05. The earlier Assistant demo remains documented below.

## Purpose: add local services and meaningful health checks

This prompt asks the coding agent to set up PostgreSQL and Redis for development, connect the API to them, and report whether the API can use them. PostgreSQL is the database planned for durable application data. Redis is a fast data store planned for temporary data and coordination. **Docker Compose** is a file that describes how to start related containers together; a **named volume** keeps a container's data when it stops.

Students will learn why a running web process is different from an API that can reach its required services. The `/api/health/live` route answers whether the API process is responding. The `/api/health/ready` route checks PostgreSQL and Redis before reporting that the API is ready. This milestone uses local containers only; it does not create Azure resources.

## Steps performed in milestone 05

1. **Inspected the prior milestone.** This milestone directory was empty, so the completed milestone 04 source and documentation were copied from the adjacent directory, excluding dependencies and generated build files. The project contract and state defined PostgreSQL as the authoritative database and Redis as a supporting service.
2. **Added local containers.** [compose.yaml](compose.yaml) pins `postgres:17.6-alpine` and `redis:7.4.5-alpine`. Each has a health check and a named volume. Ports 5432 and 6379 are published only on `127.0.0.1`, the local machine's loopback address.
3. **Added infrastructure commands.** [scripts/infra.mjs](scripts/infra.mjs) backs `npm run infra:start`, `infra:stop`, `infra:status`, and `infra:inspect`. Normal stop keeps both volumes. `infra:reset` deletes them only when passed `--confirm-delete-volumes`.
4. **Added local configuration and clients.** [apps/api/.env.example](apps/api/.env.example) provides matching local URLs and an intentionally public example password. [packages/config/src/server.ts](packages/config/src/server.ts) validates database and Redis URL schemes. [packages/db/prisma/schema.prisma](packages/db/prisma/schema.prisma) generates a Prisma 7 client. Prisma is the library that will give application code typed database queries; its PostgreSQL adapter connects that client to PostgreSQL. [packages/db/src/index.ts](packages/db/src/index.ts) also creates a Redis client, limits connection retries, reuses connections, and closes them on shutdown. The schema has no application models yet.
5. **Separated health routes.** [liveness](apps/api/app/api/health/live/route.ts) reports process health. [readiness](apps/api/app/api/health/ready/route.ts) queries PostgreSQL and pings Redis. It returns only dependency states and a request ID, never URLs or passwords. [API instrumentation](apps/api/instrumentation.ts) validates configuration when the API starts and registers connection cleanup for shutdown.
6. **Checked and recorded the result.** The Compose configuration, build, typecheck, and tests were run with the commands in the results table below. [Readiness tests](apps/api/app/api/health/ready/route.test.ts) cover ready and unavailable responses with simulated dependency results. [Project state](docs/project-state.md) and the [lesson note](docs/lessons/05-local-infrastructure.md) record the Docker limitation.

## Results achieved and observed

The implementation is in place. When both dependencies respond, readiness is designed to return HTTP 200 with a body shaped like this:

```json
{
  "status": "ready",
  "dependencies": { "postgres": "up", "redis": "up" },
  "requestId": "<generated ID>"
}
```

If Redis stops, readiness is designed to return HTTP 503 with a body shaped like this, while liveness continues to return HTTP 200:

```json
{
  "status": "unavailable",
  "dependencies": { "postgres": "up", "redis": "down" },
  "requestId": "<generated ID>"
}
```

The ready and unavailable responses passed unit tests using simulated dependency results. **They were not observed against running containers** because this host could not access the Docker engine. A unit test checks one piece of code with controlled inputs; the pending smoke test will check the running API and containers together.

| Check actually run | Observed result |
| --- | --- |
| `docker compose -f compose.yaml config --quiet` | Passed; Compose accepted the file |
| `npm run build` | Passed; Prisma client generated and the web/API built |
| `npm run typecheck` | Passed |
| `npm run test` | Passed the 19 tests present at that run |
| `npm run test --workspace=@portfolio-pilot/api` | Passed 6 API tests, including the new readiness tests |
| `node scripts/infra.mjs reset` | Refused the destructive operation and exited 2 without the confirmation flag |
| `node scripts/infra.mjs status` | Could not contact Docker; access to the engine pipe was denied |

The `docker info` check also failed with access denied to `//./pipe/docker_engine`. That is why the live container check is marked pending rather than passed.

The build also printed existing Vite `use client` warnings and two Next.js Edge analysis warnings about the Node-only shutdown hook. The build still passed.

## Run and verify locally

You need Node.js 24.21.0, npm 11.19.0, Docker Desktop with an accessible Linux container engine, and free local ports 5432, 6379, 3001, and 5173. From this directory, run:

```powershell
npm ci
npm run infra:start
npm run infra:status
Copy-Item apps/api/.env.example apps/api/.env.local
npm run build
npm run dev
```

`infra:start` waits for both Compose health checks. In another PowerShell terminal, request the health routes through the Vite development proxy:

```powershell
Invoke-WebRequest http://127.0.0.1:5173/api/health/live
Invoke-WebRequest http://127.0.0.1:5173/api/health/ready
```

The **expected** status is 200 for both routes when the containers are healthy. To check a failure, keep `npm run dev` running and execute:

```powershell
docker compose -f compose.yaml stop redis
Invoke-WebRequest -SkipHttpErrorCheck http://127.0.0.1:5173/api/health/ready
Invoke-WebRequest http://127.0.0.1:5173/api/health/live
npm run infra:start
```

The **expected** readiness status after stopping Redis is 503, while liveness stays 200. This full smoke test is still pending. Run `npm run infra:inspect` to see all containers. `npm run infra:stop` stops services without deleting data. The following command intentionally deletes both local volumes and requires its explicit flag:

```powershell
npm run infra:reset -- --confirm-delete-volumes
```

The password in `.env.example` is public teaching data for local use. Use separate secret credentials for production. Do not commit `.env.local` or reuse its example password outside local development.

## Limitations and next work

- Docker engine pipe access was denied on the recorded Windows host. PostgreSQL and Redis health, API access to both, and the readiness change after a real service stop were therefore **not verified**. Start Docker Desktop with an accessible Linux engine and run the commands above to finish that smoke test.
- The Prisma schema contains no application tables or migrations. Milestone 06 adds them and a deterministic seed.
- The portfolio, watchlist, and news screens still use demo fixtures. Local services do not yet store their data.
- The live Claude Agent SDK path remains unverified without application credentials, as described in the earlier activity below.

## Earlier activity: milestone 04 Assistant demo

PortfolioPilot is a teaching project for a stock portfolio manager. This workspace has completed milestones 00–05. The current application has a React demo interface with six pages, fixed sample portfolio and news data, and a working **Assistant** question and answer screen in local development.

### Purpose of the earlier activity

Milestone 04 asks a coding agent to connect a browser question to a server-side agent without building the later database, authentication, streaming, or worker infrastructure. Students learn how to:

- Share a request and response format between the browser and API without exposing server code or secrets to the browser.
- Put two implementations behind an `AgentService` interface: a predictable mock and a Claude adapter.
- Use the **Claude Agent SDK** `query` API with explicit tool, cost, turn, workspace, and time limits. An adapter is a small layer that translates an application's needs into a library's API.
- Keep an experimental endpoint available only during local development, and report an actual Claude failure instead of silently returning a mock answer.

The mock path lets every student run the full browser-to-API interaction without AI credentials. The optional Claude path is for an application API key, not a coding assistant's personal login.

### What was built, in order

1. **Inspected the existing project.** The project plan and state showed that milestone 03 had built the frontend shell, while the Assistant input was still disabled. The installed `@anthropic-ai/claude-agent-sdk` version was `0.3.276`. Its `sdk.d.ts` file was read before writing the adapter. It declares `query({ prompt, options })` and the options used here, including `tools`, `model`, `maxTurns`, `maxBudgetUsd`, `abortController`, `cwd`, and `persistSession`.
2. **Defined shared data and server configuration.** [packages/contracts/src/index.ts](packages/contracts/src/index.ts) validates a trimmed question of 1–500 characters and a completed answer. [packages/config/src/server.ts](packages/config/src/server.ts) adds `AGENT_MODE`, `AGENT_MODEL_ID`, and `AGENT_WORKSPACE_DIR`. The API's [environment example](apps/api/.env.example) lists the server variables; milestone 05 later added a public, local-only PostgreSQL example password. It contains no production or Anthropic secret.
3. **Implemented the agent boundary.** [packages/agent/src/index.ts](packages/agent/src/index.ts) exports `AgentService`, `MockAgentService`, and `ClaudeAgentService`. Mock mode returns a fixed answer labeled `[Mock answer]`. Claude mode calls the installed Agent SDK's `query` API with a configured model, `tools: []` (no built-in tools), one turn, a USD 0.02 estimated SDK budget, and a 20-second timeout. It requires an API key and an absolute SDK workspace outside the source repository. SDK session persistence is disabled. The model ID is supplied by configuration rather than guessed in code.
4. **Added the temporary API route.** [apps/api/app/api/demo/ask/route.ts](apps/api/app/api/demo/ask/route.ts) handles `POST /api/demo/ask` on the Node.js runtime. It accepts at most 2,048 characters of JSON request body, validates the question, selects the configured adapter, and returns one completed answer. It returns clear errors for bad requests, missing live credentials, timeouts, and agent failures. The route returns 404 outside local development; the API development server binds to `127.0.0.1`.
5. **Connected the Assistant page.** [apps/web/src/app.tsx](apps/web/src/app.tsx) now has an enabled question form, loading and error states, and a visible answer. The page says that portfolio context and current market data are not connected yet. The [styles](apps/web/src/styles.css) support the answer card and form.
6. **Added verification and teaching notes.** Tests were added for request validation, missing credentials, adapter failure, SDK option selection, and the browser mock flow. [docs/lessons/04-first-agent-slice.md](docs/lessons/04-first-agent-slice.md) explains the design; [docs/project-state.md](docs/project-state.md) records the observed results and next milestone. The package lockfile was updated for the API's agent workspace dependency.

The [official Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) distinguishes the local Agent SDK from the Messages client and Managed Agents. This project uses the local Agent SDK.

### Results observed

With the development servers running in mock mode, a browser question on the Assistant page produced a visible completed answer. The browser test passed. The answer text was:

```text
[Mock answer] This is a deterministic demo response. Portfolio analysis and current market facts are unavailable in this question-and-answer demo.
```

The response also has a `mode` value of `mock` and a request ID. The request ID changes for each request. The browser shows an error if the API cannot complete a request; it does not fabricate a Claude answer.

The implementation checks recorded for milestone 04 were:

| Check | Observed result |
| --- | --- |
| `npm ci --no-audit --no-fund` | Passed; 302 packages installed |
| `npm run build` | Passed, including the web build and Next.js API build |
| `npm run typecheck` | Passed |
| `npm run check:browser-boundary` | Passed; the browser dependency graph contains only web, contracts, and config |
| `npm run test` | Passed; 18 unit tests across contracts, config, agent, web, and API |
| `npm run test:browser --workspace=@portfolio-pilot/web` | Passed; 3 Chrome tests, including a visible mock answer |

The production build emitted non-fatal third-party `use client` directive warnings. A live Claude request was **not** run because no application API key, model ID, or agent workspace was configured in the test shell.

### Run the mock demo

You need Node.js **24.21.0**, npm **11.19.0**, and a local Chrome installation for the browser tests. The lockfile pins the project dependencies. No database, Redis server, or Anthropic credential is needed for mock mode.

From the repository root, run:

```powershell
npm ci
npm run build
npm run dev
```

Open <http://127.0.0.1:5173/assistant>, type a question, and select **Send message**. You should see **Mock answer** and the fixed text above. `npm run dev` starts Vite for the React site on port 5173 and Next.js for `/api` on port 3001. Vite forwards browser `/api` requests to Next.js; this is called a development proxy.

In another terminal, run the checks:

```powershell
npm run typecheck
npm run test
npm run check:browser-boundary
npm run test:browser --workspace=@portfolio-pilot/web
```

Keep `npm run dev` running while the browser test runs. Stop the servers with Ctrl+C afterward.

On the Windows host used for the recorded checks, the normal npm command was inactive because of its local Node version manager. The installed Node and npm CLI worked when invoked directly:

```powershell
$nodeDir = 'C:\Users\luisc\AppData\Local\Author Software\nvm\installs\v24.21.0'
$env:PATH = "$nodeDir;$env:PATH"
& "$nodeDir\node.exe" "$nodeDir\node_modules\npm\bin\npm-cli.js" run dev
```

Replace `run dev` with `ci`, `run build`, or `run test` as needed. Other machines with Node and npm active can use the normal commands.

### Optional Claude mode

Claude mode needs an Anthropic **application API key**, access to a model you choose, and a writable absolute directory outside this source repository for SDK runtime data. Set the following variables in the API server environment, then start or restart `npm run dev`:

```powershell
$env:AGENT_MODE = 'claude'
$env:AGENT_MODEL_ID = '<model ID available to your Anthropic API account>'
$env:AGENT_WORKSPACE_DIR = '<absolute path outside this repository>'
$env:ANTHROPIC_API_KEY = '<application API key>'
npm run dev
```

Ask one short question at <http://127.0.0.1:5173/assistant>. The configured SDK limits still apply. This is a **suggested verification step**, not a claim that live mode succeeded in this workspace. Missing credentials produce a configuration error and never switch to mock mode. Do not put real keys in files committed to a repository or in browser variables such as `VITE_*`.

### Limits recorded for the Assistant demo

- The live Claude path has type and failure tests but no credentialed smoke test. To verify it, configure the four server variables above and submit one short question within the USD 0.02 SDK budget.
- `POST /api/demo/ask` is a temporary, unauthenticated **local development** endpoint. It must be removed when authenticated agent run endpoints replace it. It is not a production user API.
- Answers arrive all at once. There is no chat history, streaming, durable cancellation, portfolio-aware context, news evidence, or citations yet.
- Portfolio, watchlist, and news figures on the other pages are deterministic demo fixtures. Database and Redis connection infrastructure is available in milestone 05; application models and migrations begin in milestone 06.
- Only Chrome browser tests were run. This is not a complete accessibility or cross-browser audit.
- This workspace was not a Git repository during the implementation, so no commit was made. Existing Next.js-generated instruction files under `apps/api` remain in place.

For the full milestone sequence and exact project rules, see [docs/project-plan.md](docs/project-plan.md) and [AGENTS.md](AGENTS.md).


