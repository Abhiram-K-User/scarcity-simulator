import { SimulationNode, SimulationEdge, SimulationMetrics } from '@/types/simulation';
import { NetworkGraph } from '@/components/simulation/NetworkGraph';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { ReactNode } from 'react';

interface CommandTabProps {
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  selectedNodeId: string | null;
  selectNode: (nodeId: string | null) => void;
  showHeatmap: boolean;
  setShowHeatmap: (show: boolean) => void;
  metrics: SimulationMetrics;
  isRunning: boolean;
  isPaused: boolean;
  onNodeClick?: (nodeId: string) => void;
}

interface StatCardProps {
  label: string;
  value: number;
  change?: number;
  color: string;
  icon: ReactNode;
  isActive: boolean;
}

const StatCard = ({ label, value, change, color, icon, isActive }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="glassmorphic rounded-xl p-6 hover-lift relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8">
      {icon}
    </div>
    
    <div className="relative z-10">
      <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl font-bold mb-1" style={{ color }}>
        <CountUp 
          end={value} 
          duration={1.5}
          separator="," 
          preserveValue={true}
        />
      </div>
      {isActive && change !== undefined && (
        <div className={`text-sm flex items-center gap-1 ${change >= 0 ? 'text-stress-high' : 'text-stress-low'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
        </div>
      )}
    </div>
  </motion.div>
);

export const CommandTab = ({
  nodes,
  edges,
  selectedNodeId,
  selectNode,
  showHeatmap,
  setShowHeatmap,
  metrics,
  isRunning,
  isPaused,
  onNodeClick,
}: CommandTabProps) => {
  const isActive = isRunning && !isPaused;
  
  const handleNodeClick = (nodeId: string) => {
    selectNode(nodeId);
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Main Content - Split Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Network Visualization */}
        <div className="analytical-panel overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
            <h2 className="text-sm font-medium text-primary uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Network State Visualization
            </h2>
            <span className="text-xs font-semibold text-muted-foreground glassmorphic px-3 py-1 rounded-full">
              {nodes.length} regions · {edges.length} connections
            </span>
          </div>
          <div className="aspect-[4/3] bg-white dark:bg-black">
            <NetworkGraph
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              showHeatmap={showHeatmap}
              selectedNodeId={selectedNodeId}
            />
          </div>
          
          {/* Legend below graph */}
          <div className="glassmorphic rounded-lg p-3 mt-4">
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {[
                { label: 'Healthy', color: '#6B8CAE' },
                { label: 'At-Risk', color: '#C9A857' },
                { label: 'Infected', color: '#B5636A' },
                { label: 'Recovered', color: '#7BA37A' },
                { label: 'Collapsed', color: '#505A64' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                  />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Key Metrics */}
        <div className="space-y-4">
          <StatCard
            label="Infected Population"
            value={metrics.totalInfectedPop}
            change={12}
            color="hsl(var(--stress-high))"
            icon={<div className="text-9xl">🦠</div>}
            isActive={isActive}
          />
          <StatCard
            label="Total Deaths"
            value={metrics.totalDeaths}
            change={-3}
            color="#FF0000"
            icon={<div className="text-9xl">💀</div>}
            isActive={isActive}
          />
          <StatCard
            label="Recoveries"
            value={metrics.totalRecoveries}
            change={18}
            color="#00FF00"
            icon={<div className="text-9xl">💚</div>}
            isActive={isActive}
          />
          <StatCard
            label="System Stress"
            value={Math.round(metrics.systemStress * 100)}
            change={5}
            color={
              metrics.systemStress > 0.75
                ? 'hsl(var(--stress-critical))'
                : metrics.systemStress > 0.5
                ? 'hsl(var(--stress-high))'
                : 'hsl(var(--stress-low))'
            }
            icon={<div className="text-9xl">⚠️</div>}
            isActive={isActive}
          />
        </div>
      </div>
    </motion.div>
  );
};
