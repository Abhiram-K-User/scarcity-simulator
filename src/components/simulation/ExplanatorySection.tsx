import { AlertTriangle, Scale, TrendingDown } from 'lucide-react';

export const ExplanatorySection = () => {
  return (
    <div className="analytical-panel p-3">
      <h2 className="text-xs font-semibold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Understanding the Simulation
      </h2>
      
      <div className="space-y-2">
        <div className="flex gap-2 group p-2 rounded-lg hover:bg-white/40 transition-all duration-300">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg glassmorphic flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
            <AlertTriangle className="w-3.5 h-3.5 text-primary/70" />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors">Resource Scarcity</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Medical resources are finite. Not every at-risk region can receive intervention.
            </p>
          </div>
        </div>

        <div className="flex gap-2 group p-2 rounded-lg hover:bg-white/40 transition-all duration-300">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg glassmorphic flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
            <Scale className="w-3.5 h-3.5 text-primary/70" />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors">Trade-off Decisions</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Each allocation decision has cascading consequences across the network.
            </p>
          </div>
        </div>

        <div className="flex gap-2 group p-2 rounded-lg hover:bg-white/40 transition-all duration-300">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg glassmorphic flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
            <TrendingDown className="w-3.5 h-3.5 text-primary/70" />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors">System Collapse</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Prolonged infection leads to collapse — permanent system failure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};