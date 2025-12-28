import { AlertTriangle, Scale, TrendingDown } from 'lucide-react';

export const ExplanatorySection = () => {
  return (
    <div className="bg-card border border-border rounded p-5">
      <h2 className="text-sm font-medium text-foreground mb-4">
        Understanding the Simulation
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded bg-secondary flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-foreground mb-1">Resource Scarcity</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Medical resources are finite. Not every at-risk region can receive intervention.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded bg-secondary flex items-center justify-center">
            <Scale className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-foreground mb-1">Trade-off Decisions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each allocation decision has cascading consequences across the network.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded bg-secondary flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-foreground mb-1">System Collapse</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prolonged infection leads to collapse — permanent system failure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};