#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use std::env;

#[tauri::command]
fn get_platform() -> String {
  #[cfg(target_os = "windows")]
  return "windows".to_string();
  
  #[cfg(target_os = "macos")]
  return "macos".to_string();
  
  #[cfg(target_os = "linux")]
  return "linux".to_string();
  
  return "unknown".to_string();
}

fn main() {
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");
  let close = CustomMenuItem::new("close".to_string(), "Close");
  let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
  let menu = Menu::new()
    .add_native_item(MenuItem::Copy)
    .add_submenu(submenu);

  tauri::Builder::default()
    .menu(menu)
    .invoke_handler(tauri::generate_handler![get_platform])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
