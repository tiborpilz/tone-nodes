'use client';
import { useState } from 'react';
import { Synth } from 'tone';
import classNames from 'classnames';
import SynthProps from './SynthProps';

/**
 * The audio workspace. Add/connect/edit/remove audio nodes.
 */
export default function Workspace() {
  const [synths, setSynths] = useState<Array<Synth>>([]);
  const [activeSynth, setActiveSynth] = useState<Synth | null>(null);

  const createSynth = () => {
    const synth = new Synth().toDestination();
    setSynths([...synths, synth]);
  };

  const removeSynth = (synth: Synth) => {
    synth.dispose();
    setSynths(synths.filter((s) => s !== synth));
    if (activeSynth === synth) {
      setActiveSynth(null);
    }
  }

  return (
    <div>
      <button onClick={createSynth}>Create Synth</button>
      <div>
        {synths.map((synth, index) => (
          <div
            key={index}
            className={classNames(
              'flex justify-between items-center border border-gray-300 p-2',
              activeSynth === synth && 'bg-gray-900'
            )}
          >
            <button onClick={() => setActiveSynth(synth)}>Edit</button>
            <button onClick={() => removeSynth(synth)}>Remove</button>
          </div>
        ))}
      </div>
      {activeSynth && <SynthProps synth={activeSynth} />}
    </div>
  );
}
