import { SimulationParams, HistoryPoint, SimulationMetrics, Snapshot } from '@/types/simulation';
import { ControlPanel } from '@/components/simulation/ControlPanel';
import { MetricsDashboard } from '@/components/simulation/MetricsDashboard';
import { DiseaseScenario, DISEASE_SCENARIOS } from '@/types/DiseaseScenarios';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AnalyticsTabProps {
  params: SimulationParams;
  setParams: (params: SimulationParams) => void;
  metrics: SimulationMetrics;
  history: HistoryPoint[];
  snapshots: Snapshot[];
  isRunning: boolean;
  isPaused: boolean;
  currentScenario: DiseaseScenario;
  applyScenario: (scenario: DiseaseScenario) => void;
  onTakeSnapshot: () => void;
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const SliderControl = ({ label, value, min, max, step, unit, onChange, disabled }: SliderControlProps) => (
  <div className="space-y-2 group">
    <div className="flex justify-between items-baseline">
      <Label className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</Label>
      <span className="text-sm font-semibold text-muted-foreground bg-gradient-to-r from-primary/10 to-transparent px-2.5 py-1 rounded">
        {value.toFixed(step < 1 ? 2 : 0)}{unit}
      </span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
      disabled={disabled}
      className="cursor-pointer transition-all duration-300"
    />
  </div>
);

export const AnalyticsTab = ({
  params,
  setParams,
  metrics,
  history,
  snapshots,
  isRunning,
  isPaused,
  currentScenario,
  applyScenario,
  onTakeSnapshot,
}: AnalyticsTabProps) => {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setParams({ ...params, [key]: value });
  };

  const disabled = isRunning && !isPaused;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Disease Scenarios - Horizontal Row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="analytical-panel p-4"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-primary/80 uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Disease Scenarios
          </h2>
          <span className="text-xs text-muted-foreground">Select a preset or customize</span>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {DISEASE_SCENARIOS.map(scenario => {
            const isSelected = currentScenario.id === scenario.id;
            const isCustom = scenario.id === 'custom';

            return (
              <button
                key={scenario.id}
                onClick={() => applyScenario(scenario)}
                disabled={disabled}
                className={`
                  relative p-5 rounded-lg border-2 transition-all duration-300 text-left glassmorphic
                  ${isSelected
                    ? 'border-white/60 dark:border-white/30 shadow-md'
                    : 'border-white/30 dark:border-white/10 hover:border-white/50 dark:hover:border-white/20'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}
                `}
              >
                <div className="flex flex-col items-center gap-2 mb-2">
                  <span className="text-4xl">{scenario.icon}</span>
                  <h4 className="text-base font-semibold text-foreground text-center">{scenario.name}</h4>
                  {isSelected && (
                    <span className="text-[11px] text-primary font-medium uppercase tracking-wide">Active</span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-snug mb-2 text-center line-clamp-2">
                  {scenario.description}
                </p>

                {!isCustom && (
                  <div className="flex gap-2 justify-center flex-wrap">
                    <span className="text-[11px] px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                      T: {scenario.characteristics.transmission}
                    </span>
                    <span className="text-[11px] px-2 py-1 rounded bg-stress-high/10 text-stress-high font-medium">
                      M: {scenario.characteristics.mortality}
                    </span>
                  </div>
                )}

                {isCustom && (
                  <div className="text-[11px] text-muted-foreground italic text-center">
                    Adjust parameters below
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Parameter Controls - Horizontal Row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="analytical-panel p-4"
      >
        <h2 className="text-base font-medium text-primary/80 uppercase tracking-wider mb-5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Parameters & Configuration
        </h2>

        <div className="grid grid-cols-4 gap-5">
          {/* Transmission */}
          <div className="glassmorphic rounded-lg p-5 border border-white/20 dark:border-white/10">
            <h3 className="text-sm font-medium text-primary/70 uppercase tracking-wider mb-4">Transmission</h3>
            <div className="space-y-4">
              <SliderControl
                label="Infection Rate"
                value={params.infectionRate}
                min={0.01}
                max={0.4}
                step={0.01}
                onChange={(v) => updateParam('infectionRate', v)}
                disabled={disabled}
              />
              <SliderControl
                label="Recovery Rate"
                value={params.recoveryRate}
                min={0.01}
                max={0.2}
                step={0.01}
                onChange={(v) => updateParam('recoveryRate', v)}
                disabled={disabled}
              />
              <SliderControl
                label="Death Rate"
                value={params.deathRate}
                min={0.001}
                max={0.15}
                step={0.001}
                onChange={(v) => updateParam('deathRate', v)}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Resources */}
          <div className="glassmorphic rounded-lg p-5 border border-white/20 dark:border-white/10">
            <h3 className="text-sm font-medium text-primary/70 uppercase tracking-wider mb-4">Resources</h3>
            <div className="space-y-4">
              <SliderControl
                label="Available Units"
                value={params.totalResources}
                min={0}
                max={10}
                step={1}
                onChange={(v) => updateParam('totalResources', v)}
                disabled={disabled}
              />
              <SliderControl
                label="Priority Weight"
                value={params.priorityWeight}
                min={0}
                max={1}
                step={0.1}
                onChange={(v) => updateParam('priorityWeight', v)}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Initial State */}
          <div className="glassmorphic rounded-lg p-5 border border-white/20 dark:border-white/10">
            <h3 className="text-sm font-medium text-primary/70 uppercase tracking-wider mb-4">Initial State</h3>
            <div className="space-y-4">
              <SliderControl
                label="Infected"
                value={params.initialInfected}
                min={1}
                max={4}
                step={1}
                onChange={(v) => updateParam('initialInfected', v)}
                disabled={disabled}
              />
              <SliderControl
                label="Speed"
                value={params.timeStepSpeed}
                min={200}
                max={2000}
                step={100}
                unit="ms"
                onChange={(v) => updateParam('timeStepSpeed', v)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="glassmorphic rounded-lg p-5 border border-white/20 dark:border-white/10">
            <h3 className="text-sm font-medium text-primary/70 uppercase tracking-wider mb-4">Advanced Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2.5 rounded hover:bg-white/40 transition-all duration-300">
                <Label className="text-sm font-medium text-foreground cursor-pointer">Uncertainty</Label>
                <Switch
                  checked={params.uncertaintyEnabled}
                  onCheckedChange={(v) => updateParam('uncertaintyEnabled', v)}
                  disabled={disabled}
                />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded hover:bg-white/40 transition-all duration-300">
                <Label className="text-sm font-medium text-foreground cursor-pointer">Delayed Effects</Label>
                <Switch
                  checked={params.delayedEffects}
                  onCheckedChange={(v) => updateParam('delayedEffects', v)}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Analytics - Full Width Below */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="analytical-panel p-4"
      >
        <h2 className="text-base font-medium text-primary/80 uppercase tracking-wider mb-5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Detailed Analytics & Metrics
        </h2>
        <MetricsDashboard
          metrics={metrics}
          history={history}
          totalResources={params.totalResources}
          snapshots={snapshots}
          onTakeSnapshot={onTakeSnapshot}
        />
      </motion.div>
    </motion.div>
  );
};

