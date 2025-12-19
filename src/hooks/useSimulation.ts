import { useState, useCallback, useRef, useEffect } from 'react';
import { SimulationNode, SimulationEdge, SimulationParams, SimulationMetrics, HistoryPoint, NodeState } from '@/types/simulation';

const generateInitialNodes = (count: number = 20): SimulationNode[] => {
  const names = [
    'Metro Alpha', 'District Beta', 'Zone Gamma', 'Sector Delta', 'Region Epsilon',
    'Area Zeta', 'Hub Eta', 'Node Theta', 'Cluster Iota', 'Zone Kappa',
    'Sector Lambda', 'Region Mu', 'Area Nu', 'Hub Xi', 'Node Omicron',
    'Cluster Pi', 'Zone Rho', 'Sector Sigma', 'Region Tau', 'Area Upsilon'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    name: names[i] || `Region ${i + 1}`,
    population: Math.floor(Math.random() * 900000) + 100000,
    state: 'susceptible' as NodeState,
    priority: Math.random(),
    x: Math.random() * 600 + 100,
    y: Math.random() * 400 + 50,
  }));
};

const generateEdges = (nodes: SimulationNode[]): SimulationEdge[] => {
  const edges: SimulationEdge[] = [];
  const nodeCount = nodes.length;
  
  // Create a connected graph with some additional random edges
  for (let i = 0; i < nodeCount; i++) {
    // Connect to next node (circular)
    edges.push({
      source: nodes[i].id,
      target: nodes[(i + 1) % nodeCount].id,
      weight: Math.random() * 0.5 + 0.3,
    });
    
    // Add some random connections
    if (Math.random() > 0.5) {
      const randomTarget = Math.floor(Math.random() * nodeCount);
      if (randomTarget !== i && randomTarget !== (i + 1) % nodeCount) {
        edges.push({
          source: nodes[i].id,
          target: nodes[randomTarget].id,
          weight: Math.random() * 0.3 + 0.1,
        });
      }
    }
  }
  
  return edges;
};

const defaultParams: SimulationParams = {
  infectionRate: 0.15,
  recoveryRate: 0.08,
  totalResources: 5,
  priorityWeight: 0.5,
  initialInfected: 2,
  timeStepSpeed: 500,
};

const defaultMetrics: SimulationMetrics = {
  totalInfected: 0,
  totalRecovered: 0,
  totalProtected: 0,
  totalSusceptible: 0,
  resourcesUsed: 0,
  peakInfection: 0,
  peakTime: 0,
  currentTime: 0,
};

