'use client';

import { useMemo } from 'react';
import { buildCircuitNetwork } from '@/lib/circuit/network';
import { Chips } from './Chips';
import { Gears } from './Gears';
import { Mist } from './Mist';
import { Nodes } from './Nodes';
import { Pillars } from './Pillars';
import { Traces } from './Traces';

/** Assembles the edge-weighted kinetic PCB for a quality tier. */
export function CircuitStage({
  nodes,
  gears,
  pillars,
  chips,
}: {
  nodes: number;
  gears: number;
  pillars: number;
  chips: number;
}) {
  const network = useMemo(
    () => buildCircuitNetwork(nodes, gears, pillars, chips),
    [nodes, gears, pillars, chips],
  );

  return (
    <group>
      <Mist />
      <Traces edges={network.edges} />
      <Nodes nodes={network.nodes} />
      <Gears specs={network.gears} />
      <Pillars specs={network.pillars} />
      <Chips specs={network.chips} />
    </group>
  );
}
