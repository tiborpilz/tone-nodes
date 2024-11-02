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
  Synth,
  getDestination,
  Signal,
} from 'tone';

// export type AudioNode = {
//   data: Node['data'] & { audioNode: ToneAudioNode },
// } & Node;

export type AudioNode<T = ToneAudioNode> = Node<{ audioNode: T, label: string }>

export type SignalNode = {
  data: Node['data'] & { signal: Signal },
} & Node;

type ToneNodeType =
  | 'Oscillator'
  | 'Gain'
  | 'Distortion'
  | 'Destination'
  | 'Reverb'
  | 'Synth';

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
): AudioNode {
  const baseNode = {
    id: nanoid(6),
    data: { label: type },
    position,
  };

  switch (type) {
    case 'Oscillator':
      return {
        ...baseNode,
        type: 'input',
        data: {
          label: 'Oscillator',
          audioNode: new Oscillator(),
        },
      };
    case 'Gain':
      return {
        ...baseNode,
        data: {
          label: 'Gain',
          audioNode: new Gain(),
        },
      };
    case 'Distortion':
      return {
        ...baseNode,
        data: {
          label: 'Distortion',
          audioNode: new Distortion(),
        },
      };
    case 'Destination':
      return {
        ...baseNode,
        type: 'output',
        data: {
          label: 'Destination',
          audioNode: getDestination(),
        },
      };
    case 'Reverb':
      return {
        ...baseNode,
        data: {
          label: 'Reverb',
          audioNode: new Reverb(),
        },
      };
    case 'Synth':
      return {
        ...baseNode,
        type: 'synth',
        data: {
          label: 'Synth',
          audioNode: new Synth(),
        },
      };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

export type ToneState = {
  nodes: Array<AudioNode>,
  edges: Array<Edge>,

  onNodesChange(changes: Array<NodeChange<AudioNode>>): void,
  onEdgesChange(changes: Array<EdgeChange<Edge>>): void,
  addEdge(edge: Omit<Edge, 'id'>): void,
  addNode(type: ToneNodeType): void,
};

export const useStore = create<ToneState>()((set, get) => ({
  nodes: [
    createToneNode('Synth', { x: 0, y: 100 }),
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
        source.data.audioNode.disconnect();
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
      source.data.audioNode.disconnect();
      source.data.audioNode.connect(target.data.audioNode);
      if ('start' in source.data.audioNode && typeof source.data.audioNode.start === 'function') {
        source.data.audioNode.start();
      }
    }
  },

  addNode(type) {
    const { x, y } = findFreeCoordinates(get().nodes);
    const node = createToneNode(type, { x, y });
    set({ nodes: [...get().nodes, node] });
  },
}));
