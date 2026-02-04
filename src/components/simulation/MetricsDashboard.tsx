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
  <div className="glassmorphic rounded-lg px-3 py-2.5 border border-white/30 hover-lift group">
    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">{label}</div>
    <div className="text-xl font-semibold transition-colors duration-300" style={{ color: color || 'inherit' }}>
      {value}
    </div>
    {subtext && <div className="text-[10px] text-muted-foreground mt-1 opacity-80">{subtext}</div>}
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

  const getStressShadow = (level: number) => {
    if (level < 0.25) return 'shadow-stress-low/50';
    if (level < 0.5) return 'shadow-stress-medium/50';
    if (level < 0.75) return 'shadow-stress-high/50';
    return 'shadow-stress-critical/50';
  };

  return (
    <div className="space-y-2 glassmorphic rounded-lg p-3 border border-white/30">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">System Stress</span>
        <span className="text-xs text-foreground font-semibold px-2.5 py-1 rounded bg-white/50">{getStressLabel(stress)}</span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className={`h-full transition-all duration-700 ${getStressColor(stress)} shadow-lg ${getStressShadow(stress)} animate-pulse`}
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
    <div className="space-y-2.5">
      {/* Stress Bar */}
      <StressBar stress={metrics.systemStress} />

      {/* Region State - 4 columns */}
      <div>
        <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-1.5">Region State</h3>
        <div className="grid grid-cols-4 gap-1.5">
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

      {/* Population Impact - 4 columns */}
      <div>
        <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-1.5">Population Impact</h3>
        <div className="grid grid-cols-4 gap-1.5">
          <MetricCard 
            label="Infected" 
            value={formatNumber(metrics.totalInfectedPop)} 
            color={stateColors.infected}
          />
          <MetricCard 
            label="Deaths" 
            value={formatNumber(metrics.totalDeaths)} 
            color={stateColors.collapsed}
          />
          <MetricCard 
            label="Recovered" 
            value={formatNumber(metrics.totalRecoveries)} 
            color={stateColors.recovered}
          />
          <MetricCard 
            label="Total" 
            value={formatNumber(metrics.totalPopulation)}
          />
        </div>
      </div>

      {/* Resources & Timeline - 2 columns */}
      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-1.5">Resources</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <MetricCard 
              label="Allocated" 
              value={`${metrics.resourcesUsed}/${totalResources}`}
            />
            <MetricCard 
              label="Affected" 
              value={metrics.totalInfected + metrics.totalCollapsed}
            />
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-1.5">Timeline</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <MetricCard 
              label="Peak" 
              value={metrics.peakInfection}
              subtext={`t=${metrics.peakTime}`}
            />
            <MetricCard 
              label="Duration" 
              value={`${metrics.currentTime}`}
            />
          </div>
        </div>
      </div>

      {/* Trends Chart - Compact */}
      {history.length > 1 && (
        <div className="glassmorphic rounded-lg p-2.5 border border-white/30">
          <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-1">Disease Progression Over Time</h3>
          <p className="text-[9px] text-muted-foreground mb-2 leading-relaxed">
            Tracks the number of infected individuals, deaths, and recoveries across simulation timesteps. 
            Rising infection curves indicate epidemic spread, while recovery trends show containment effectiveness.
          </p>
          <div className="h-32 -ml-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="infectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stateColors.infected} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={stateColors.infected} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fill: 'hsl(220, 10%, 50%)' }}
                  axisLine={{ stroke: 'hsl(220, 14%, 85%)' }}
                  tickLine={false}
                  label={{ value: 'Time Steps', position: 'insideBottom', offset: -5, fontSize: 10, fill: 'hsl(220, 10%, 50%)' }}
                />
                <YAxis 
                  tick={{ fontSize: 9, fill: 'hsl(220, 10%, 50%)' }}
                  axisLine={{ stroke: 'hsl(220, 14%, 85%)' }}
                  tickLine={false}
                  width={35}
                  tickFormatter={(value) => formatNumber(value)}
                  label={{ value: 'Population', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'hsl(220, 10%, 50%)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    padding: '4px 8px',
                    boxShadow: '0 4px 20px rgba(107, 140, 174, 0.2)'
                  }}
                  formatter={(value: number, name: string) => [formatNumber(value), name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="infectedPop" 
                  stroke={stateColors.infected}
                  fill="url(#infectedGradient)"
                  strokeWidth={2}
                  name="Infected"
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
                  name="Recovered"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};