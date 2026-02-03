import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SimulationParams } from '@/types/simulation';
import { ScenarioSelector } from './ScenarioSelector';
import { DiseaseScenario } from '@/types/DiseaseScenarios';

interface ControlPanelProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
  disabled?: boolean;
  currentScenarioId?: string;
  onSelectScenario?: (scenario: DiseaseScenario) => void;
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
  description?: string;
}

const SliderControl = ({ label, value, min, max, step, unit, onChange, disabled, description }: SliderControlProps) => (
  <div className="space-y-1.5 group">
    <div className="flex justify-between items-baseline">
      <Label className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{label}</Label>
      <span className="text-xs font-mono text-muted-foreground bg-gradient-to-r from-primary/10 to-transparent px-2 py-0.5 rounded font-semibold">
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
    {description && (
      <p className="text-[10px] text-muted-foreground leading-relaxed opacity-80">{description}</p>
    )}
  </div>
);

export const ControlPanel = ({ params, onChange, disabled, currentScenarioId, onSelectScenario }: ControlPanelProps) => {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-3">
      {/* Scenario Selector */}
      {currentScenarioId && onSelectScenario && (
        <ScenarioSelector
          currentScenarioId={currentScenarioId}
          onSelectScenario={onSelectScenario}
          disabled={disabled}
        />
      )}

      {/* Transmission - Compact */}
      <div className="glassmorphic rounded-lg p-2.5 border border-primary/10">
        <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-2">Transmission</h3>
        <div className="space-y-3">
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

      {/* Resources - Compact */}
      <div className="glassmorphic rounded-lg p-2.5 border border-primary/10">
        <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-2">Resources</h3>
        <div className="space-y-3">
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

      {/* Initial State & Options - Compact 2-column */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glassmorphic rounded-lg p-2.5 border border-primary/10">
          <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-2">Initial</h3>
          <div className="space-y-3">
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

        <div className="glassmorphic rounded-lg p-2.5 border border-primary/10">
          <h3 className="text-[10px] font-medium text-primary/70 uppercase tracking-wider mb-2">Options</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-1.5 rounded hover:bg-white/40 transition-all duration-300">
              <Label className="text-[10px] font-medium text-foreground cursor-pointer">Uncertainty</Label>
              <Switch
                checked={params.uncertaintyEnabled}
                onCheckedChange={(v) => updateParam('uncertaintyEnabled', v)}
                disabled={disabled}
              />
            </div>
            <div className="flex items-center justify-between p-1.5 rounded hover:bg-white/40 transition-all duration-300">
              <Label className="text-[10px] font-medium text-foreground cursor-pointer">Delayed</Label>
              <Switch
                checked={params.delayedEffects}
                onCheckedChange={(v) => updateParam('delayedEffects', v)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};