export type NodeState = 'susceptible' | 'healthy' | 'at-risk' | 'infected' | 'vaccinated' | 'recovered' | 'collapsed';

export interface NodeHistory {
  time: number;
  state: NodeState;
  resourceAllocated: number;
  infectedPop: number;
  deaths: number;
  recoveries: number;
}

export interface PopulationStats {
  healthy: number;
  infected: number;
  recovered: number;
  dead: number;
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
  // Population-level tracking
  populationStats: PopulationStats;
  cumulativeDeaths: number;
  cumulativeRecoveries: number;
}

export interface SimulationEdge {
  source: string;
  target: string;
  weight: number;
}

export interface SimulationParams {
  infectionRate: number;
  recoveryRate: number;
  deathRate: number;
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
  // Population-level aggregates
  totalPopulation: number;
  totalInfectedPop: number;
  totalDeaths: number;
  totalRecoveries: number;
}

export interface HistoryPoint {
  time: number;
  infected: number;
  healthy: number;
  atRisk: number;
  collapsed: number;
  stress: number;
  deaths: number;
  recoveries: number;
  infectedPop: number;
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