use tauri::{Manager, State};
use std::sync::RwLock;
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "settings.json";
const API_KEY_FIELD: &str = "dashscope_api_key";

pub struct ApiKeyState {
    pub dashscope: RwLock<Option<String>>,
}

#[tauri::command]
pub async fn get_api_key(
    app: tauri::AppHandle,
    state: State<'_, ApiKeyState>,
) -> Result<Option<String>, String> {
    {
        let cached = state.dashscope.read().unwrap().clone();
        if cached.is_some() {
            return Ok(cached);
        }
    }
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    let value = store.get(API_KEY_FIELD).and_then(|v| v.as_str().map(String::from));
    if let Some(ref key) = value {
        *state.dashscope.write().unwrap() = Some(key.clone());
    }
    Ok(value)
}

#[tauri::command]
pub async fn set_api_key(
    app: tauri::AppHandle,
    state: State<'_, ApiKeyState>,
    key: String,
) -> Result<(), String> {
    *state.dashscope.write().unwrap() = Some(key.clone());
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    store.set(API_KEY_FIELD.to_string(), serde_json::Value::String(key));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let dir = Manager::path(&app).app_data_dir().map_err(|e| e.to_string())?;
    Ok(dir.to_string_lossy().into_owned())
}
