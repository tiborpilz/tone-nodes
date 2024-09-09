'use client';
import { ToneAudioNode, Synth, PolySynth, Param } from 'tone';
import { useState } from 'react';
import ParamInput from './ParamInput';

type SynthLike = Synth | PolySynth;

function isSynthLike(audioNode: ToneAudioNode): audioNode is SynthLike {
  return audioNode instanceof Synth || audioNode instanceof PolySynth;
}

export default function SynthProps({
  audioNode,
}: {
  audioNode: ToneAudioNode,
}) {
  const synthParams = Object.entries(audioNode).filter((
    ([, value]) => value instanceof Param
  ));

  const [envelope, setEnvelope] = useState({
    attack: 0.1,
    decay: 0.1,
    sustain: 0.5,
    release: 0.5,
  });

  const envelopeParams = Object.entries(envelope);

  return (
    <div>
      <h2>Synth Properties</h2>
      {
        isSynthLike(audioNode) &&
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
      {
        envelopeParams.map(([key, value]) => (
          <div key={key}>
            <ParamInput
              label={key}
              param={value}
              onChange={(newValue) => {
                setEnvelope({
                  ...envelope,
                  [key]: newValue,
                });

                audioNode.set({
                  envelope,
                });
              }}
            />
          </div>
        ))
      }
    </div>
  );
}
