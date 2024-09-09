import dynamic from 'next/dynamic';

export const Workspace = dynamic(() => import('./Workspace'), {
  ssr: false,
});
