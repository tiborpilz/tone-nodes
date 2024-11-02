'use client';
import { useState, useEffect } from 'react';
import { ToneAudioNode, PolySynth, Frequency, now } from 'tone';
import * as Tone from 'tone';
import classNames from 'classnames';
import {
  ReactFlow,
  Controls,
  Background,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import SynthProps from './SynthProps';
import { addMidiListener } from '@/app/utils/midiListener';
import '@xyflow/react/dist/style.css';
import { ToneState, useStore } from '@/app/store';

const selector = (store: ToneState) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
});

/**
 * The audio workspace. Add/connect/edit/remove audio nodes.
 */
export default function Workspace() {
  const [audioNodes, setAudioNodes] = useState<Array<ToneAudioNode>>([]);
  const [activeAudioNode, setActiveAudioNode] = useState<ToneAudioNode | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Array<Node>>([]);
  const { fitView } = useReactFlow();

  const store = useStore(selector);

  Tone.getContext().lookAhead = 0;

  const createSynth = () => {
    const polySynth = new PolySynth(Tone.Synth);

    setAudioNodes([...audioNodes, polySynth]);
    // TODO: Add a node to the store
  };

  const createDistortion = () => {
    const distortion = new Tone.Distortion(1).toDestination();
    distortion.oversample = '4x';

    selector.node
  };

  const createReverb = () => {
    const reverb = new Tone.Reverb(1).toDestination();

    setAudioNodes([...audioNodes, reverb]);
  };

  useEffect(() => {
    if (selectedNodes.length === 1) {
      makeActive(selectedNodes[0].data.audioNode as ToneAudioNode);
    }
  }, [selectedNodes]);

  const removeAudioNode = (audioNode: ToneAudioNode) => {
    audioNode.dispose();
    setAudioNodes(audioNodes.filter((n) => n !== audioNode));
    if (activeAudioNode === audioNode) {
      setActiveAudioNode(null);
    }
  }

  const triggerActiveSynth = (command: number, midiNote?: number, velocity?: number) => {
    console.log('triggerActiveSynth', command, midiNote, velocity);
    if (
      activeAudioNode instanceof PolySynth
      && midiNote !== undefined
      && command === 144
    ) {
      const timeNow = now();
      activeAudioNode.triggerAttackRelease(Frequency(midiNote, 'midi').toFrequency(), '32n', timeNow, velocity);
    }
  }

  const makeActive = (audioNode: ToneAudioNode) => {
    setActiveAudioNode(audioNode);
  }

  addMidiListener(triggerActiveSynth);



  return (
    <div className="h-[50vh]">
      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.addEdge}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <button onClick={createSynth}>Create Synth</button>
      <button onClick={createDistortion}>Create Distortion</button>
      <button onClick={createReverb}>Create Reverb</button>
      <div>
        {audioNodes.map((audioNode, index) => (
          <div
            key={index}
            className={classNames(
              'flex justify-between items-center border border-gray-300 p-2',
              activeAudioNode === audioNode && 'bg-gray-900'
            )}
          >
            <button onClick={() => makeActive(audioNode)}>Edit</button>
            <button onClick={() => removeAudioNode(audioNode)}>Remove</button>
          </div>
        ))}
      </div>
      {activeAudioNode && activeAudioNode instanceof PolySynth && <SynthProps audioNode={activeAudioNode} />}
    </div>
  );
}
