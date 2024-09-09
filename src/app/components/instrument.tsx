'use client';
import * as Tone from 'tone';
import React from 'react';

type InstrumentName = 'AMSynth' | 'PluckSynth';
export type InstrumentOptionMap = {
  AMSynth: Tone.AMSynthOptions;
  PluckSynth: Tone.PluckSynthOptions;
};

function getInstrumentOptions(name: InstrumentName) {
  return Tone[name].getDefaults();
}

export default function Instrument<T extends InstrumentName>({
  type,
}: { type: T }) {
  const options = getInstrumentOptions(type);

  return (
    <div>
      <pre>{ JSON.stringify(options, null, 2) }</pre>
    </div>
  );
}
