import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
}

export const SimulationControls = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  onStep,
}: SimulationControlsProps) => {
  return (
    <div className="flex gap-2">
      {(!isRunning || isPaused) ? (
        <Button 
          onClick={onStart} 
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Play className="w-4 h-4 mr-2" />
          {isPaused ? 'Resume' : 'Start'}
        </Button>
      ) : (
        <Button 
          onClick={onPause} 
          variant="secondary"
          className="flex-1"
        >
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </Button>
      )}
      
      <Button 
        onClick={onStep} 
        variant="outline"
        disabled={isRunning && !isPaused}
        title="Step forward"
      >
        <StepForward className="w-4 h-4" />
      </Button>
      
      <Button 
        onClick={onReset} 
        variant="outline"
        title="Reset simulation"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};