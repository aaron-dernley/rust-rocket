use axum::Json;
use chrono::Utc;
use serde_json::{json, Value};

pub async fn health_handler() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "timestamp": Utc::now()
    }))
}
