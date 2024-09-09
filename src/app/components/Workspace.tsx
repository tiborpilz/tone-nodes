'use client';
import { useState } from 'react';
import { ToneAudioNode, Synth, Frequency, now } from 'tone';
import classNames from 'classnames';
import SynthProps from './SynthProps';
import VisualizeMidi from './VisualizeMidi';

/**
 * The audio workspace. Add/connect/edit/remove audio nodes.
 */
export default function Workspace() {
  const [audioNodes, setAudioNodes] = useState<Array<ToneAudioNode>>([]);
  const [activeAudioNode, setActiveAudioNode] = useState<ToneAudioNode | null>(null);

  const createSynth = () => {
    const synth = new Synth().toDestination();

    synth.set({
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.1
      }
    });
    setAudioNodes([...audioNodes, synth]);
  };

  const removeAudioNode = (audioNode: ToneAudioNode) => {
    audioNode.dispose();
    setAudioNodes(audioNodes.filter((n) => n !== audioNode));
    if (activeAudioNode === audioNode) {
      setActiveAudioNode(null);
    }
  }

  const triggerActiveSynth = (midiNote?: number) => {
    if (activeAudioNode instanceof Synth && midiNote !== undefined) {
      const timeNow = now();
      activeAudioNode.triggerAttackRelease(Frequency(midiNote, 'midi').toFrequency(), '32n', timeNow);
    }
  }

  return (
    <div>
      <VisualizeMidi triggerMidi={triggerActiveSynth} />
      <button onClick={createSynth}>Create Synth</button>
      <div>
        {audioNodes.map((audioNode, index) => (
          <div
            key={index}
            className={classNames(
              'flex justify-between items-center border border-gray-300 p-2',
              activeAudioNode === audioNode && 'bg-gray-900'
            )}
          >
            <button onClick={() => setActiveAudioNode(audioNode)}>Edit</button>
            <button onClick={() => removeAudioNode(audioNode)}>Remove</button>
          </div>
        ))}
      </div>
      {activeAudioNode && <SynthProps audioNode={activeAudioNode} />}
    </div>
  );
}
