# Admin API and Dashboard Reimplementation Plan

## Objective

Reimplement the C# `extra/admin-api` admin surface as a TypeScript admin backend plus a Next.js dashboard, while reusing the existing Spacebar server auth, entities, config, and event systems.

This plan is for the separate worktree at:

```text
/Users/user/Developer/Developer/spacebarchat/server-admin-api-next-plan
```

Branch:

```text
admin-api-next-dashboard-plan
```

## Core Decision

Build a dedicated admin boundary in TypeScript instead of directly copying the C# project structure.

- UI: `apps/admin-dashboard`
- Server-only admin domain code: `src/admin`
- Data access: existing TypeORM entities from `@spacebar/util`
- Auth and rights: existing `checkToken`, `Rights`, and API auth patterns
- Events: existing `emitEvent` transport
- Admin API route prefix: `/_spacebar/admin/api/*`
- Dashboard route prefix: `/_spacebar/admin/*`

Do not merge AdminApi, UApi, CDN, and gateway offload into one feature. They have different audiences and safety properties.

## Backend Scope

Port the C# AdminApi surface first, then build the dashboard against it.

Initial admin routes:

- `GET /ping`
- `GET /whoami`
- `GET /users`
- `GET /users/:id`
- `POST /users/:id/delete`
- `GET /guilds`
- `POST /guilds/:id/force-join`
- `DELETE /channels/:id`
- `GET /discovery/guilds`
- `GET /discovery/guilds/:id`
- `PATCH /discovery/guilds/:id`
- `GET /configuration`
- `PUT /configuration`
- `POST /configuration/reload`
- `GET /media/users/:id/attachments`
- `GET /media/stickers`

Keep UApi and gateway offload separate. Only port them if the explicit objective becomes replacing those services too.

## Module Boundaries

### `admin/auth`

Validate Spacebar tokens using the existing TS token path, then enforce `OPERATOR`.

Rules:

- Never trust UI-only checks.
- Reject disabled/deleted users through the normal token path.
- Do not duplicate right math.
- Prefer existing `route({ right: ... })` style where it fits.

### `admin/dto`

Return explicit admin DTOs.

Rules:

- Do not return raw TypeORM entities to the dashboard.
- Keep private fields intentional.
- Use projections for list views.
- Include counts needed by the UI without loading entire relation graphs.

### `admin/db`

Thin repository/query helpers over existing entities.

Rules:

- Use pagination and search on every list endpoint.
- Avoid unbounded `find()` on `User`, `Guild`, `Message`, `Attachment`, and `Session`.
- Prefer query builders for count-heavy admin tables.

### `admin/events`

Central wrapper around `emitEvent` for admin-triggered changes.

Required event parity:

- Channel deletion emits `CHANNEL_DELETE`.
- User deletion/session invalidation emits `SB_SESSION_REMOVE` where applicable.
- Bulk message removal emits `MESSAGE_DELETE_BULK` or the existing project event spelling expected by listeners.
- Config updates emit `SB_RELOAD_CONFIG`.

### `admin/config`

Support the existing TS config system intentionally.

Rules:

- Handle DB-backed config.
- Handle `CONFIG_PATH` JSON config.
- Make readonly JSON config failures explicit.
- Never silently write config to the wrong backend.

### `admin/jobs`

Long-running and destructive admin work belongs in jobs, not request handlers.

Job candidates:

- User deletion and message cleanup
- Channel cleanup
- CDN fsck
- CDN migration
- Large attachment/user media scans

Jobs need:

- ID
- status
- progress counters
- structured result
- error list
- cancellation story where practical
- idempotency key for dangerous operations

## Dashboard Scope

Build a dense operational dashboard, not a marketing UI.

Initial sections:

- Overview
- Users
- User detail
- Guilds
- Guild detail
- Discovery management
- Channels
- Media: stickers and user attachments
- Configuration editor
- Jobs
- Audit/activity

Next.js implementation rules:

- Use Server Components for list/detail data loading.
- Keep mutations in Server Actions or route handlers.
- Recheck admin auth in every mutation.
- Use client components only for interactive tables, filters, modals, and progress views.
- Avoid client-side direct privileged calls to the main API.
- Keep payloads small; do not serialize full entity graphs into client components.

## Behavioral Changes From C#

These are intentional breaking changes:

- Replace destructive `GET` routes with `POST` or `DELETE`.
- Replace streaming delete responses with job progress.
- Add pagination to admin list endpoints.
- Add explicit audit metadata for destructive actions.
- Make config persistence mode visible and enforced.

## Migration Order

1. Create `admin-core` or `src/admin` with auth guard, DTOs, query helpers, event wrapper, and config helpers.
2. Port read-only routes: users, guilds, discovery, configuration, stickers, attachments.
3. Port small mutations: discovery patch, config reload, channel delete.
4. Convert destructive flows into jobs: user delete, bulk message cleanup, CDN fsck/migration.
5. Build `apps/admin-dashboard` as a Next app against the admin API.
6. Add tests for auth boundaries, DTO projections, event emission, config persistence, and job progress.
7. Remove or deprecate the C# admin surface only after TS parity is verified.

## Verification Plan

Required checks before considering the implementation complete:

- Admin routes reject unauthenticated users.
- Admin routes reject authenticated non-`OPERATOR` users.
- Admin list endpoints are paginated.
- Admin DTOs do not expose raw sensitive fields by accident.
- Channel delete emits the expected event and removes the channel.
- Config reload emits `SB_RELOAD_CONFIG`.
- Config writes behave correctly in DB and JSON config modes.
- User deletion runs as a job and records progress/errors.
- Dashboard cannot perform mutations without server-side admin auth.
- Existing `npm run build:src` still passes.
- Dashboard build passes.

## Working Prompt For Future Agents

You are working in:

```text
/Users/user/Developer/Developer/spacebarchat/server-admin-api-next-plan
```

Your task is to implement the TypeScript admin API and Next.js admin dashboard described in `docs/admin-api-next-dashboard-plan.md`.

Follow these rules:

1. Update `docs/admin-api-next-dashboard-progress.md` before and after each meaningful work block.
2. Keep the progress file factual: current goal, changed files, verification run, blockers, and next step.
3. Do not edit the original `server` worktree.
4. Reuse existing TS server auth, entities, config, and event systems.
5. Do not expose raw TypeORM entities from admin endpoints.
6. Do not implement destructive admin actions as `GET`.
7. Prefer breaking changes over symptom patches when the C# behavior is unsafe.
8. Add tests around auth boundaries and destructive operations before wiring the UI.
9. Keep UApi, CDN, and gateway offload separate unless the objective explicitly expands.
10. Before stopping, run the narrowest relevant verification and record the result in the progress file.

Progress entry template:

```md
## YYYY-MM-DD HH:mm TZ - Short Goal

Status: planned | in-progress | blocked | complete

Changed files:

- path/to/file

What changed:

- Concise factual summary.

Verification:

- Command: `...`
- Result: pass | fail | not run
- Notes: ...

Risks or blockers:

- ...

Next step:

- ...
```
