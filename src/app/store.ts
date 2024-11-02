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
  Reverb,
  getDestination,
} from 'tone';

export type ToneNode = {
  audioNode: ToneAudioNode,
} & Node;

type ToneNodeType =
  | 'Oscillator'
  | 'Gain'
  | 'Distortion'
  | 'Destination'
  | 'Reverb';


function findFreeCoordinates(nodes: Array<Node>): { x: number, y: number } {
  const coordinates = nodes.map(node => node.position);
  const minX = Math.min(...coordinates.map(c => c.x));
  const maxY = Math.max(...coordinates.map(c => c.y));

  return {
    x: minX,
    y: maxY + 100,
  };
}

function createToneNode(
  type: ToneNodeType,
  position: { x: number, y: number } = { x: 0, y: 0 },
): ToneNode {
  switch (type) {
    case 'Oscillator':
      return {
        id: nanoid(6),
        data: { label: 'oscillator' },
        position,
        audioNode: new Oscillator(),
      };
    case 'Gain':
      return {
        id: nanoid(6),
        data: { label: 'gain' },
        position,
        audioNode: new Gain(),
      };
    case 'Distortion':
      return {
        id: nanoid(6),
        data: { label: 'distortion' },
        position,
        audioNode: new Distortion(),
      };
    case 'Destination':
      return {
        id: nanoid(6),
        data: { label: 'destination' },
        position,
        audioNode: getDestination(),
      };
    case 'Reverb':
      return {
        id: nanoid(6),
        data: { label: 'reverb' },
        position,
        audioNode: new Reverb(),
      };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

export type ToneState = {
  nodes: Array<ToneNode>,
  edges: Array<Edge>,

  onNodesChange(changes: Array<NodeChange<ToneNode>>): void,
  onEdgesChange(changes: Array<EdgeChange<Edge>>): void,
  addEdge(edge: Omit<Edge, 'id'>): void,
  addNode(type: ToneNodeType): void,
};

export const useStore = create<ToneState>()((set, get) => ({
  nodes: [
    createToneNode('Oscillator', { x: 100, y: 100 }),
    createToneNode('Gain', { x: 300, y: 100 }),
    createToneNode('Distortion', { x: 500, y: 100 }),
    createToneNode('Destination', { x: 700, y: 100 }),
  ],
  edges: [],

  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange(changes) {
    const removedEdges = changes.filter(change => change.type === 'remove');
    removedEdges.forEach((change) => {
      const edge = get().edges.find(edge => edge.id === change.id);
      if (!edge) return;

      const source = get().nodes.find(node => node.id === edge.source);

      if (source) {
        source.audioNode.disconnect();
      }
    });

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
      if ('start' in source.audioNode && typeof source.audioNode.start === 'function') {
        source.audioNode.start();
      }
    }
  },

  addNode(type) {
    const { x, y } = findFreeCoordinates(get().nodes);
    const node = createToneNode(type, { x, y });
    set({ nodes: [...get().nodes, node] });
  },
}));
