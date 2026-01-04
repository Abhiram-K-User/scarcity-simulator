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
    <div className="flex items-center gap-2">
      {!isRunning || isPaused ? (
        <Button 
          onClick={onStart} 
          size="sm"
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          {isPaused ? 'Resume' : 'Start'}
        </Button>
      ) : (
        <Button 
          onClick={onPause} 
          variant="secondary"
          size="sm"
          className="glassmorphic hover:bg-white/60 border border-white/40 transition-all duration-300 hover:scale-105 transform shadow-md"
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
        className="glassmorphic hover:bg-white/60 border border-white/40 transition-all duration-300 hover:scale-110 transform shadow-sm"
      >
        <StepForward className="w-3.5 h-3.5" />
      </Button>
      
      <Button 
        onClick={onReset} 
        variant="outline"
        size="sm"
        title="Reset simulation"
        className="glassmorphic hover:bg-white/60 border border-white/40 transition-all duration-300 hover:scale-110 transform shadow-sm"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </Button>

      <div className="flex items-center gap-2 ml-2 px-2 py-1 glassmorphic rounded border border-white/30">
        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
        <Label className="text-xs text-muted-foreground cursor-pointer">Heatmap</Label>
        <Switch
          checked={showHeatmap}
          onCheckedChange={onToggleHeatmap}
        />
      </div>
    </div>
  );
};