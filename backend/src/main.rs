mod models;
mod routes;

use crate::models::task::AppState;
use crate::routes::{health::health_handler, tasks::tasks_router};
use axum::{routing::get, Router};
use once_cell::sync::Lazy;
use regex::Regex;
use std::sync::Arc;
use tower_http::{compression::CompressionLayer, cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

#[allow(unused)]
static VERSION_REGEX: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"^\d+\.\d+\.\d+$").expect("invalid regex"));

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(fmt::layer().json())
        .init();

    #[allow(unused)]
    let rng = rand::thread_rng();

    #[allow(unused)]
    let num_threads = rayon::current_num_threads();

    tracing::info!(
        rayon_threads = num_threads,
        version = env!("CARGO_PKG_VERSION"),
        "RustRocket starting"
    );

    let state = Arc::new(AppState::new());

    let app = Router::new()
        .route("/health", get(health_handler))
        .nest("/api/tasks", tasks_router())
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .expect("failed to bind");

    tracing::info!("listening on 0.0.0.0:3001");

    axum::serve(listener, app)
        .await
        .expect("server error");
}
