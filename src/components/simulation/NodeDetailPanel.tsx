import { SimulationNode, NodeState } from '@/types/simulation';
import { X } from 'lucide-react';

interface NodeDetailPanelProps {
  node: SimulationNode | null;
  onClose: () => void;
}

const stateColors: Record<NodeState, string> = {
  healthy: '#6B8CAE',
  'at-risk': '#C9A857',
  infected: '#B5636A',
  collapsed: '#505A64',
};

const stateLabels: Record<NodeState, string> = {
  healthy: 'Healthy',
  'at-risk': 'At Risk',
  infected: 'Infected',
  collapsed: 'Collapsed',
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const NodeDetailPanel = ({ node, onClose }: NodeDetailPanelProps) => {
  if (!node) return null;

  const stats = node.populationStats;
  const healthyPercent = ((stats.healthy / node.population) * 100).toFixed(1);
  const infectedPercent = ((stats.infected / node.population) * 100).toFixed(1);
  const recoveredPercent = ((stats.recovered / node.population) * 100).toFixed(1);
  const deadPercent = ((stats.dead / node.population) * 100).toFixed(1);

  return (
    <div className="bg-card border border-border rounded p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">{node.name}</h3>
          <p className="text-xs text-muted-foreground">Region Details</p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Current Status */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">Status</span>
          <span 
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: `${stateColors[node.state]}20`,
              color: stateColors[node.state]
            }}
          >
            {stateLabels[node.state]}
          </span>
        </div>

        {/* Total Population */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">Total Population</span>
          <span className="text-xs font-mono text-foreground">
            {formatNumber(node.population)}
          </span>
        </div>

        {/* Population Breakdown */}
        <div className="pt-2 pb-2 border-b border-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Population Breakdown</span>
          <div className="mt-2 space-y-2">
            {/* Healthy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColors.healthy }} />
                <span className="text-xs text-muted-foreground">Healthy</span>
              </div>
              <span className="text-xs font-mono text-foreground">
                {formatNumber(stats.healthy)} ({healthyPercent}%)
              </span>
            </div>
            {/* Infected */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColors.infected }} />
                <span className="text-xs text-muted-foreground">Infected</span>
              </div>
              <span className="text-xs font-mono" style={{ color: stats.infected > 0 ? stateColors.infected : 'inherit' }}>
                {formatNumber(stats.infected)} ({infectedPercent}%)
              </span>
            </div>
            {/* Recovered */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-stress-low" />
                <span className="text-xs text-muted-foreground">Recovered</span>
              </div>
              <span className="text-xs font-mono text-foreground">
                {formatNumber(stats.recovered)} ({recoveredPercent}%)
              </span>
            </div>
            {/* Dead */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColors.collapsed }} />
                <span className="text-xs text-muted-foreground">Deaths</span>
              </div>
              <span className="text-xs font-mono" style={{ color: stats.dead > 0 ? stateColors.collapsed : 'inherit' }}>
                {formatNumber(stats.dead)} ({deadPercent}%)
              </span>
            </div>
          </div>
          
          {/* Population bar */}
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden flex">
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${healthyPercent}%`, 
                backgroundColor: stateColors.healthy 
              }} 
            />
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${infectedPercent}%`, 
                backgroundColor: stateColors.infected 
              }} 
            />
            <div 
              className="h-full transition-all bg-stress-low"
              style={{ width: `${recoveredPercent}%` }} 
            />
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${deadPercent}%`, 
                backgroundColor: stateColors.collapsed 
              }} 
            />
          </div>
        </div>

        {/* Cumulative Stats */}
        <div className="grid grid-cols-2 gap-2 py-2 border-b border-border">
          <div className="bg-secondary/30 rounded px-2 py-1.5">
            <div className="text-xs text-muted-foreground">Total Deaths</div>
            <div className="text-sm font-mono font-medium" style={{ color: stateColors.collapsed }}>
              {formatNumber(node.cumulativeDeaths)}
            </div>
          </div>
          <div className="bg-secondary/30 rounded px-2 py-1.5">
            <div className="text-xs text-muted-foreground">Total Recoveries</div>
            <div className="text-sm font-mono font-medium text-stress-low">
              {formatNumber(node.cumulativeRecoveries)}
            </div>
          </div>
        </div>

        {/* Risk Score */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">Risk Level</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-stress-high transition-all"
                style={{ width: `${(node.riskScore || 0) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-foreground">
              {((node.riskScore || 0) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">Resources Allocated</span>
          <span className="text-xs font-mono text-foreground">
            {node.resourceAllocated} units
          </span>
        </div>

        {/* History */}
        {node.history.length > 0 && (
          <div className="pt-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">History</span>
            <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
              {node.history.slice(-5).reverse().map((h, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between text-xs py-1 px-2 bg-secondary/30 rounded"
                >
                  <span className="text-muted-foreground">t={h.time}</span>
                  <span style={{ color: stateColors[h.state] }}>
                    {stateLabels[h.state]}
                  </span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {formatNumber(h.infectedPop)} inf
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Infection timing */}
        {node.infectedAt !== undefined && (
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Infected Since</span>
            <span className="text-xs font-mono text-foreground">
              t={node.infectedAt}
            </span>
          </div>
        )}

        {node.collapsedAt !== undefined && (
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Collapsed At</span>
            <span className="text-xs font-mono text-foreground">
              t={node.collapsedAt}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};