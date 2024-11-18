import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

type TauriMidiPayload = {
  message: [number, number, number];
  id: number;
};

type MidiListener = (command: number, channel: number, velocity: number) => void;

let trainListener: MidiListener | null = null;
let trainListenerCleanup: (() => void) = () => {};

let channelListeners: Record<number, MidiListener> = {};
let initialized = false;
let resolveInitialized: () => void;
const midiListeners: Record<string, MidiListener> = {};
let midiListener: MidiListener | null;

export async function clearChannelMidiListeners() {
  await initMidi();
  channelListeners = [];
}

export function clearTrainMidiListener() {
  trainListener = null;
  trainListenerCleanup();
  trainListenerCleanup = () => {};
}

function handleMidiMessage(command: number, channel: number, velocity: number) {
  if (trainListener) {
    channelListeners[channel] = trainListener;
    clearTrainMidiListener();
  }

  if (channelListeners[channel]) {
    channelListeners[channel](command, channel, velocity);
  }

  if (midiListener) {
    midiListener(command, channel, velocity);
  }
  Object.values(midiListeners).forEach((listener) => {
    listener(command, channel, velocity);
  });
}

export async function initMidi() {
  if (initialized) {
    return;
  }

  const initPromise = new Promise<void>((resolve) => {
    resolveInitialized = resolve;
  });

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((midiAccess) => {
      midiAccess.inputs.forEach((input) => {
        console.log('Adding midi input listener', input);
        input.addEventListener('midimessage', (message) => {
          if (message.data === null) {
            return;
          }

          const [command, channel, velocity] = Array.from(message.data);
          handleMidiMessage(command, channel, velocity);
        });
      });
      resolveInitialized();
    });
  // Otherwise, listen for messages from Tauri
  } else {
    listen<TauriMidiPayload>('midi_message', (event) => {
      if (event.payload.message === null) {
        return;
      }

      const [command, channel, velocity] = event.payload.message;
      handleMidiMessage(command, channel, velocity);
    })

    invoke('open_midi_connection', { inputIdx: 1 });
    resolveInitialized();
  }

  initialized = true;
  return initPromise;
}

export async function trainMidiListener(listener: MidiListener, cleanup?: () => void) {
  await initMidi();
  trainListener = listener;

  if (cleanup) {
    trainListenerCleanup = cleanup;
  }
}

export async function addMidiListener(id: string, listener: MidiListener) {
  console.log('Adding midi listener', id);
  midiListeners[id] = listener;
}

export async function removeMidiListener(id: string) {
  console.log('Removing midi listener', id);
  delete midiListeners[id];
}

export async function setMidiListener(listener: MidiListener) {
  await initMidi();
  console.log('setting midi listener');
  midiListener = listener;
}

export async function unsetMidiListener() {
  await initMidi();
  console.log('unsetting midi listener');
  midiListener = null;
}
