'use client';
import { ToneAudioNode, Synth, PolySynth, Param } from 'tone';
import { useState } from 'react';
import ParamInput from './ParamInput';

type SynthLike = Synth | PolySynth;

function isSynthLike(audioNode: ToneAudioNode): audioNode is SynthLike {
  return audioNode instanceof Synth || audioNode instanceof PolySynth;
}

type ParamWithHandler =
  | [string, number, (newValue: number) => void]
  | [string, Param<'number'>, (newValue: number) => void];

export default function SynthProps({
  audioNode,
}: {
  audioNode: ToneAudioNode,
}) {
  const [envelope, setEnvelope] = useState({
    attack: 0.1,
    decay: 0.1,
    sustain: 0.5,
    release: 0.5,
  });

  const synthParams = Object
    .entries(audioNode)
    .filter(([, v]) => v instanceof Param)
    .map(([key, value]) => [
      key,
      value,
      (newValue: unknown) => {
        audioNode.set({
          [key]: newValue,
        })
      }
    ]) as Array<ParamWithHandler>;

  const envelopeParams = Object
    .entries(envelope)
    .map(([key, value]) => [
      key,
      value,
      (newValue: number) => {
        console.log('setting envelope', key, newValue)
        setEnvelope({
          ...envelope,
          [key]: newValue,
        })

        if (!isSynthLike(audioNode)) {
          return;
        }
        audioNode.set({
          envelope,
        })
      }
    ]) as Array<ParamWithHandler>;

  const params: Array<ParamWithHandler> = [
    ...synthParams,
    ...envelopeParams,
  ]

  return (
    <div>
      <h2>Synth Properties</h2>
      {
        isSynthLike(audioNode) &&
          <button onClick={() => audioNode.triggerAttackRelease('C4', '8n')}>Play</button>
      }
      {
        params.map(([key, value, callback]) => (
          <div key={key}>
            <ParamInput
              label={key}
              param={value}
              onChange={callback}
            />
          </div>
        ))
      }
    </div>
  );
}
