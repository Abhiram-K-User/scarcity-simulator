import { SimulationMetrics, HistoryPoint, Snapshot } from '@/types/simulation';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart, Line } from 'recharts';

interface MetricsDashboardProps {
  metrics: SimulationMetrics;
  history: HistoryPoint[];
  totalResources: number;
  snapshots: Snapshot[];
  onTakeSnapshot: () => void;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  color?: string;
  subtext?: string;
}

const stateColors = {
  healthy: '#6B8CAE',
  atRisk: '#C9A857',
  infected: '#B5636A',
  collapsed: '#505A64',
  recovered: '#5A9A6C',
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const MetricCard = ({ label, value, color, subtext }: MetricCardProps) => (
  <div className="bg-secondary/50 rounded px-3 py-2.5 border border-border">
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    <div className="text-xl font-mono font-medium mt-0.5" style={{ color: color || 'inherit' }}>
      {value}
    </div>
    {subtext && <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>}
  </div>
);

const StressBar = ({ stress }: { stress: number }) => {
  const getStressColor = (level: number) => {
    if (level < 0.25) return 'bg-stress-low';
    if (level < 0.5) return 'bg-stress-medium';
    if (level < 0.75) return 'bg-stress-high';
    return 'bg-stress-critical';
  };

  const getStressLabel = (level: number) => {
    if (level < 0.25) return 'Low';
    if (level < 0.5) return 'Moderate';
    if (level < 0.75) return 'High';
    return 'Critical';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">System Stress</span>
        <span className="text-xs font-mono text-muted-foreground">{getStressLabel(stress)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${getStressColor(stress)}`}
          style={{ width: `${Math.min(100, stress * 100)}%` }}
        />
      </div>
    </div>
  );
};

export const MetricsDashboard = ({ 
  metrics, 
  history, 
  totalResources, 
  snapshots,
  onTakeSnapshot 
}: MetricsDashboardProps) => {
  return (
    <div className="space-y-4">
      {/* Stress Bar */}
      <StressBar stress={metrics.systemStress} />

      {/* Population Stats */}
      <div className="border-t border-border pt-4">
        <h3 className="analytical-header mb-2.5">Population Impact</h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard 
            label="Infected Pop" 
            value={formatNumber(metrics.totalInfectedPop)} 
            color={stateColors.infected}
            subtext="currently infected"
          />
          <MetricCard 
            label="Total Deaths" 
            value={formatNumber(metrics.totalDeaths)} 
            color={stateColors.collapsed}
            subtext="cumulative"
          />
          <MetricCard 
            label="Recoveries" 
            value={formatNumber(metrics.totalRecoveries)} 
            color={stateColors.recovered}
            subtext="cumulative"
          />
          <MetricCard 
            label="Total Pop" 
            value={formatNumber(metrics.totalPopulation)} 
            subtext="all regions"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="analytical-header mb-2.5">Region State</h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard 
            label="Healthy" 
            value={metrics.totalHealthy} 
            color={stateColors.healthy}
          />
          <MetricCard 
            label="At Risk" 
            value={metrics.totalAtRisk} 
            color={stateColors.atRisk}
          />
          <MetricCard 
            label="Infected" 
            value={metrics.totalInfected} 
            color={stateColors.infected}
          />
          <MetricCard 
            label="Collapsed" 
            value={metrics.totalCollapsed} 
            color={stateColors.collapsed}
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="analytical-header mb-2.5">Resources</h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard 
            label="Allocated" 
            value={`${metrics.resourcesUsed}/${totalResources}`}
            subtext="units deployed"
          />
          <MetricCard 
            label="Affected" 
            value={metrics.totalInfected + metrics.totalCollapsed}
            subtext="regions impacted"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="analytical-header">Timeline</h3>
          <span className="text-xs font-mono text-muted-foreground">t={metrics.currentTime}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <MetricCard 
            label="Peak" 
            value={metrics.peakInfection}
            subtext={`at t=${metrics.peakTime}`}
          />
          <MetricCard 
            label="Duration" 
            value={`${metrics.currentTime}`}
            subtext="time steps"
          />
        </div>
      </div>

      {history.length > 1 && (
        <div className="border-t border-border pt-4">
          <h3 className="analytical-header mb-2.5">Trends</h3>
          <div className="h-36 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="infectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stateColors.infected} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={stateColors.infected} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="deathsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stateColors.collapsed} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={stateColors.collapsed} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fill: 'hsl(220, 10%, 50%)' }}
                  axisLine={{ stroke: 'hsl(220, 14%, 85%)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 9, fill: 'hsl(220, 10%, 50%)' }}
                  axisLine={{ stroke: 'hsl(220, 14%, 85%)' }}
                  tickLine={false}
                  width={35}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(220, 14%, 85%)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  formatter={(value: number, name: string) => [formatNumber(value), name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="infectedPop" 
                  stroke={stateColors.infected}
                  fill="url(#infectedGradient)"
                  strokeWidth={1.5}
                  name="Infected Pop"
                />
                <Line 
                  type="monotone" 
                  dataKey="deaths" 
                  stroke={stateColors.collapsed}
                  strokeWidth={1.5}
                  dot={false}
                  name="Deaths"
                />
                <Line 
                  type="monotone" 
                  dataKey="recoveries" 
                  stroke={stateColors.recovered}
                  strokeWidth={1.5}
                  dot={false}
                  name="Recoveries"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Snapshots */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="analytical-header">Snapshots</h3>
          <button 
            onClick={onTakeSnapshot}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            + Capture
          </button>
        </div>
        {snapshots.length === 0 ? (
          <p className="text-xs text-muted-foreground">No snapshots captured</p>
        ) : (
          <div className="space-y-1">
            {snapshots.slice(-3).map((snap, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 bg-secondary/30 rounded">
                <span className="text-muted-foreground">{snap.label}</span>
                <span className="font-mono text-muted-foreground">
                  {formatNumber(snap.metrics.totalDeaths)} deaths
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};