import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
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
  Frequency,
  Gain,
  Distortion,
  Reverb,
  Synth,
  getDestination,
  now,
} from 'tone';
import { addMidiListener, initMidi } from './utils/midiListener';

type AudioNodeType =
  | 'Oscillator'
  | 'Gain'
  | 'Distortion'
  | 'Destination'
  | 'Reverb'
  | 'Synth'
  | 'Midi';

type MidiNodeType = 'MidiInput';
type GenericNodeType = AudioNodeType | MidiNodeType;

type BaseData = {
  label: string,
  nodeType: GenericNodeType,
};

/**
 * Audio Node, anything that inputs and/or outputs Tone.js audio
 * Can be `.connect`ed to other AudioNodes
 */
type AudioNodeData<T = ToneAudioNode> = BaseData & { audioNode: T };
export type AudioNode<T = ToneAudioNode> = Node<AudioNodeData<T>>;
function isAudioNode(node: Node): node is AudioNode {
  return 'audioNode' in node.data;
}

/**
 * Midi Node, custom format for handling midi input (via callbacks)
 */
type MidiNodeData = BaseData & { midiCallback: (value: number) => void };
export type MidiNode = Node<MidiNodeData>;
function isMidiNode(node: Node): node is MidiNode {
  return 'midiCallback' in node.data;
}

type GenericNode = AudioNode | MidiNode;

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
  type: GenericNodeType,
  position: { x: number, y: number } = { x: 0, y: 0 },
): AudioNode | MidiNode {
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
          nodeType: type,
        },
      };
    case 'Gain':
      return {
        ...baseNode,
        data: {
          label: 'Gain',
          audioNode: new Gain(),
          nodeType: type,
        },
      };
    case 'Distortion':
      return {
        ...baseNode,
        type: 'distortion',
        data: {
          label: 'Distortion',
          audioNode: new Distortion(),
          nodeType: type,
        },
      };
    case 'Destination':
      return {
        ...baseNode,
        type: 'output',
        data: {
          label: 'Destination',
          audioNode: getDestination(),
          nodeType: type,
        },
      };
    case 'Reverb':
      return {
        ...baseNode,
        data: {
          label: 'Reverb',
          audioNode: new Reverb(),
          nodeType: type,
        },
      };
    case 'Synth':
      return {
        ...baseNode,
        type: 'synth',
        data: {
          label: 'Synth',
          audioNode: new Synth(),
          nodeType: type,
        },
      };
    case 'MidiInput':
      const midiCallback: (value: number) => void = () => {};
      const data = {
        label: 'Midi Input',
        midiCallback,
        nodeType: type,
      };
      initMidi();
      addMidiListener(baseNode.id, (command: number, midiNote?: number, velocity?: number) => {
        console.log('midi input', command, midiNote, velocity);

        if (midiNote === undefined) {
          return;
        }

        data.midiCallback(midiNote);
      });

      return {
        ...baseNode,
        data,
        type: 'midiInput',
      };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

export type ToneState = {
  nodes: Array<GenericNode>,
  edges: Array<Edge>,

  onNodesChange(changes: Array<NodeChange<GenericNode>>): void,
  onEdgesChange(changes: Array<EdgeChange<Edge>>): void,
  addEdge(edge: Omit<Edge, 'id'>): void,
  addNode(type: GenericNodeType): void,
};

export const useStore = create<ToneState>()((set, get) => ({
  nodes: [
    createToneNode('MidiInput', { x: 0, y: 100 }),
    createToneNode('Synth', { x: 50, y: 100 }),
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

      if (source && isAudioNode(source)) {
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
      source.type

      if (isAudioNode(source) && isAudioNode(target)) {
        source.data.audioNode.disconnect();
        source.data.audioNode.connect(target.data.audioNode);

        if ('start' in source.data.audioNode && typeof source.data.audioNode.start === 'function') {
          source.data.audioNode.start();
        }
      }

      if (isMidiNode(source) && isAudioNode(target)) {
        source.data.midiCallback = (note) => {
          if ('triggerAttackRelease' in target.data.audioNode && typeof target.data.audioNode.triggerAttackRelease === 'function') {
            console.log('triggering attack release', note);
            const timeNow = now();
            target.data.audioNode.triggerAttackRelease(Frequency(note, 'midi').toFrequency(), '32n', timeNow);
          }
        }
      }
    }
  },

  addNode(type) {
    const { x, y } = findFreeCoordinates(get().nodes);
    const node = createToneNode(type, { x, y });
    set({ nodes: [...get().nodes, node] });
  },
}));

export function useConnectionValidator(store: ToneState) {
  return (connection: Edge | Connection) => {

    const source = store.nodes.find(node => node.id === connection.source);
    const target = store.nodes.find(node => node.id === connection.target);

    if (source && target) {
      if (isAudioNode(source) && isAudioNode(target)) {
        return true;
      }

      if (isMidiNode(source) && isAudioNode(target) && connection.targetHandle === 'midi') {
        return true;
      }
    }
    return false;
  };
}
