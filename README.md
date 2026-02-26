# 🚀 RustRocket

A full-stack task management app built as a CI/CD benchmark — Rust/Axum backend + Next.js frontend — with two GitHub Actions pipelines: a deliberately slow baseline and a fully optimised [Namespace](https://namespace.so) pipeline.

The goal is to make the speed difference between uncached and Namespace-cached CI painfully obvious.

---

## Architecture

| Component | Stack | Port |
|---|---|---|
| Backend API | Rust + Axum | 3001 |
| Frontend | Next.js 14 + Tailwind | 3000 |
| Packaging | Docker multi-stage | — |

The Rust backend exposes a CRUD REST API (`/api/tasks`) backed by an in-memory store. The Next.js frontend fetches and displays tasks. The intentionally heavy dependency set (~300+ crates, dual hyper versions) maximises cold compile time to make the benchmark meaningful.

---

## Local Development

### Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api/tasks
- Health: http://localhost:3001/health

### Without Docker

**Backend:**
```bash
cd backend
cargo run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Frontend tests:**
```bash
cd frontend
npm test
```

---

## Setting Up Namespace

1. Sign up at [app.namespace.so](https://app.namespace.so)
2. Connect your GitHub organisation under **Settings → GitHub Integration**
3. Create a runner profile named exactly **`default`** (so it matches `namespace-profile-default` in the workflow)
4. Attach a **cache volume of ≥ 20 GB** to the profile — this is where Rust registry, cargo git index, `target/`, and `node_modules/` are stored on NVMe
5. Push to `main` or open a PR — both workflows trigger automatically

---

## Expected Build Times

| Job | Baseline | Namespace (cold) | Namespace (warm) |
|---|---|---|---|
| rust-check (clippy) | ~8–12 min | ~8–12 min | ~30–60 sec |
| rust-test | ~10–14 min | ~10–14 min | ~1–2 min |
| rust-build (release) | ~12–18 min | ~12–18 min | ~1–3 min |
| frontend jobs (each) | ~2–3 min | ~2–3 min | ~15–30 sec |
| docker-build | ~15–20 min | ~2–4 min | ~30–60 sec |
| **Total wall-clock** | **~25–40 min** | **~15–20 min** | **~3–6 min** |

Namespace cold runs are similar to the baseline because the cache is empty. The dramatic improvement shows on the second and subsequent runs once the cache is warm.

---

## Why So Many Rust Dependencies?

The dependency set is intentionally heavy:

- **`reqwest 0.11`** alongside **`axum 0.7`** (which uses hyper 1.x) forces Cargo to compile **two incompatible versions of hyper** (0.14 and 1.x) — roughly doubling HTTP-layer compile time
- **`rayon`**, **`regex`**, **`validator`** each pull in multiple proc-macro crates, which compile serially
- **`tracing-subscriber`** with `json` and `env-filter` features adds significant compile weight
- Total: ~300–350 crates, ~12–18 minutes cold on a standard `ubuntu-latest` runner

This is representative of a real production Rust service — the benchmark isn't artificially inflated.

---

## Measuring Results

1. Push a commit to `main`
2. Go to **GitHub → your repo → Actions**
3. Both workflows (`CI Baseline` and `CI Namespace`) trigger in parallel
4. Click into each job to see per-step timing
5. On subsequent pushes, Namespace warm times should be 5–10× faster

---

## Workflows

| File | Runner | Caching |
|---|---|---|
| `.github/workflows/ci-baseline.yml` | `ubuntu-latest` | None |
| `.github/workflows/ci-namespace.yml` | `namespace-profile-default` | Rust + Node via `nscloud-cache-action`, Docker layers via Namespace Remote Builders |
