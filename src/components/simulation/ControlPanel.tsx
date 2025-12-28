import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SimulationParams } from '@/types/simulation';

interface ControlPanelProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
  disabled?: boolean;
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
  <div className="space-y-2">
    <div className="flex justify-between items-baseline">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <span className="text-xs font-mono text-muted-foreground">
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
      className="cursor-pointer"
    />
    {description && (
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    )}
  </div>
);

export const ControlPanel = ({ params, onChange, disabled }: ControlPanelProps) => {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="analytical-header mb-3">
          Transmission
        </h3>
        <div className="space-y-4">
          <SliderControl
            label="Infection Rate"
            value={params.infectionRate}
            min={0.01}
            max={0.4}
            step={0.01}
            onChange={(v) => updateParam('infectionRate', v)}
            disabled={disabled}
            description="Per-contact transmission probability"
          />
          <SliderControl
            label="Recovery Rate"
            value={params.recoveryRate}
            min={0.01}
            max={0.2}
            step={0.01}
            onChange={(v) => updateParam('recoveryRate', v)}
            disabled={disabled}
            description="Recovery probability per step"
          />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="analytical-header mb-3">
          Resources
        </h3>
        <div className="space-y-4">
          <SliderControl
            label="Available Units"
            value={params.totalResources}
            min={0}
            max={10}
            step={1}
            onChange={(v) => updateParam('totalResources', v)}
            disabled={disabled}
            description="Medical intervention capacity"
          />
          <SliderControl
            label="Priority Weight"
            value={params.priorityWeight}
            min={0}
            max={1}
            step={0.1}
            onChange={(v) => updateParam('priorityWeight', v)}
            disabled={disabled}
            description="Balance: region priority vs. connectivity"
          />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="analytical-header mb-3">
          Initial State
        </h3>
        <div className="space-y-4">
          <SliderControl
            label="Initial Infected"
            value={params.initialInfected}
            min={1}
            max={4}
            step={1}
            onChange={(v) => updateParam('initialInfected', v)}
            disabled={disabled}
          />
          <SliderControl
            label="Step Interval"
            value={params.timeStepSpeed}
            min={200}
            max={2000}
            step={100}
            unit="ms"
            onChange={(v) => updateParam('timeStepSpeed', v)}
          />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="analytical-header mb-3">
          Model Options
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium text-foreground">Uncertainty</Label>
              <p className="text-xs text-muted-foreground">Add stochastic variation</p>
            </div>
            <Switch
              checked={params.uncertaintyEnabled}
              onCheckedChange={(v) => updateParam('uncertaintyEnabled', v)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium text-foreground">Delayed Effects</Label>
              <p className="text-xs text-muted-foreground">Resource allocation lag</p>
            </div>
            <Switch
              checked={params.delayedEffects}
              onCheckedChange={(v) => updateParam('delayedEffects', v)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};