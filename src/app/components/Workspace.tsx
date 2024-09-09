'use client';
import { useState } from 'react';
import { ToneAudioNode, Synth } from 'tone';
import classNames from 'classnames';
import SynthProps from './SynthProps';

/**
 * The audio workspace. Add/connect/edit/remove audio nodes.
 */
export default function Workspace() {
  const [audioNodes, setAudioNodes] = useState<Array<ToneAudioNode>>([]);
  const [activeAudioNode, setActiveAudioNode] = useState<ToneAudioNode | null>(null);

  const createSynth = () => {
    const synth = new Synth().toDestination();
    setAudioNodes([...audioNodes, synth]);
  };

  const removeAudioNode = (audioNode: ToneAudioNode) => {
    audioNode.dispose();
    setAudioNodes(audioNodes.filter((n) => n !== audioNode));
    if (activeAudioNode === audioNode) {
      setActiveAudioNode(null);
    }
  }

  return (
    <div>
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
