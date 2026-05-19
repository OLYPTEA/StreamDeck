// =============================================================================
// lib.rs — Backend Rust Tauri pour Kore Deck
// =============================================================================

use std::sync::{Arc, Mutex};
use std::process::Child;
use serde::{Deserialize, Serialize};
use env_logger;

pub struct AgentProcess(pub Arc<Mutex<Option<Child>>>);

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SerialPort {
    pub name:        String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppVersion {
    pub app:      String,
    pub firmware: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProfileExport {
    pub version:  String,
    pub exported: String,
    pub profiles: serde_json::Value,
}

// Commands in a submodule to avoid macro namespace collision with Rust 1.82+
mod commands {
    use std::process::Command;
    use tauri::{AppHandle, Manager, State};
    use super::{AgentProcess, AppVersion, SerialPort};

    #[tauri::command]
    pub fn list_serial_ports() -> Vec<SerialPort> {
        match serialport::available_ports() {
            Ok(ports) => ports.into_iter().map(|p| SerialPort {
                name: p.port_name.clone(),
                description: match p.port_type {
                    serialport::SerialPortType::UsbPort(info) =>
                        format!("{} ({})",
                            info.manufacturer.unwrap_or_default(),
                            info.product.unwrap_or_default()),
                    _ => "Port série".to_string(),
                },
            }).collect(),
            Err(e) => { log::warn!("Ports série : {}", e); vec![] }
        }
    }

    #[tauri::command]
    pub fn start_agent(port: String, agent_process: State<'_, AgentProcess>, app: AppHandle) -> Result<String, String> {
        let mut guard = agent_process.0.lock().map_err(|e| e.to_string())?;
        if let Some(ref mut child) = *guard {
            if let Ok(None) = child.try_wait() { return Ok("already_running".to_string()); }
        }
        let agent_path = app.path().resource_dir().map_err(|e| e.to_string())?
            .join("agent").join("agent.py");
        let child = Command::new("python").arg(&agent_path).arg("--port").arg(&port)
            .spawn().map_err(|e| format!("Démarrage agent : {}", e))?;
        *guard = Some(child);
        log::info!("Agent démarré sur {}", port);
        Ok("started".to_string())
    }

    #[tauri::command]
    pub fn stop_agent(agent_process: State<'_, AgentProcess>) -> Result<String, String> {
        let mut guard = agent_process.0.lock().map_err(|e| e.to_string())?;
        if let Some(ref mut child) = *guard {
            child.kill().map_err(|e| format!("Arrêt agent : {}", e))?;
            *guard = None;
            return Ok("stopped".to_string());
        }
        Ok("not_running".to_string())
    }

    #[tauri::command]
    pub fn get_agent_status(agent_process: State<'_, AgentProcess>) -> String {
        let mut guard = match agent_process.0.lock() { Ok(g) => g, Err(_) => return "error".to_string() };
        match &mut *guard {
            None => "stopped".to_string(),
            Some(child) => match child.try_wait() {
                Ok(None)    => "running".to_string(),
                Ok(Some(_)) => { *guard = None; "stopped".to_string() }
                Err(_)      => "error".to_string(),
            },
        }
    }

    #[tauri::command]
    pub fn get_app_version() -> AppVersion {
        AppVersion { app: env!("CARGO_PKG_VERSION").to_string(), firmware: "v2.0.0".to_string() }
    }

    #[tauri::command]
    pub fn set_autostart(enabled: bool, _app: AppHandle) -> Result<(), String> {
        #[cfg(target_os = "windows")]
        {
            let exe = std::env::current_exe().map_err(|e| e.to_string())?.to_string_lossy().to_string();
            if enabled {
                Command::new("reg").args(["add", r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run", "/v", "KoreDeck", "/t", "REG_SZ", "/d", &exe, "/f"]).output().map_err(|e| e.to_string())?;
            } else {
                Command::new("reg").args(["delete", r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run", "/v", "KoreDeck", "/f"]).output().map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }

    #[tauri::command]
    pub fn export_config(profiles_json: String) -> Result<String, String> {
        let profiles: serde_json::Value = serde_json::from_str(&profiles_json).map_err(|e| e.to_string())?;
        let export = serde_json::json!({ "version": "2.0", "exported": chrono::Utc::now().to_rfc3339(), "profiles": profiles });
        serde_json::to_string_pretty(&export).map_err(|e| e.to_string())
    }

    #[tauri::command]
    pub fn import_config(json_str: String) -> Result<serde_json::Value, String> {
        let val: serde_json::Value = serde_json::from_str(&json_str).map_err(|_| "JSON invalide".to_string())?;
        if val.get("version").and_then(|v| v.as_str()) != Some("2.0") {
            return Err("Version incompatible".to_string());
        }
        Ok(val["profiles"].clone())
    }

    #[tauri::command]
    pub fn open_app_dir(app: AppHandle) -> Result<(), String> {
        let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
        #[cfg(target_os = "windows")] { Command::new("explorer").arg(&dir).spawn().map_err(|e| e.to_string())?; }
        #[cfg(target_os = "macos")]   { Command::new("open").arg(&dir).spawn().map_err(|e| e.to_string())?; }
        #[cfg(target_os = "linux")]   { Command::new("xdg-open").arg(&dir).spawn().map_err(|e| e.to_string())?; }
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(
        env_logger::Env::default().default_filter_or("info")
    ).init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .manage(AgentProcess(Arc::new(Mutex::new(None))))
        .invoke_handler(tauri::generate_handler![
            commands::list_serial_ports,
            commands::start_agent,
            commands::stop_agent,
            commands::get_agent_status,
            commands::get_app_version,
            commands::set_autostart,
            commands::export_config,
            commands::import_config,
            commands::open_app_dir,
        ])
        .run(tauri::generate_context!())
        .expect("Erreur Tauri");
}
