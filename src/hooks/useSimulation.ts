import { useState, useCallback, useRef, useEffect } from 'react';
import { SimulationNode, SimulationEdge, SimulationParams, SimulationMetrics, HistoryPoint, NodeState, Snapshot, PopulationStats } from '@/types/simulation';
import { createPriorityQueue } from '@/lib/priorityQueue';

const createDefaultPopStats = (population: number): PopulationStats => ({
  healthy: population,
  infected: 0,
  recovered: 0,
  dead: 0,
});

const generateInitialNodes = (count: number = 16): SimulationNode[] => {
  const names = [
    'Metro Alpha', 'District Beta', 'Zone Gamma', 'Sector Delta', 
    'Region Epsilon', 'Area Zeta', 'Hub Eta', 'Node Theta', 
    'Cluster Iota', 'Zone Kappa', 'Sector Lambda', 'Region Mu', 
    'Area Nu', 'Hub Xi', 'Node Omicron', 'Cluster Pi'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const population = Math.floor(Math.random() * 900000) + 100000;
    return {
      id: `node-${i}`,
      name: names[i] || `Region ${i + 1}`,
      population,
      state: 'susceptible' as NodeState,
      priority: Math.random(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 50,
      history: [],
      resourceAllocated: 0,
      riskScore: 0,
      populationStats: createDefaultPopStats(population),
      cumulativeDeaths: 0,
      cumulativeRecoveries: 0,
    };
  });
};

