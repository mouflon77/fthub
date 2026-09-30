'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Loader } from '@/components/ui/Loader';
import { ScrollSync } from '@/components/ui/ScrollSync';

// WebGL never renders on the server, and keeping three out of the server bundle
// keeps the first paint to markup and CSS.
const Garden = dynamic(() => import('./Garden'), { ssr: false });

export function Stage() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <Garden onReady={() => setReady(true)} />
      <div className="veil" aria-hidden="true" />
      <ScrollSync />
      <Loader done={ready} />
    </>
  );
}
