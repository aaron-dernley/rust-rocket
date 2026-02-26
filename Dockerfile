# ─── Stage 1: Rust builder ──────────────────────────────────────────────────
FROM rust:1.88-slim-bookworm AS rust-builder

WORKDIR /app/backend

RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

COPY backend/Cargo.toml backend/Cargo.lock ./

# Dummy-main trick: compile dependencies once, then swap in real source
RUN mkdir src && echo 'fn main() {}' > src/main.rs && \
    cargo build --release && \
    rm -f target/release/deps/rust_rocket*

COPY backend/src ./src
RUN cargo build --release

# ─── Stage 2: Node builder ───────────────────────────────────────────────────
FROM node:20-slim AS node-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .

ENV NEXT_PUBLIC_API_URL=http://localhost:3001
RUN npm run build

# ─── Stage 3: Final image ────────────────────────────────────────────────────
FROM node:20-slim AS final

WORKDIR /app

COPY --from=rust-builder /app/backend/target/release/rust-rocket ./rust-rocket
COPY --from=node-builder /app/frontend/.next/standalone ./frontend/
COPY --from=node-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=node-builder /app/frontend/public ./frontend/public
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000 3001

CMD ["./docker-entrypoint.sh"]
