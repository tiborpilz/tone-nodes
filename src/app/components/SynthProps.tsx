'use client';
import { ToneAudioNode, Synth, Param } from 'tone';
import ParamInput from './ParamInput';

function isSynth(audioNode: ToneAudioNode): audioNode is Synth {
  return audioNode instanceof Synth;
}

export default function SynthProps({
  audioNode,
}: {
  audioNode: ToneAudioNode,
}) {
  const synthParams = Object.entries(audioNode).filter((
    ([, value]) => value instanceof Param
  ));

  return (
    <div>
      <h2>Synth Properties</h2>
      {
        isSynth(audioNode) &&
          <button onClick={() => audioNode.triggerAttackRelease('C4', '8n')}>Play</button>
      }
      {
        synthParams.map(([key, value]) => (
          <div key={key}>
            <ParamInput
              label={key}
              param={value}
            />
          </div>
        ))
      }
    </div>
  );
}
