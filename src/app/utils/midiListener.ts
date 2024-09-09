import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

type TauriMidiPayload = {
  message: [number, number, number];
  id: number;
};

const listeners: Array<(command: number, note: number, velocity: number) => void> = [];
let initialized = false;
let resolveInitialized: () => void;

async function initMidi() {
  if (initialized) {
    return;
  }

  const initPromise = new Promise<void>((resolve) => {
    resolveInitialized = resolve;
  });

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((midiAccess) => {
      midiAccess.inputs.forEach((input) => {
        input.addEventListener('midimessage', (message) => {
          if (message.data === null) {
            return;
          }
          const [command, note, velocity] = Array.from(message.data);
          listeners.forEach(listener => listener(command, note, velocity));
        });
      });
      resolveInitialized();
    });
  // Otherwise, listen for messages from Tauri
  } else {
    listen<TauriMidiPayload>('midi_message', (event) => {
      listeners.forEach(listener => listener(...event.payload.message));
    })

    invoke('open_midi_connection', { inputIdx: 1 });
    resolveInitialized();
  }

  initialized = true;
  return initPromise;
}

export default async function midiListener(
  listener: (command: number, note: number, velocity: number) => void,
) {
  console.log('Number of listeners: ', listeners.length);
  await initMidi();
  listeners.push(listener);
  // // try to use browser's native Web MIDI API if available
  // if (navigator.requestMIDIAccess) {
  //   navigator.requestMIDIAccess().then((midiAccess) => {
  //     midiAccess.inputs.forEach((input) => {
  //       input.addEventListener('midimessage', (message) => {
  //         if (message.data === null) {
  //           return;
  //         }
  //         const [command, note, velocity] = Array.from(message.data);
  //         listener(command, note, velocity);
  //       });
  //     });
  //   });
  // // Otherwise, listen for messages from Tauri
  // } else {
  //   listen<TauriMidiPayload>('midi_message', (event) => {
  //     listener(...event.payload.message);
  //   })

  //   invoke('open_midi_connection', { inputIdx: 1 });
  // }
}
