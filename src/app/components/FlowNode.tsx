import { PropsWithChildren } from 'react';

export default function FlowNode({ children }: PropsWithChildren) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-[#1e1e1e]">
      {children}
    </div>
  );
}
