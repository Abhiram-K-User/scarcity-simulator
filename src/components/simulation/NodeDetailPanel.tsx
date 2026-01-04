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
    <div className="analytical-panel p-3 animate-slide-in-right">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{node.name}</h3>
          <p className="text-[10px] text-muted-foreground">Region Details</p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/60 rounded transition-all duration-300 group hover:scale-110 transform glassmorphic"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Current Status & Population - 2 column */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between py-1.5 px-2 glassmorphic rounded border border-white/30">
            <span className="text-[10px] text-muted-foreground font-medium">Status</span>
            <span 
              className="text-[10px] font-semibold px-2 py-0.5 rounded transition-all duration-300"
              style={{ 
                backgroundColor: `${stateColors[node.state]}30`,
                color: stateColors[node.state],
                border: `1px solid ${stateColors[node.state]}40`
              }}
            >
              {stateLabels[node.state]}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 glassmorphic rounded border border-white/30">
            <span className="text-[10px] text-muted-foreground font-medium">Population</span>
            <span className="text-[10px] font-mono text-foreground font-semibold bg-white/50 px-2 py-0.5 rounded">
              {formatNumber(node.population)}
            </span>
          </div>
        </div>

        {/* Population Breakdown - Compact */}
        <div className="glassmorphic rounded-lg p-2 border border-white/30">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Breakdown</span>
          <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColors.healthy }} />
                <span className="text-muted-foreground">Healthy</span>
              </div>
              <span className="font-mono font-medium">{healthyPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColors.infected }} />
                <span className="text-muted-foreground">Infected</span>
              </div>
              <span className="font-mono font-medium" style={{ color: stats.infected > 0 ? stateColors.infected : 'inherit' }}>{infectedPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-stress-low" />
                <span className="text-muted-foreground">Recovered</span>
              </div>
              <span className="font-mono font-medium">{recoveredPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColors.collapsed }} />
                <span className="text-muted-foreground">Deaths</span>
              </div>
              <span className="font-mono font-medium" style={{ color: stats.dead > 0 ? stateColors.collapsed : 'inherit' }}>{deadPercent}%</span>
            </div>
          </div>
          
          {/* Population bar */}
          <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden flex shadow-inner">
            <div 
              className="h-full transition-all duration-500"
              style={{ width: `${healthyPercent}%`, backgroundColor: stateColors.healthy }} 
            />
            <div 
              className="h-full transition-all duration-500"
              style={{ width: `${infectedPercent}%`, backgroundColor: stateColors.infected }} 
            />
            <div 
              className="h-full transition-all duration-500 bg-stress-low"
              style={{ width: `${recoveredPercent}%` }} 
            />
            <div 
              className="h-full transition-all duration-500"
              style={{ width: `${deadPercent}%`, backgroundColor: stateColors.collapsed }} 
            />
          </div>
        </div>

        {/* Cumulative, Risk, Resources - 3 column */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="glassmorphic rounded-lg px-2 py-1.5 border border-white/30 text-center">
            <div className="text-[9px] text-muted-foreground mb-0.5">Deaths</div>
            <div className="text-sm font-mono font-semibold" style={{ color: stateColors.collapsed }}>
              {formatNumber(node.cumulativeDeaths)}
            </div>
          </div>
          <div className="glassmorphic rounded-lg px-2 py-1.5 border border-white/30 text-center">
            <div className="text-[9px] text-muted-foreground mb-0.5">Recovered</div>
            <div className="text-sm font-mono font-semibold text-stress-low">
              {formatNumber(node.cumulativeRecoveries)}
            </div>
          </div>
          <div className="glassmorphic rounded-lg px-2 py-1.5 border border-white/30 text-center">
            <div className="text-[9px] text-muted-foreground mb-0.5">Risk</div>
            <div className="text-sm font-mono font-semibold text-stress-high">
              {((node.riskScore || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center justify-between py-1.5 px-2 glassmorphic rounded border border-white/30">
          <span className="text-[10px] text-muted-foreground font-medium">Resources</span>
          <span className="text-[10px] font-mono text-foreground font-semibold bg-white/50 px-2 py-0.5 rounded">
            {node.resourceAllocated} units
          </span>
        </div>

        {/* History - Compact */}
        {node.history.length > 0 && (
          <div className="glassmorphic rounded-lg p-2 border border-white/30">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">History</span>
            <div className="mt-1.5 space-y-1 max-h-20 overflow-y-auto">
              {node.history.slice(-4).reverse().map((h, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between text-[10px] py-1 px-1.5 glassmorphic rounded border border-white/20 hover:border-white/40 transition-all duration-300"
                >
                  <span className="text-muted-foreground font-medium">t={h.time}</span>
                  <span className="font-medium text-[9px]" style={{ color: stateColors[h.state] }}>
                    {stateLabels[h.state]}
                  </span>
                  <span className="text-muted-foreground font-mono text-[9px] bg-white/40 px-1 py-0.5 rounded">
                    {formatNumber(h.infectedPop)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Infection/Collapse timing - 2 column if both exist */}
        {(node.infectedAt !== undefined || node.collapsedAt !== undefined) && (
          <div className="grid grid-cols-2 gap-1.5">
            {node.infectedAt !== undefined && (
              <div className="flex items-center justify-between py-1.5 px-2 glassmorphic rounded border border-white/30">
                <span className="text-[10px] text-muted-foreground font-medium">Infected</span>
                <span className="text-[10px] font-mono text-foreground font-semibold bg-white/50 px-2 py-0.5 rounded">
                  t={node.infectedAt}
                </span>
              </div>
            )}
            {node.collapsedAt !== undefined && (
              <div className="flex items-center justify-between py-1.5 px-2 glassmorphic rounded border border-white/30">
                <span className="text-[10px] text-muted-foreground font-medium">Collapsed</span>
                <span className="text-[10px] font-mono text-foreground font-semibold bg-white/50 px-2 py-0.5 rounded">
                  t={node.collapsedAt}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};