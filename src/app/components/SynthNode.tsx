import React, { memo, useReducer } from 'react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { Envelope, Synth } from 'tone';
import { AudioNode } from '@/app/store';
import ParamInput from '@/app/components/ParamInput';

export default function SynthNode(props: NodeProps<AudioNode<Synth>>) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleEnvelopeChange = (envelope: Envelope, key: 'attack' | 'decay' | 'sustain' | 'sustain' | 'release', value: number) => {
    envelope[key] = value;
    forceUpdate();
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-[#1e1e1e]">
      <div>{ props.data.label as string }</div>

      <div className="grid grid-cols-[min-content_50px_1fr] gap-y-1 gap-x-2">
        { ['attack', 'decay', 'sustain', 'release'].map((key) => (
          <ParamInput
            key={key}
            param={props.data.audioNode.envelope[key as 'attack' | 'decay' | 'sustain' | 'release']}
            label={key}
            onChange={ (value) => handleEnvelopeChange(props.data.audioNode.envelope, key as 'attack' | 'decay' | 'sustain' | 'release', value) }
          />
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
