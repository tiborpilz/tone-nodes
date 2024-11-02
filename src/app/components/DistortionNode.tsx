import React, { useReducer } from 'react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { type Distortion } from 'tone';
import { AudioNode } from '@/app/store';
import ParamInput from '@/app/components/ParamInput';

export default function SynthNode(props: NodeProps<AudioNode<Distortion>>) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleDistortion = (value: number) => {
    props.data.audioNode.distortion = value;
    forceUpdate();
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-[#1e1e1e]">
      <div>{ props.data.label as string }</div>

      <div className="grid grid-cols-[min-content_50px_1fr] gap-y-1 gap-x-2">
        <ParamInput
          param={props.data.audioNode.distortion}
          label="distortion"
          onChange={ handleDistortion }
        />
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
