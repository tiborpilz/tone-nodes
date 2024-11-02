'use client';
import { useState, useEffect, useMemo } from 'react';
import { ToneAudioNode, PolySynth, Frequency, now } from 'tone';
import * as Tone from 'tone';
import classNames from 'classnames';
import {
  ReactFlow,
  Controls,
  Background,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import SynthProps from './SynthProps';
import SynthNode from '@/app/components/SynthNode';
import { addMidiListener } from '@/app/utils/midiListener';
import '@xyflow/react/dist/style.css';
import { ToneState, useStore, type AudioNode } from '@/app/store';

const selector = (store: ToneState) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
  addNode: store.addNode,
});

const nodeTypes = {
  synth: SynthNode,
};

/**
 * The audio workspace. Add/connect/edit/remove audio nodes.
 */
export default function Workspace() {
  const [audioNodes, setAudioNodes] = useState<Array<ToneAudioNode>>([]);
  const [activeAudioNode, setActiveAudioNode] = useState<ToneAudioNode | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Array<Node>>([]);

  const store = useStore(selector);

  Tone.getContext().lookAhead = 0;

  useEffect(() => {
    if (selectedNodes.length === 1) {
      makeActive(selectedNodes[0].data.audioNode as ToneAudioNode);
    }
  }, [selectedNodes]);

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
        nodeTypes={nodeTypes}
        nodes={store.nodes}
        edges={store.edges}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.addEdge}
        colorMode="system"
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <button onClick={() => store.addNode('Distortion')}>Create Distortion</button>
      <button onClick={() => store.addNode('Reverb')}>Create Reverb</button>
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
          </div>
        ))}
      </div>
      {activeAudioNode && activeAudioNode instanceof PolySynth && <SynthProps audioNode={activeAudioNode} />}
    </div>
  );
}
