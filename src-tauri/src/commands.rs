use tauri::{Manager, State};
use std::sync::RwLock;

pub struct ApiKeyState {
    pub dashscope: RwLock<Option<String>>,
}

#[tauri::command]
pub async fn get_api_key(state: State<'_, ApiKeyState>) -> Result<Option<String>, String> {
    Ok(state.dashscope.read().unwrap().clone())
}

#[tauri::command]
pub async fn set_api_key(
    state: State<'_, ApiKeyState>,
    key: String,
) -> Result<(), String> {
    *state.dashscope.write().unwrap() = Some(key);
    Ok(())
}

#[tauri::command]
pub async fn get_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let dir = Manager::path(&app).app_data_dir().map_err(|e| e.to_string())?;
    Ok(dir.to_string_lossy().into_owned())
}
