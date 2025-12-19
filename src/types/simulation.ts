export type NodeState = 'susceptible' | 'infected' | 'recovered' | 'protected';

export interface SimulationNode {
  id: string;
  name: string;
  population: number;
  state: NodeState;
  x?: number;
  y?: number;
  priority: number;
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
}

export interface SimulationMetrics {
  totalInfected: number;
  totalRecovered: number;
  totalProtected: number;
  totalSusceptible: number;
  resourcesUsed: number;
  peakInfection: number;
  peakTime: number;
  currentTime: number;
}

export interface HistoryPoint {
  time: number;
  infected: number;
  recovered: number;
  protected: number;
  susceptible: number;
}

export interface SimulationState {
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  params: SimulationParams;
  metrics: SimulationMetrics;
  history: HistoryPoint[];
  isRunning: boolean;
  isPaused: boolean;
}