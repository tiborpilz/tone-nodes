use std::sync::{Arc, Mutex};

#[cfg(not(target_os = "android"))]
use midir::{Ignore, MidiInput, MidiInputConnection};

use tauri::{Manager, Window, Wry, Emitter};
use serde::{Serialize};

#[cfg(not(target_os = "android"))]
#[derive(Default)]
pub struct MidiState {
  pub input: Mutex<Option<MidiInputConnection<()>>>
}

#[cfg(target_os = "android")]
#[derive(Default)]
pub struct MidiState { }


#[cfg(not(target_os = "android"))]
#[derive(Clone, Serialize)]
struct MidiMessage {
  message: Vec<u8>
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
fn open_midi_connection(
  midi_state: tauri::State<'_, MidiState>,
  window: Window<Wry>,
  input_idx: usize
) {
  let handle = Arc::new(window).clone();
  let mut midi_in = MidiInput::new("My Test Input").unwrap();
  midi_in.ignore(Ignore::None);
  let midi_in_ports = midi_in.ports();
  if let Some(in_port) = midi_in_ports.get(input_idx) {
    let conn_in = midi_in.connect(in_port, "midir-test", move |stamp, message, _log| {
      let _ = handle.emit("midi_message",  MidiMessage { message: message.to_vec() });

      println!("{}: {:?} (len = {})", stamp, message, message.len());
    }, ()).unwrap();
    *midi_state.input.lock().unwrap() = Some(conn_in);
  }
}

#[cfg(target_os="android")]
#[tauri::command]
fn open_midi_connection(
  _midi_state: tauri::State<'_, MidiState>,
  _window: Window<Wry>,
  _input_idx: usize
) {
  println!("MIDI not supported on Android");
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        let window = app.get_webview_window("main").unwrap();
        window.open_devtools();
        window.close_devtools();
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![open_midi_connection])
    .manage(MidiState { ..Default::default() })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