export const useSimulation = () => {
  const [nodes, setNodes] = useState<SimulationNode[]>(() => generateInitialNodes());
  const [edges, setEdges] = useState<SimulationEdge[]>(() => generateEdges(generateInitialNodes()));
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [metrics, setMetrics] = useState<SimulationMetrics>(defaultMetrics);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef(0);

  const calculateMetrics = useCallback((currentNodes: SimulationNode[]): SimulationMetrics => {
    const infected = currentNodes.filter(n => n.state === 'infected').length;
    const recovered = currentNodes.filter(n => n.state === 'recovered').length;
    const protected_ = currentNodes.filter(n => n.state === 'protected').length;
    const susceptible = currentNodes.filter(n => n.state === 'susceptible').length;
    
    return {
      totalInfected: infected,
      totalRecovered: recovered,
      totalProtected: protected_,
      totalSusceptible: susceptible,
      resourcesUsed: protected_,
      peakInfection: Math.max(metrics.peakInfection, infected),
      peakTime: infected > metrics.peakInfection ? timeRef.current : metrics.peakTime,
      currentTime: timeRef.current,
    };
  }, [metrics.peakInfection, metrics.peakTime]);

  const step = useCallback(() => {
    setNodes(prevNodes => {
      const newNodes = [...prevNodes];
      const adjacencyList = new Map<string, string[]>();
      
      // Build adjacency list
      edges.forEach(edge => {
        if (!adjacencyList.has(edge.source)) adjacencyList.set(edge.source, []);
        if (!adjacencyList.has(edge.target)) adjacencyList.set(edge.target, []);
        adjacencyList.get(edge.source)!.push(edge.target);
        adjacencyList.get(edge.target)!.push(edge.source);
      });
      
      // Calculate which nodes to protect based on priority and resources
      const susceptibleNodes = newNodes
        .filter(n => n.state === 'susceptible')
        .sort((a, b) => {
          // Priority based on connectivity and priority weight
          const aConnections = adjacencyList.get(a.id)?.length || 0;
          const bConnections = adjacencyList.get(b.id)?.length || 0;
          const aScore = a.priority * params.priorityWeight + (aConnections / 10) * (1 - params.priorityWeight);
          const bScore = b.priority * params.priorityWeight + (bConnections / 10) * (1 - params.priorityWeight);
          return bScore - aScore;
        });
      
      const currentlyProtected = newNodes.filter(n => n.state === 'protected').length;
      const canProtect = Math.max(0, params.totalResources - currentlyProtected);
      
      // Protect high-priority susceptible nodes
      for (let i = 0; i < Math.min(canProtect, susceptibleNodes.length); i++) {
        const nodeIndex = newNodes.findIndex(n => n.id === susceptibleNodes[i].id);
        if (nodeIndex !== -1 && Math.random() < 0.3) { // Gradual protection
          newNodes[nodeIndex] = { ...newNodes[nodeIndex], state: 'protected' };
        }
      }
      
      // Process infections and recoveries
      newNodes.forEach((node, index) => {
        if (node.state === 'infected') {
          // Try to recover
          if (Math.random() < params.recoveryRate) {
            newNodes[index] = { ...node, state: 'recovered' };
          }
        } else if (node.state === 'susceptible') {
          // Check if neighbors are infected
          const neighbors = adjacencyList.get(node.id) || [];
          const infectedNeighbors = neighbors.filter(
            nId => newNodes.find(n => n.id === nId)?.state === 'infected'
          ).length;
          
          if (infectedNeighbors > 0) {
            const infectionProb = 1 - Math.pow(1 - params.infectionRate, infectedNeighbors);
            if (Math.random() < infectionProb) {
              newNodes[index] = { ...node, state: 'infected' };
            }
          }
        }
      });
      
      timeRef.current += 1;
      
      const newMetrics = calculateMetrics(newNodes);
      setMetrics(newMetrics);
      
      setHistory(prev => [...prev, {
        time: timeRef.current,
        infected: newMetrics.totalInfected,
        recovered: newMetrics.totalRecovered,
        protected: newMetrics.totalProtected,
        susceptible: newMetrics.totalSusceptible,
      }]);
      
      return newNodes;
    });
  }, [edges, params, calculateMetrics]);

  const start = useCallback(() => {
    if (isRunning && !isPaused) return;
    
    if (!isRunning) {
      // Initialize with infected nodes
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const shuffled = [...newNodes].sort(() => Math.random() - 0.5);
        for (let i = 0; i < params.initialInfected && i < shuffled.length; i++) {
          const idx = newNodes.findIndex(n => n.id === shuffled[i].id);
          if (idx !== -1) {
            newNodes[idx] = { ...newNodes[idx], state: 'infected' };
          }
        }
        const initialMetrics = calculateMetrics(newNodes);
        setMetrics(initialMetrics);
        setHistory([{
          time: 0,
          infected: initialMetrics.totalInfected,
          recovered: 0,
          protected: 0,
          susceptible: initialMetrics.totalSusceptible,
        }]);
        return newNodes;
      });
    }
    
    setIsRunning(true);
    setIsPaused(false);
    
    intervalRef.current = setInterval(step, params.timeStepSpeed);
  }, [isRunning, isPaused, params.initialInfected, params.timeStepSpeed, step, calculateMetrics]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const newNodes = generateInitialNodes();
    setNodes(newNodes);
    setEdges(generateEdges(newNodes));
    setMetrics(defaultMetrics);
    setHistory([]);
    setIsRunning(false);
    setIsPaused(false);
    timeRef.current = 0;
  }, []);

  const stepOnce = useCallback(() => {
    if (!isRunning) {
      // Initialize if not started
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const shuffled = [...newNodes].sort(() => Math.random() - 0.5);
        for (let i = 0; i < params.initialInfected && i < shuffled.length; i++) {
          const idx = newNodes.findIndex(n => n.id === shuffled[i].id);
          if (idx !== -1) {
            newNodes[idx] = { ...newNodes[idx], state: 'infected' };
          }
        }
        return newNodes;
      });
      setIsRunning(true);
      setIsPaused(true);
    }
    step();
  }, [isRunning, params.initialInfected, step]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update interval when speed changes
  useEffect(() => {
    if (isRunning && !isPaused && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(step, params.timeStepSpeed);
    }
  }, [params.timeStepSpeed, isRunning, isPaused, step]);

  return {
    nodes,
    edges,
    params,
    setParams,
    metrics,
    history,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
    stepOnce,
  };
};