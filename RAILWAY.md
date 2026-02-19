# Deploying Spacebar Server on Railway

This guide covers deploying the Spacebar server to [Railway](https://railway.com) using the included Dockerfile and `railway.json` configuration.

## Prerequisites

- A [Railway account](https://railway.com)
- [Railway CLI](https://docs.railway.com/guides/cli) installed (`npm i -g @railway/cli`)
- This repository cloned locally

## Step 1: Create a Railway Project

```bash
railway login
railway init
```

Or create a project from the [Railway dashboard](https://railway.com/dashboard).

## Step 2: Add a PostgreSQL Database

The server requires PostgreSQL. Add it via CLI or dashboard:

```bash
railway add --database postgres
```

Or in the dashboard: click **+ New** → **Database** → **PostgreSQL**.

## Step 3: Set Environment Variables

The critical variable is `DATABASE`. The app reads `process.env.DATABASE` (not `DATABASE_URL`), so you must map Railway's PostgreSQL URL using a reference variable.

In the Railway dashboard, go to your service's **Variables** tab and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE` | `${{Postgres.DATABASE_URL}}` | **Required.** Maps Railway's PostgreSQL URL to the app's expected env var. |
| `NODE_ENV` | `production` | Already set in Dockerfile, but explicit is good. |

Optional variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `THREADS` | `1` | Worker thread count. Keep at 1 unless on a high-CPU plan. |
| `STORAGE_PROVIDER` | `file` | Default. Set to `s3` for S3 storage. |
| `STORAGE_LOCATION` | `/app/files` | Default when using file storage. |
| `LOG_REQUESTS` | `-200` | Log all requests except 200s (useful for debugging). |

Do **not** set `PORT` — Railway injects it automatically and the app reads it.

## Step 4: Add Persistent Storage (Recommended)

Without a volume, uploaded files (avatars, attachments, etc.) are lost on each deploy.

In the Railway dashboard:
1. Go to your service → **Settings** → **Volumes**
2. Click **Add Volume**
3. Set mount path to `/app/files`

Alternatively, use S3 storage by setting `STORAGE_PROVIDER=s3` along with `STORAGE_REGION`, `STORAGE_BUCKET`, and `STORAGE_ENDPOINT`.

## Step 5: Deploy

### Option A: Deploy from GitHub (Recommended)

1. In the Railway dashboard, connect your GitHub repository
2. Railway will auto-deploy on every push to your configured branch
3. The `railway.json` and `Dockerfile` will be picked up automatically

### Option B: Deploy via CLI

```bash
railway up
```

### Option C: Deploy via `railway link`

```bash
railway link        # Link to your Railway project
railway up          # Deploy
```

## Step 6: Generate a Public Domain

In the Railway dashboard:
1. Go to your service → **Settings** → **Networking**
2. Click **Generate Domain** to get a `*.up.railway.app` URL
3. Or add a custom domain

## Step 7: Verify Deployment

```bash
# Health check
curl https://<your-domain>/healthz
# Expected: 200 OK

# Ready check
curl https://<your-domain>/readyz
# Expected: 200 OK

# Instance info
curl https://<your-domain>/.well-known/spacebar
# Expected: JSON with endpoint information
```

## Step 8: Post-Deployment Configuration

After the first boot, the server creates default configuration entries in the database. Update these to match your Railway domain. You can do this by setting the `CONFIG_PATH` env var to point to a JSON config file, or by updating the config directly in the database.

Key config values to update (replace `your-domain.up.railway.app` with your actual domain):

- **API endpoint**: `https://your-domain.up.railway.app/api/v9`
- **CDN endpoint**: `https://your-domain.up.railway.app`
- **Gateway endpoint**: `wss://your-domain.up.railway.app`

## Architecture Notes

The server runs in **bundle mode**, which combines the API, CDN, and Gateway servers into a single process on a single port. This is ideal for Railway's single-service model.

- **API** — HTTP REST API (Discord-compatible)
- **CDN** — File uploads/downloads (avatars, attachments, etc.)
- **Gateway** — WebSocket server (real-time events)

All three share the same port that Railway assigns via the `PORT` environment variable.

## Troubleshooting

### Build fails with native module errors
The Dockerfile installs `python3`, `make`, and `g++` for compiling native modules (`bcrypt`, `node-zstd`, `fast-zlib`). If builds still fail, check Railway build logs for specific missing system dependencies.

### Database connection errors
- Verify `DATABASE` is set to `${{Postgres.DATABASE_URL}}` (not `DATABASE_URL`)
- Check that the PostgreSQL service is running in your Railway project
- The health check endpoint `/healthz` returns 503 when the database is not connected

### First boot is slow
The initial deployment runs database migrations, which can take a while. The `railway.json` sets a 300-second health check timeout to accommodate this. Subsequent deploys will be faster.

### Files lost after redeploy
Add a persistent volume mounted at `/app/files` (see Step 4). Without a volume, the container filesystem is ephemeral.

### WebSocket connections fail
Railway supports WebSocket connections by default. Ensure clients connect using `wss://` (not `ws://`) since Railway terminates TLS.
