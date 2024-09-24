'use client';
import { useState, useEffect, useCallback } from 'react';
import { ToneAudioNode, PolySynth, Frequency, now, context } from 'tone';
import * as Tone from 'tone';
import classNames from 'classnames';
import {
  ReactFlow,
  Controls,
  Background,
  useOnSelectionChange,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  useEdgesState,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import SynthProps from './SynthProps';
import { addMidiListener } from '@/app/utils/midiListener';
import '@xyflow/react/dist/style.css';

/**
 * The audio workspace. Add/connect/edit/remove audio nodes.
 */
export default function Workspace() {
  const [audioNodes, setAudioNodes] = useState<Array<ToneAudioNode>>([]);
  const [activeAudioNode, setActiveAudioNode] = useState<ToneAudioNode | null>(null);
  const [nodes, setNodes] = useState<Array<Node>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<Array<Node>>([]);

  context.lookAhead = 0;

  const createSynth = () => {
    const polySynth = new PolySynth(Tone.Synth);

    setAudioNodes([...audioNodes, polySynth]);
    setNodes([...nodes, {
      id: String(nodes.length),
      position: { x: 0, y: 0 },
      data: {
        label: 'Synth',
        audioNode: polySynth
      },
    }])
  };

  const createDistortion = () => {
    const distortion = new Tone.Distortion(1).toDestination();
    distortion.oversample = '4x';

    setAudioNodes([...audioNodes, distortion]);
    setNodes([...nodes, {
      id: String(nodes.length),
      position: { x: 0, y: 0 },
      data: {
        label: 'Distortion',
        audioNode: distortion
      },
    }])
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

  const onSelectionChange = useCallback(({ nodes }: { nodes: Array<Node> }) => {
    setSelectedNodes(nodes);
  }, []);

  const onNodesChange = useCallback((changes: Array<NodeChange<Node>>) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  const onConnect = (connection: Connection) => {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    const isSynthSource = sourceNode?.data.audioNode instanceof PolySynth;
    const isDistortionTarget = targetNode?.data.audioNode instanceof Tone.Distortion;

    if (isSynthSource && isDistortionTarget) {
      const synth = sourceNode?.data.audioNode as PolySynth;
      const distortion = targetNode?.data.audioNode as Tone.Distortion;

      synth.disconnect();

      synth.connect(distortion);
      setEdges((oldEdges) => addEdge(connection, oldEdges));
    }
  };

  addMidiListener(triggerActiveSynth);

  return (
    <div className="h-[50vh]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
      <button onClick={createSynth}>Create Synth</button>
      <button onClick={createDistortion}>Create Distortion</button>
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
