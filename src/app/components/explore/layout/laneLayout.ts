import type { XYPosition } from '@xyflow/react';
import type { ExploreNodeKind } from '../types';

// Layout deterministico a 3 corsie: collection · query · chart
export const LANE_X: Record<ExploreNodeKind, number> = {
  collection: 60,
  query: 480,
  chart: 900,
};
export const LANE_TOP = 50;
export const LANE_GAP = 160;

export function positionInLane(kind: ExploreNodeKind, index: number): XYPosition {
  return { x: LANE_X[kind], y: LANE_TOP + index * LANE_GAP };
}
