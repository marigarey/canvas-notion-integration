# Sprigate

Sprigate synchronizes a student's active Canvas courses, assignments, quizzes, and discussions into a Notion database.

The current application is a Next.js web service with:

- Notion OAuth through Supabase Auth
- Encrypted per-user Canvas and Notion credentials
- Course selection and manual synchronization
- Optional daily, weekly, or monthly synchronization
- A Notion database that preserves the user's `Completed` checkbox while Sprigate updates Canvas-owned fields
- Row-level security for all user integration settings

The older local synchronization prototype remains under `src/internal` for historical reference. It is not the web application's entry point.

## Architecture

```text
Browser
  -> Next.js server actions and route handlers
  -> Supabase Auth + Postgres (RLS)
  -> Canvas REST API
  -> Notion API

Vercel Cron (or another scheduler)
  -> GET /api/cron/sync
  -> due user integrations
  -> Canvas-to-Notion synchronization
```

Canvas and Notion credentials are encrypted with AES-256-GCM before being stored. API credentials and decryption keys are only used in server-side modules.

## Requirements

- Node.js 22
- A Supabase project
- A Notion OAuth integration configured in Supabase Auth
- A deployment capable of invoking the protected cron endpoint for automatic synchronization

## Local setup

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Generate independent encryption and cron secrets:

```bash
openssl rand -base64 32
openssl rand -hex 32
```

Set these variables in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Application origin, such as `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public/anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for cron, contact messages, and account deletion |
| `CREDENTIAL_ENCRYPTION_KEY` | Base64-encoded 32-byte AES key |
| `CRON_SECRET` | Bearer token protecting `/api/cron/sync` |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Stable 32-byte key shared by all application instances |

Never expose the service-role key, encryption key, or cron secret through a `NEXT_PUBLIC_` variable.

Apply the SQL migrations in `supabase/migrations` with the Supabase CLI or SQL editor. The migrations create:

- `user_integrations`, protected by per-user row-level security
- scheduling fields and a due-sync index
- `contact_messages`, accessible only through the server-side service role

Start the application:

```bash
npm run dev
```

## Supabase and Notion OAuth

Configure Notion as an OAuth provider in Supabase Auth. The Notion integration's OAuth redirect URI should point to Supabase's provider callback:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Add the application's callbacks to the Supabase redirect allow list:

```text
http://localhost:3000/auth/callback
https://your-production-domain.example/auth/callback
```

After login, Sprigate encrypts and stores the Notion provider token. Users then provide a Canvas school URL, a Canvas access token, and a Notion parent page that the integration can access.

## Scheduled synchronization

`vercel.json` invokes `/api/cron/sync` hourly. The endpoint only processes integrations whose `next_sync_at` value is due and requires:

```text
Authorization: Bearer <CRON_SECRET>
```

Vercel sends this header automatically when the project has a matching `CRON_SECRET`. On another platform, configure its scheduler to send the same header.

The endpoint processes a limited batch per invocation. Run it more frequently or move execution to a durable job queue before supporting a large user population.

## Verification

```bash
npm test
npm run lint
npm run build
npm audit
```

The unit tests cover credential encryption, tamper detection, Canvas bearer authentication and pagination boundaries, Notion page ID parsing, and schedule calculation.

## Docker

Build the production image:

```bash
docker build -t sprigate .
```

Run it with a production environment file:

```bash
docker run --env-file .env.production -p 3000:3000 sprigate
```

The multi-stage image builds the Next.js standalone server on Node.js 22 and runs it as the unprivileged `node` user.

## Current limitations

- Canvas and Notion API behavior still needs end-to-end verification against configured test accounts.
- Automatic synchronization runs inside a cron request; a durable queue is recommended at larger scale.
- Contact messages are stored in Supabase for review; email notification delivery is not configured.
- The legacy `src/internal` prototype should be removed after feature parity is confirmed.

## Security

Please report vulnerabilities according to [SECURITY.md](./SECURITY.md). Do not include Canvas tokens, Notion tokens, Supabase keys, or other secrets in issues or logs.
