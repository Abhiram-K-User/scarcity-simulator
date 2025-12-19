import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
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
  <div className="space-y-3">
    <div className="flex justify-between items-baseline">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <span className="text-sm font-mono text-primary">
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
      <p className="text-xs text-muted-foreground">{description}</p>
    )}
  </div>
);

export const ControlPanel = ({ params, onChange, disabled }: ControlPanelProps) => {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Disease Parameters
        </h3>
        <div className="space-y-5">
          <SliderControl
            label="Infection Rate"
            value={params.infectionRate}
            min={0.01}
            max={0.5}
            step={0.01}
            onChange={(v) => updateParam('infectionRate', v)}
            disabled={disabled}
            description="Probability of transmission per contact"
          />
          <SliderControl
            label="Recovery Rate"
            value={params.recoveryRate}
            min={0.01}
            max={0.3}
            step={0.01}
            onChange={(v) => updateParam('recoveryRate', v)}
            disabled={disabled}
            description="Probability of recovery per time step"
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Resource Allocation
        </h3>
        <div className="space-y-5">
          <SliderControl
            label="Medical Resources"
            value={params.totalResources}
            min={0}
            max={15}
            step={1}
            onChange={(v) => updateParam('totalResources', v)}
            disabled={disabled}
            description="Vaccines / hospital capacity units"
          />
          <SliderControl
            label="Priority Weight"
            value={params.priorityWeight}
            min={0}
            max={1}
            step={0.1}
            onChange={(v) => updateParam('priorityWeight', v)}
            disabled={disabled}
            description="Balance between region priority and connectivity"
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Initial Conditions
        </h3>
        <div className="space-y-5">
          <SliderControl
            label="Initial Infected"
            value={params.initialInfected}
            min={1}
            max={5}
            step={1}
            onChange={(v) => updateParam('initialInfected', v)}
            disabled={disabled}
            description="Number of initially infected regions"
          />
          <SliderControl
            label="Simulation Speed"
            value={params.timeStepSpeed}
            min={100}
            max={2000}
            step={100}
            unit="ms"
            onChange={(v) => updateParam('timeStepSpeed', v)}
            description="Time between simulation steps"
          />
        </div>
      </div>
    </div>
  );
};