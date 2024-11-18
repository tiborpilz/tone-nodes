'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ToneAudioNode } from 'tone';
import * as Tone from 'tone';
import classNames from 'classnames';
import {
  ReactFlow,
  Controls,
  Background,
  type Node,
  useOnSelectionChange,
} from '@xyflow/react';
import SynthNode from '@/app/components/SynthNode';
import DistortionNode from '@/app/components/DistortionNode';
import MidiInputNode from '@/app/components/MidiInputNode';
import { initMidi } from '@/app/utils/midiListener';
import '@xyflow/react/dist/style.css';
import { ToneState, useConnectionValidator, useStore } from '@/app/store';

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
  distortion: DistortionNode,
  midiInput: MidiInputNode,
};

/**
 * The audio workspace. Add/connect/edit/remove audio nodes.
 */
export default function Workspace() {
  const [audioNodes, setAudioNodes] = useState<Array<ToneAudioNode>>([]);
  const [activeAudioNode, setActiveAudioNode] = useState<ToneAudioNode | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Array<Node>>([]);

  const store = useStore(selector);

  initMidi();

  Tone.getContext().lookAhead = 0;

  useEffect(() => {
    if (selectedNodes.length === 1) {
      makeActive(selectedNodes[0].data.audioNode as ToneAudioNode);
    }
  }, [selectedNodes]);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Array<Node> }) => {
    console.log(nodes);
    setSelectedNodes(nodes);
  }, []);

  useOnSelectionChange({
    onChange: onSelectionChange,
  });

  const makeActive = (audioNode: ToneAudioNode) => {
    setActiveAudioNode(audioNode);
  }

  return (
    <div className="h-[50vh]">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={store.nodes}
        edges={store.edges}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.addEdge}
        isValidConnection={useConnectionValidator(store)}
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
    </div>
  );
}
