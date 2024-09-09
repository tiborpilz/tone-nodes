'use client';
import { Synth } from 'tone';
import ParamInput from './ParamInput';

export default function SynthProps({
  synth,
}: {
  synth: Synth
}) {
  return (
    <div>
      <h2>Synth Properties</h2>
      <button onClick={() => synth.triggerAttackRelease('C4', '8n')}>Play</button>
      <ParamInput
        label="Volume"
        param={synth.volume}
      />
    </div>
  );
}
