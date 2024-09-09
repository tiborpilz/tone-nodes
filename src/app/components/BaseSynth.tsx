'use client';
import * as Tone from 'tone';
import React from 'react';
import dynamic from 'next/dynamic';

type SynthName = 'AMSynth' | 'PluckSynth';

export type InstrumentOptionMap = {
  AMSynth: Tone.AMSynthOptions;
  PluckSynth: Tone.PluckSynthOptions;
};

function BaseSynth<T extends SynthName>({
  type,
}: { type: T }) {

  const toneInstrument = new Tone[type]().toDestination();

  const triggerAttack = async () => {
    const now = Tone.now();
    toneInstrument.triggerAttackRelease('C4', '16n', now);
  };

  return (
    <div>
      <button onClick={triggerAttack}>Trigger Attack</button>
      <ul>
        {
          Object.keys(toneInstrument).map((key) => {
            return (
              <li key={key}>
                <label>{key}</label>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
}

const BaseSynthComponent = dynamic(() => Promise.resolve(BaseSynth), {
  ssr: false,
});

export default BaseSynthComponent;
