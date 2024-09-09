'use client';

/* import { useState } from 'react'; */
import { listen, emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';
import { useState } from 'react';

type MidiMessage = {
  event: 'midi_message';
  payload: {
    message: [number, number, number];
    id: number;
  };
};

export default function VisualizeMidi({
  triggerMidi
}: {
  triggerMidi: (note?: number) => void
}) {
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  listen('midi_message', (event: MidiMessage) => {
    setLastMessage(JSON.stringify(event.payload.message));
    if (event.payload.message.at(0) === 144) {
      triggerMidi(event.payload.message.at(1));
    }
  })

  invoke('open_midi_connection', { inputIdx: 1 });

  return (
    <div>
      <h1>Visualize Midi</h1>
      <pre>last message: {lastMessage}</pre>
    </div>
  );
}
