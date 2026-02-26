use crate::models::task::{AppState, CreateTaskRequest, Task, UpdateTaskRequest};
use anyhow::anyhow;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

pub struct AppError(anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": self.0.to_string() })),
        )
            .into_response()
    }
}

impl<E: Into<anyhow::Error>> From<E> for AppError {
    fn from(err: E) -> Self {
        AppError(err.into())
    }
}

pub async fn list_tasks(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Task>>, AppError> {
    let tasks = state.tasks.lock().await;
    let mut task_list: Vec<Task> = tasks.values().cloned().collect();
    task_list.sort_by(|a, b| a.created_at.cmp(&b.created_at));
    Ok(Json(task_list))
}

pub async fn create_task(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateTaskRequest>,
) -> Result<(StatusCode, Json<Task>), AppError> {
    payload
        .validate()
        .map_err(|e| AppError(anyhow!("{}", e)))?;

    let now = Utc::now();
    let task = Task {
        id: Uuid::new_v4(),
        title: payload.title,
        description: payload.description,
        completed: false,
        created_at: now,
        updated_at: now,
    };

    let mut tasks = state.tasks.lock().await;
    tasks.insert(task.id, task.clone());

    Ok((StatusCode::CREATED, Json(task)))
}

pub async fn get_task(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Task>, AppError> {
    let tasks = state.tasks.lock().await;
    let task = tasks
        .get(&id)
        .cloned()
        .ok_or_else(|| AppError(anyhow!("Task not found")))?;
    Ok(Json(task))
}

pub async fn update_task(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateTaskRequest>,
) -> Result<Json<Task>, AppError> {
    payload
        .validate()
        .map_err(|e| AppError(anyhow!("{}", e)))?;

    let mut tasks = state.tasks.lock().await;
    let task = tasks
        .get_mut(&id)
        .ok_or_else(|| AppError(anyhow!("Task not found")))?;

    if let Some(title) = payload.title {
        task.title = title;
    }
    if payload.description.is_some() {
        task.description = payload.description;
    }
    if let Some(completed) = payload.completed {
        task.completed = completed;
    }
    task.updated_at = Utc::now();

    Ok(Json(task.clone()))
}

pub async fn delete_task(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let mut tasks = state.tasks.lock().await;
    if tasks.remove(&id).is_none() {
        return Err(AppError(anyhow!("Task not found")));
    }
    Ok(StatusCode::NO_CONTENT)
}

pub fn tasks_router() -> axum::Router<Arc<AppState>> {
    use axum::routing::get;
    axum::Router::new()
        .route("/", get(list_tasks).post(create_task))
        .route("/:id", get(get_task).put(update_task).delete(delete_task))
}
