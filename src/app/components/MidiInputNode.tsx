import { Handle, NodeProps, Position } from '@xyflow/react';

import FlowNode from '@/app/components/FlowNode';
import { MidiNode } from '../store';

export default function MidiInputNode(props: NodeProps<MidiNode>) {
  return <FlowNode>
    <div>{ props.data.label as string }</div>
    <Handle
      type="source"
      position={Position.Right}
    />
  </FlowNode>
}
