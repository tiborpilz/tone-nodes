import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import {
  ToneAudioNode,
  Oscillator,
  Gain,
  Distortion,
  getDestination,
} from 'tone';

type ToneNode = {
  audioNode: ToneAudioNode,
} & Node;

export type ToneState = {
  nodes: Array<ToneNode>,
  edges: Array<Edge>,

  onNodesChange(changes: Array<NodeChange<ToneNode>>): void,
  onEdgesChange(changes: Array<EdgeChange<Edge>>): void,
  addEdge(edge: Omit<Edge, 'id'>): void,
};

export const useStore = create<ToneState>()((set, get) => ({
  nodes: [
    {
      id: 'osc',
      data: { label: 'oscillator' },
      position: { x: 0, y: 0 },
      audioNode: new Oscillator(),
    },
    {
      id: 'gain',
      data: { label: 'gain' },
      position: { x: 50, y: 50 },
      audioNode: new Gain(),
    },
    {
      id: 'dist',
      data: { label: 'distorion' },
      position: { x: 50, y: 50 },
      audioNode: new Distortion(),
    },
    {
      id: 'dest',
      data: { label: 'destination' },
      position: { x: 50, y: 50 },
      audioNode: getDestination(),
    }
  ],
  edges: [],

  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange(changes) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  addEdge(data) {
    const id = nanoid(6);
    const edge = { ...data, id };

    set({ edges: [...get().edges, edge]})

    const source = get().nodes.find(node => node.id === edge.source);
    const target = get().nodes.find(node => node.id === edge.target);

    if (source && target) {
      source.audioNode.disconnect();
      source.audioNode.connect(target.audioNode);
    }
  },
}));