const generateEdges = (nodes: SimulationNode[]): SimulationEdge[] => {
  const edges: SimulationEdge[] = [];
  const nodeCount = nodes.length;
  
  for (let i = 0; i < nodeCount; i++) {
    edges.push({
      source: nodes[i].id,
      target: nodes[(i + 1) % nodeCount].id,
      weight: Math.random() * 0.5 + 0.3,
    });
    
    if (Math.random() > 0.6) {
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
  infectionRate: 0.12,
  recoveryRate: 0.06,
  deathRate: 0.02,
  totalResources: 4,
  priorityWeight: 0.5,
  initialInfected: 2,
  timeStepSpeed: 800,
  uncertaintyEnabled: false,
  delayedEffects: false,
};

const defaultMetrics: SimulationMetrics = {
  totalInfected: 0,
  totalHealthy: 0,
  totalAtRisk: 0,
  totalCollapsed: 0,
  resourcesUsed: 0,
  peakInfection: 0,
  peakTime: 0,
  currentTime: 0,
  systemStress: 0,
  totalPopulation: 0,
  totalInfectedPop: 0,
  totalDeaths: 0,
  totalRecoveries: 0,
};

export const useSimulation = () => {
  const [nodes, setNodes] = useState<SimulationNode[]>(() => generateInitialNodes());
  const [edges, setEdges] = useState<SimulationEdge[]>(() => generateEdges(generateInitialNodes()));
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [metrics, setMetrics] = useState<SimulationMetrics>(defaultMetrics);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SimulationNode | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef(0);

  const calculateStress = useCallback((currentNodes: SimulationNode[]): number => {
    const infected = currentNodes.filter(n => n.state === 'infected' || n.state === 'collapsed').length;
    const total = currentNodes.length;
    const atRisk = currentNodes.filter(n => n.state === 'at-risk').length;
    return Math.min(1, (infected * 2 + atRisk) / (total * 2));
  }, []);

  const calculateMetrics = useCallback((currentNodes: SimulationNode[]): SimulationMetrics => {
    const infected = currentNodes.filter(n => n.state === 'infected').length;
    const healthy = currentNodes.filter(n => n.state === 'healthy' || n.state === 'susceptible').length;
    const atRisk = currentNodes.filter(n => n.state === 'at-risk').length;
    const collapsed = currentNodes.filter(n => n.state === 'collapsed').length;
    const vaccinated = currentNodes.filter(n => n.state === 'vaccinated').length;
    const recovered = currentNodes.filter(n => n.state === 'recovered').length;
    const resourcesUsed = currentNodes.reduce((sum, n) => sum + n.resourceAllocated, 0);
    const stress = calculateStress(currentNodes);
    
    // Aggregate population-level stats
    const totalPopulation = currentNodes.reduce((sum, n) => sum + n.population, 0);
    const totalInfectedPop = currentNodes.reduce((sum, n) => sum + n.populationStats.infected, 0);
    const totalDeaths = currentNodes.reduce((sum, n) => sum + n.cumulativeDeaths, 0);
    const totalRecoveries = currentNodes.reduce((sum, n) => sum + n.cumulativeRecoveries, 0);
    
    return {
      totalInfected: infected,
      totalHealthy: healthy,
      totalAtRisk: atRisk,
      totalCollapsed: collapsed,
      resourcesUsed,
      peakInfection: Math.max(metrics.peakInfection, infected),
      peakTime: infected > metrics.peakInfection ? timeRef.current : metrics.peakTime,
      currentTime: timeRef.current,
      systemStress: stress,
      totalPopulation,
      totalInfectedPop,
      totalDeaths,
      totalRecoveries,
    };
  }, [metrics.peakInfection, metrics.peakTime, calculateStress]);

  const step = useCallback(() => {
    setNodes(prevNodes => {
      const newNodes = [...prevNodes];
      const adjacencyList = new Map<string, string[]>();
      
      // Build adjacency list from edges
      edges.forEach(edge => {
        if (!adjacencyList.has(edge.source)) adjacencyList.set(edge.source, []);
        if (!adjacencyList.has(edge.target)) adjacencyList.set(edge.target, []);
        adjacencyList.get(edge.source)!.push(edge.target);
        adjacencyList.get(edge.target)!.push(edge.source);
      });
      
      // ===== BFS-BASED EPIDEMIC SPREAD =====
      // Use breadth-first search to spread infection in waves from infected nodes
      const visited = new Set<string>();
      const infectionQueue: string[] = [];
      const nodesToUpdate: { index: number; newState: NodeState; history: any }[] = [];
      
      // Initialize BFS queue with all currently infected nodes
      newNodes.forEach((node, index) => {
        if (node.state === 'infected') {
          infectionQueue.push(node.id);
          visited.add(node.id);
        }
      });
      
      // BFS traversal for infection spread
      while (infectionQueue.length > 0) {
        const currentNodeId = infectionQueue.shift()!;
        const neighbors = adjacencyList.get(currentNodeId) || [];
        
        // Process each neighbor of the infected node
        for (const neighborId of neighbors) {
          if (visited.has(neighborId)) continue;
          
          const neighborIndex = newNodes.findIndex(n => n.id === neighborId);
          if (neighborIndex === -1) continue;
          
          const neighbor = newNodes[neighborIndex];
          
          // Skip if node is vaccinated, recovered, or collapsed
          if (neighbor.state === 'vaccinated' || neighbor.state === 'recovered' || neighbor.state === 'collapsed') {
            visited.add(neighborId);
            continue;
          }
          
          // Calculate spread probability
          const spreadChance = params.infectionRate * 0.8;
          
          if (neighbor.state === 'susceptible' && Math.random() < spreadChance) {
            // Susceptible → At-risk transition
            visited.add(neighborId);
            nodesToUpdate.push({
              index: neighborIndex,
              newState: 'at-risk',
              history: {
                time: timeRef.current,
                state: 'at-risk',
                resourceAllocated: neighbor.resourceAllocated,
                infectedPop: neighbor.populationStats.infected,
                deaths: neighbor.cumulativeDeaths,
                recoveries: neighbor.cumulativeRecoveries,
              }
            });
          } else if (neighbor.state === 'healthy' && Math.random() < spreadChance) {
            // Healthy → At-risk transition
            visited.add(neighborId);
            nodesToUpdate.push({
              index: neighborIndex,
              newState: 'at-risk',
              history: {
                time: timeRef.current,
                state: 'at-risk',
                resourceAllocated: neighbor.resourceAllocated,
                infectedPop: neighbor.populationStats.infected,
                deaths: neighbor.cumulativeDeaths,
                recoveries: neighbor.cumulativeRecoveries,
              }
            });
          }
        }
      }
      
      // Apply BFS-discovered state transitions
      nodesToUpdate.forEach(({ index, newState, history }) => {
        const node = newNodes[index];
        const neighbors = adjacencyList.get(node.id) || [];
        const riskScore = neighbors.filter(nId => 
          newNodes.find(n => n.id === nId)?.state === 'infected'
        ).length / Math.max(1, neighbors.length);
        
        // Give at-risk nodes a small initial infected population
        const newPopStats = { ...node.populationStats };
        if (newState === 'at-risk') {
          const initialInfected = Math.floor(node.population * (0.01 + Math.random() * 0.02)); // 1-3% initially infected
          newPopStats.healthy -= initialInfected;
          newPopStats.infected = initialInfected;
        }
        
        newNodes[index] = {
          ...node,
          state: newState,
          riskScore,
          populationStats: newPopStats,
          history: [...node.history, { ...history, infectedPop: newPopStats.infected }]
        };
      });
      
      // Update risk scores for all nodes
      newNodes.forEach((node, index) => {
        if (node.state === 'collapsed') return;
        
        const neighbors = adjacencyList.get(node.id) || [];
        const infectedNeighbors = neighbors.filter(nId => {
          const n = newNodes.find(n => n.id === nId);
          return n?.state === 'infected';
        });
        
        const riskScore = infectedNeighbors.length / Math.max(1, neighbors.length);
        newNodes[index] = { ...node, riskScore };
      });
      
      // ===== PRIORITY QUEUE-BASED VACCINE ALLOCATION =====
      // Use MaxHeap for efficient greedy vaccine allocation
      const atRiskNodes = newNodes.filter(n => n.state === 'at-risk');
      
      // Create priority queue with scoring function
      const priorityQueue = createPriorityQueue(atRiskNodes, (node) => {
        const connections = adjacencyList.get(node.id)?.length || 0;
        return node.priority * params.priorityWeight + (connections / 10) * (1 - params.priorityWeight);
      });
      
      const currentResources = newNodes.reduce((sum, n) => sum + n.resourceAllocated, 0);
      const availableResources = Math.max(0, params.totalResources - currentResources);
      
      // ===== GRAPH TOPOLOGY UPDATE =====
      // Allocate vaccines and isolate vaccinated nodes by removing their edges
      const vaccinatedNodeIds = new Set<string>();
      
      for (let i = 0; i < availableResources && !priorityQueue.isEmpty(); i++) {
        const nodeToVaccinate = priorityQueue.extractMax();
        if (!nodeToVaccinate) break;
        
        const nodeIndex = newNodes.findIndex(n => n.id === nodeToVaccinate.id);
        if (nodeIndex === -1) continue;
        
        const delay = params.delayedEffects ? (Math.random() < 0.4) : false;
        if (!delay) {
          const node = newNodes[nodeIndex];
          vaccinatedNodeIds.add(node.id);
          
          // Preserve population stats when vaccinating
          newNodes[nodeIndex] = { 
            ...node, 
            resourceAllocated: 1,
            state: 'vaccinated',
            populationStats: { ...node.populationStats }, // Explicitly preserve stats
            cumulativeDeaths: node.cumulativeDeaths,
            cumulativeRecoveries: node.cumulativeRecoveries,
            history: [...node.history, { 
              time: timeRef.current, 
              state: 'vaccinated', 
              resourceAllocated: 1,
              infectedPop: node.populationStats.infected,
              deaths: node.cumulativeDeaths,
              recoveries: node.cumulativeRecoveries,
            }]
          };
        }
      }
      
      // Remove edges connected to vaccinated nodes (graph topology change)
      if (vaccinatedNodeIds.size > 0) {
        setEdges(prevEdges => {
          return prevEdges.filter(edge => 
            !vaccinatedNodeIds.has(edge.source) && !vaccinatedNodeIds.has(edge.target)
          );
        });
        
        // Update adjacency list to reflect topology changes
        vaccinatedNodeIds.forEach(nodeId => {
          adjacencyList.delete(nodeId);
        });
        adjacencyList.forEach((neighbors, nodeId) => {
          adjacencyList.set(nodeId, neighbors.filter(nId => !vaccinatedNodeIds.has(nId)));
        });
      }
      
      // Process infections, recoveries, and deaths at population level
      newNodes.forEach((node, index) => {
        const uncertainty = params.uncertaintyEnabled ? (Math.random() * 0.1 - 0.05) : 0;
        const currentStats = { ...node.populationStats };
        let newDeaths = 0;
        let newRecoveries = 0;
        
        // Process deaths and recoveries for any node with infected population
        // This includes both 'infected' and 'at-risk' nodes
        if ((node.state === 'infected' || node.state === 'at-risk') && node.populationStats.infected > 0) {
          // Process deaths from infected population
          const deathCount = Math.floor(currentStats.infected * (params.deathRate + uncertainty * 0.01));
          if (deathCount > 0 && currentStats.infected > 0) {
            newDeaths = Math.min(deathCount, currentStats.infected);
            currentStats.infected -= newDeaths;
            currentStats.dead += newDeaths;
          }
          
          // Process recoveries from infected population
          const recoveryCount = Math.floor(currentStats.infected * (params.recoveryRate + uncertainty));
          if (recoveryCount > 0 && currentStats.infected > 0) {
            newRecoveries = Math.min(recoveryCount, currentStats.infected);
            currentStats.infected -= newRecoveries;
            currentStats.recovered += newRecoveries;
          }
          
          // Check for collapse (prolonged infection or high death rate)
          if (node.state === 'infected' && node.infectedAt && timeRef.current - node.infectedAt > 5) {
            if (Math.random() < 0.2 || currentStats.dead > node.population * 0.3) {
              newNodes[index] = { 
                ...node, 
                state: 'collapsed', 
                collapsedAt: timeRef.current,
                populationStats: currentStats,
                cumulativeDeaths: node.cumulativeDeaths + newDeaths,
                cumulativeRecoveries: node.cumulativeRecoveries + newRecoveries,
                history: [...node.history, { 
                  time: timeRef.current, 
                  state: 'collapsed', 
                  resourceAllocated: node.resourceAllocated,
                  infectedPop: currentStats.infected,
                  deaths: node.cumulativeDeaths + newDeaths,
                  recoveries: node.cumulativeRecoveries + newRecoveries,
                }]
              };
              return;
            }
          }
          
          // Check if region recovered (no more infected)
          if (currentStats.infected === 0 && (node.state === 'infected' || node.state === 'at-risk')) {
            newNodes[index] = { 
              ...node, 
              state: 'recovered',
              infectedAt: undefined,
              populationStats: currentStats,
              cumulativeDeaths: node.cumulativeDeaths + newDeaths,
              cumulativeRecoveries: node.cumulativeRecoveries + newRecoveries,
              history: [...node.history, { 
                time: timeRef.current, 
                state: 'recovered', 
                resourceAllocated: node.resourceAllocated,
                infectedPop: 0,
                deaths: node.cumulativeDeaths + newDeaths,
                recoveries: node.cumulativeRecoveries + newRecoveries,
              }]
            };
            return;
          }
          
          // Update node with new population stats
          newNodes[index] = {
            ...node,
            populationStats: currentStats,
            cumulativeDeaths: node.cumulativeDeaths + newDeaths,
            cumulativeRecoveries: node.cumulativeRecoveries + newRecoveries,
          };
        }
        
        // At-risk nodes spread infection within their population
        if (node.state === 'at-risk' && node.populationStats.infected > 0) {
          const nodeData = newNodes[index];
          const stats = { ...nodeData.populationStats };
          
          const neighbors = adjacencyList.get(node.id) || [];
          const infectedNeighbors = neighbors.filter(
            nId => newNodes.find(n => n.id === nId)?.state === 'infected'
          );
          
          // Spread infection within at-risk population (slower than fully infected nodes)
          const internalSpread = Math.floor(stats.healthy * params.infectionRate * (stats.infected / nodeData.population) * 0.5);
          const externalPressure = Math.floor(stats.healthy * params.infectionRate * (infectedNeighbors.length / Math.max(1, neighbors.length)) * 0.3);
          const newInfections = internalSpread + externalPressure;
          
          if (newInfections > 0) {
            const actualNew = Math.min(newInfections, stats.healthy);
            stats.healthy -= actualNew;
            stats.infected += actualNew;
            newNodes[index] = {
              ...nodeData,
              populationStats: stats,
            };
          }
          
          // Transition to fully infected state when infection reaches critical threshold
          if (stats.infected > nodeData.population * 0.15) { // 15% threshold
            newNodes[index] = { 
              ...newNodes[index], 
              state: 'infected',
              infectedAt: timeRef.current,
              history: [...newNodes[index].history, { 
                time: timeRef.current, 
                state: 'infected', 
                resourceAllocated: nodeData.resourceAllocated,
                infectedPop: stats.infected,
                deaths: nodeData.cumulativeDeaths,
                recoveries: nodeData.cumulativeRecoveries,
              }]
            };
          }
        }
        
        // Spread infection within already infected nodes
        if (newNodes[index].state === 'infected') {
          const nodeData = newNodes[index];
          const stats = { ...nodeData.populationStats };
          // Spread within population
          const newInfections = Math.floor(stats.healthy * params.infectionRate * (stats.infected / nodeData.population) * 2);
          if (newInfections > 0) {
            const actualNew = Math.min(newInfections, stats.healthy);
            stats.healthy -= actualNew;
            stats.infected += actualNew;
            newNodes[index] = {
              ...nodeData,
              populationStats: stats,
            };
          }
        }
      });
      
      timeRef.current += 1;
      
      const newMetrics = calculateMetrics(newNodes);
      setMetrics(newMetrics);
      
      setHistory(prev => [...prev, {
        time: timeRef.current,
        infected: newMetrics.totalInfected,
        healthy: newMetrics.totalHealthy,
        atRisk: newMetrics.totalAtRisk,
        collapsed: newMetrics.totalCollapsed,
        stress: newMetrics.systemStress,
        deaths: newMetrics.totalDeaths,
        recoveries: newMetrics.totalRecoveries,
        infectedPop: newMetrics.totalInfectedPop,
      }]);
      
      return newNodes;
    });
  }, [edges, params, calculateMetrics]);

  const start = useCallback(() => {
    if (isRunning && !isPaused) return;
    
    if (!isRunning) {
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const shuffled = [...newNodes].sort(() => Math.random() - 0.5);
        for (let i = 0; i < params.initialInfected && i < shuffled.length; i++) {
          const idx = newNodes.findIndex(n => n.id === shuffled[i].id);
          if (idx !== -1) {
            const node = newNodes[idx];
            // Initialize with some infected population
            const initialInfected = Math.floor(node.population * 0.05);
            const newStats = { ...node.populationStats };
            newStats.healthy -= initialInfected;
            newStats.infected = initialInfected;
            
            newNodes[idx] = { 
              ...node, 
              state: 'infected',
              infectedAt: 0,
              populationStats: newStats,
              history: [{ 
                time: 0, 
                state: 'infected', 
                resourceAllocated: 0,
                infectedPop: initialInfected,
                deaths: 0,
                recoveries: 0,
              }]
            };
          }
        }
        const initialMetrics = calculateMetrics(newNodes);
        setMetrics(initialMetrics);
        setHistory([{
          time: 0,
          infected: initialMetrics.totalInfected,
          healthy: initialMetrics.totalHealthy,
          atRisk: 0,
          collapsed: 0,
          stress: initialMetrics.systemStress,
          deaths: 0,
          recoveries: 0,
          infectedPop: initialMetrics.totalInfectedPop,
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
    setSnapshots([]);
    setIsRunning(false);
    setIsPaused(false);
    setSelectedNode(null);
    timeRef.current = 0;
  }, []);

  const stepOnce = useCallback(() => {
    if (!isRunning) {
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const shuffled = [...newNodes].sort(() => Math.random() - 0.5);
        for (let i = 0; i < params.initialInfected && i < shuffled.length; i++) {
          const idx = newNodes.findIndex(n => n.id === shuffled[i].id);
          if (idx !== -1) {
            const node = newNodes[idx];
            const initialInfected = Math.floor(node.population * 0.05);
            const newStats = { ...node.populationStats };
            newStats.healthy -= initialInfected;
            newStats.infected = initialInfected;
            
            newNodes[idx] = { 
              ...node, 
              state: 'infected',
              infectedAt: 0,
              populationStats: newStats,
              history: [{ 
                time: 0, 
                state: 'infected', 
                resourceAllocated: 0,
                infectedPop: initialInfected,
                deaths: 0,
                recoveries: 0,
              }]
            };
          }
        }
        return newNodes;
      });
      setIsRunning(true);
      setIsPaused(true);
    }
    step();
  }, [isRunning, params.initialInfected, step]);

  const takeSnapshot = useCallback(() => {
    const snapshot: Snapshot = {
      time: timeRef.current,
      label: `Snapshot t=${timeRef.current}`,
      nodes: JSON.parse(JSON.stringify(nodes)),
      metrics: { ...metrics },
    };
    setSnapshots(prev => [...prev, snapshot]);
  }, [nodes, metrics]);

  const selectNode = useCallback((nodeId: string | null) => {
    if (nodeId === null) {
      setSelectedNode(null);
    } else {
      const node = nodes.find(n => n.id === nodeId);
      setSelectedNode(node || null);
    }
  }, [nodes]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
    snapshots,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
    stepOnce,
    takeSnapshot,
    selectedNode,
    selectNode,
    showHeatmap,
    setShowHeatmap,
  };
};