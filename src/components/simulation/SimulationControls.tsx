import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, StepForward, Layers } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SimulationControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: (show: boolean) => void;
}

export const SimulationControls = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  onStep,
  showHeatmap,
  onToggleHeatmap,
}: SimulationControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {!isRunning || isPaused ? (
          <Button 
            onClick={onStart} 
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {isPaused ? 'Resume' : 'Start'}
          </Button>
        ) : (
          <Button 
            onClick={onPause} 
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <Pause className="w-3.5 h-3.5 mr-1.5" />
            Pause
          </Button>
        )}
        
        <Button 
          onClick={onStep} 
          variant="outline"
          size="sm"
          title="Step forward"
        >
          <StepForward className="w-3.5 h-3.5" />
        </Button>
        
        <Button 
          onClick={onReset} 
          variant="outline"
          size="sm"
          title="Reset simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
          <Label className="text-xs text-muted-foreground">Risk Heatmap</Label>
        </div>
        <Switch
          checked={showHeatmap}
          onCheckedChange={onToggleHeatmap}
        />
      </div>
    </div>
  );
};