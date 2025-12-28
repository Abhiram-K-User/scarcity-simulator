export type NodeState = 'healthy' | 'at-risk' | 'infected' | 'collapsed';

export interface NodeHistory {
  time: number;
  state: NodeState;
  resourceAllocated: number;
}

export interface SimulationNode {
  id: string;
  name: string;
  population: number;
  state: NodeState;
  x?: number;
  y?: number;
  priority: number;
  history: NodeHistory[];
  resourceAllocated: number;
  riskScore: number;
  infectedAt?: number;
  collapsedAt?: number;
}

export interface SimulationEdge {
  source: string;
  target: string;
  weight: number;
}

export interface SimulationParams {
  infectionRate: number;
  recoveryRate: number;
  totalResources: number;
  priorityWeight: number;
  initialInfected: number;
  timeStepSpeed: number;
  uncertaintyEnabled: boolean;
  delayedEffects: boolean;
}

export interface SimulationMetrics {
  totalInfected: number;
  totalHealthy: number;
  totalAtRisk: number;
  totalCollapsed: number;
  resourcesUsed: number;
  peakInfection: number;
  peakTime: number;
  currentTime: number;
  systemStress: number;
}

export interface HistoryPoint {
  time: number;
  infected: number;
  healthy: number;
  atRisk: number;
  collapsed: number;
  stress: number;
}

export interface Snapshot {
  time: number;
  label: string;
  nodes: SimulationNode[];
  metrics: SimulationMetrics;
}

export interface SimulationState {
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  params: SimulationParams;
  metrics: SimulationMetrics;
  history: HistoryPoint[];
  snapshots: Snapshot[];
  isRunning: boolean;
  isPaused: boolean;
}