import { SimulationMetrics, HistoryPoint } from '@/types/simulation';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MetricsDashboardProps {
  metrics: SimulationMetrics;
  history: HistoryPoint[];
  totalResources: number;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  color?: string;
  subtext?: string;
}

const MetricCard = ({ label, value, color, subtext }: MetricCardProps) => (
  <div className="bg-secondary/50 rounded-lg p-3 border border-border">
    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
    <div className="text-2xl font-mono font-semibold" style={{ color }}>
      {value}
    </div>
    {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
  </div>
);

export const MetricsDashboard = ({ metrics, history, totalResources }: MetricsDashboardProps) => {
  const totalNodes = metrics.totalInfected + metrics.totalRecovered + metrics.totalProtected + metrics.totalSusceptible;
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Current State
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard 
            label="Infected" 
            value={metrics.totalInfected} 
            color="hsl(38, 92%, 55%)"
          />
          <MetricCard 
            label="Recovered" 
            value={metrics.totalRecovered} 
            color="hsl(160, 60%, 45%)"
          />
          <MetricCard 
            label="Protected" 
            value={metrics.totalProtected} 
            color="hsl(270, 60%, 60%)"
          />
          <MetricCard 
            label="Susceptible" 
            value={metrics.totalSusceptible} 
            color="hsl(210, 80%, 55%)"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Resources
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard 
            label="Used" 
            value={`${metrics.resourcesUsed}/${totalResources}`}
            subtext="allocation units"
          />
          <MetricCard 
            label="Sacrificed" 
            value={totalNodes > 0 ? totalNodes - metrics.totalProtected - metrics.totalSusceptible : 0}
            subtext="regions affected"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Timeline
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <MetricCard 
            label="Peak Infection" 
            value={metrics.peakInfection}
            subtext={`at t=${metrics.peakTime}`}
          />
          <MetricCard 
            label="Current Time" 
            value={`t=${metrics.currentTime}`}
            subtext="time steps"
          />
        </div>
      </div>

      {history.length > 1 && (
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Infection Timeline
          </h3>
          <div className="h-40 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
                  axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
                  tickLine={{ stroke: 'hsl(222, 30%, 18%)' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
                  axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
                  tickLine={{ stroke: 'hsl(222, 30%, 18%)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 18%)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="infected" 
                  stroke="hsl(38, 92%, 55%)" 
                  strokeWidth={2}
                  dot={false}
                  name="Infected"
                />
                <Line 
                  type="monotone" 
                  dataKey="recovered" 
                  stroke="hsl(160, 60%, 45%)" 
                  strokeWidth={2}
                  dot={false}
                  name="Recovered"
                />
                <Line 
                  type="monotone" 
                  dataKey="protected" 
                  stroke="hsl(270, 60%, 60%)" 
                  strokeWidth={2}
                  dot={false}
                  name="Protected"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};