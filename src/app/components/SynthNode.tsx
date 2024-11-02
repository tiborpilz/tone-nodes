import React, { memo, useReducer } from 'react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { Envelope, Synth } from 'tone';
import { AudioNode } from '@/app/store';

export default function SynthNode(props: NodeProps<AudioNode<Synth>>) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleEnvelopeChange = (envelope: Envelope, key: 'attack' | 'decay' | 'sustain' | 'sustain' | 'release', value: number) => {
    envelope[key] = value;
    forceUpdate();
  };
  const handleChange = (param: AudioParam, value: number) => {
    param.value = value;
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-[#1e1e1e]">
      <div>{ props.data.label as string }</div>

      <div className="grid grid-cols-[min-content_50px_1fr] gap-y-1 gap-x-2">
        { ['attack', 'decay', 'sustain', 'release'].map((key) => (
          <>
            <div>{ key }</div>
            <input
              className="text-black"
              onChange={ (e) => handleEnvelopeChange(props.data.audioNode.envelope, key as 'attack' | 'decay' | 'sustain' | 'release', parseFloat(e.target.value)) }
              value={ props.data.audioNode.envelope[key as 'attack' | 'decay' | 'sustain' | 'release'].toString() }
            />
            <input
              className="nodrag"
              type="range"
              min="0"
              max="1"
              step="0.01"
              onChange={ (e) => handleEnvelopeChange(props.data.audioNode.envelope, key as 'attack' | 'decay' | 'sustain' | 'release', parseFloat(e.target.value)) }
              value={ props.data.audioNode.envelope[key as 'attack' | 'decay' | 'sustain' | 'release'].toString() }
            />
          </>
        )) }
      </div>
      <Handle
        type="target"
        position={Position.Left}
      />
      <Handle
        type="source"
        id="a"
        position={Position.Right}
      />
      <Handle
        type="source"
        id="b"
        style={{ top: 0 }}
        position={Position.Right}
      />
    </div>
  );
}
