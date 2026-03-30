# Replace Dockerized Services with Desktop-Native Components

## Summary
For this repo, the best default is **not** “pick one option for everything.” The correct target is:

- `rag-api` -> **collapse into app-owned commands/in-process logic**
- `rag-worker` -> **collapse into app-owned async job execution**, not a persistent service
- `postgres` -> **replace with SQLite**
- `qdrant` -> **use a Tauri sidecar first** if we keep the current engine; do **not** use a LaunchAgent by default

Given the current code and the chosen defaults, **Tauri sidecar is the right option only for the vector engine or any future heavy helper**. **LaunchAgent/helper is not justified** unless product requirements change to require indexing/query availability after the app fully closes.

## Key Changes
- Remove the localhost HTTP boundary for app-internal calls.
  The current FastAPI routes in [`app/api/routes/ingests.py`](/Users/novelbamboo/Desktop/github/cutr-rag/app/api/routes/ingests.py), [`app/api/routes/query.py`](/Users/novelbamboo/Desktop/github/cutr-rag/app/api/routes/query.py), and [`app/api/routes/health.py`](/Users/novelbamboo/Desktop/github/cutr-rag/app/api/routes/health.py) should become app commands/events rather than a packaged internal API server.
- Eliminate the separate worker process.
  The polling loop in [`app/worker.py`](/Users/novelbamboo/Desktop/github/cutr-rag/app/worker.py) is only DB-backed orchestration; it should become app-managed background jobs or a short-lived helper task, not a standalone daemon.
- Replace PostgreSQL with SQLite.
  The current DB usage in [`app/db/models.py`](/Users/novelbamboo/Desktop/github/cutr-rag/app/db/models.py) is metadata, ingest status, and query logs. That is desktop-local state and fits SQLite cleanly.
- Keep Qdrant out of Docker by bundling it as a sidecar first.
  The vector dependency in [`app/retrieval/vector_store.py`](/Users/novelbamboo/Desktop/github/cutr-rag/app/retrieval/vector_store.py) is the only component that behaves like a real external engine. Use a native bundled binary or equivalent local engine behind a sidecar-style lifecycle before attempting a deeper Rust replacement.
- Do not introduce `launchd` now.
  With the selected lifecycle of “stop with app,” `launchd` adds persistence, signing, upgrade, and reconnect complexity without a matching UX need.

## Public Interfaces and Runtime Boundaries
- Replace HTTP endpoints with app-facing commands equivalent to:
  `create_ingest`, `get_ingest_status`, `delete_ingest`, `query`, `health`
- Replace DB-backed polling with explicit job orchestration:
  enqueue ingest, process ingest, emit progress, persist final status
- Storage contract should become:
  SQLite for metadata/logs, app data directory for uploads/manifests, local vector store data under app-managed storage
- If Qdrant remains:
  define a narrow IPC contract for upsert, delete-ingest, search, and health instead of exposing a casual localhost API

## Test Plan
- Verify ingest create/status/delete/query flows still match current behavior without internal HTTP.
- Verify app restart with no persistent helper: queued/running jobs are recovered or cleanly marked for retry.
- Verify SQLite behavior for ingest status transitions and query logging.
- Verify sidecar lifecycle for Qdrant: start on demand, health check, query, shutdown with app.
- Verify multi-project isolation and ingest-specific filtering still match current retrieval semantics.
- Verify first-run bootstrap creates app directories and local data stores without Docker.

## Assumptions
- The app does **not** need indexing or query infrastructure to survive after the main app exits.
- Offline/local vector search is still desired, so Qdrant remains local for now rather than moving remote.
- The migration should optimize for simplest shippable desktop architecture first, not for preserving the existing microservice boundaries.
- If later product requirements demand background sync/indexing after app shutdown, revisit only that helper as a `launchd` LaunchAgent. Do not generalize that model to the whole stack.
