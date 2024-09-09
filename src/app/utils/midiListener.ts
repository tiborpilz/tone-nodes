import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

type TauriMidiMessage = {
  event: 'midi_message';
  payload: {
    message: [number, number, number];
    id: number;
  };
};

export default async function midiListener(
  listener: (command: number, note: number, velocity: number) => void,
) {
  // try to use browser's native Web MIDI API if available
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((midiAccess) => {
      midiAccess.inputs.forEach((input) => {
        input.onmidimessage = (message) => {
          const [command, note, velocity] = message.data;
          listener(command, note, velocity);
        };
      });
    });
  // Otherwise, listen for messages from Tauri
  } else {
    listen('midi_message', (event: TauriMidiMessage) => {
      listener(...event.payload.message);
    })

    invoke('open_midi_connection', { inputIdx: 1 });
  }
}
