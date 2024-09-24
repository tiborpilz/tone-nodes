import { ReactFlowProvider } from '@xyflow/react';
import { Workspace } from '@/app/components';

export default function Home() {
  return (
    <ReactFlowProvider>
      <Workspace />
    </ReactFlowProvider>
  );
}
