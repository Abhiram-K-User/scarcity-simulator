import { AlertCircle, Shield, TrendingUp } from 'lucide-react';

export const ExplanatorySection = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-primary" />
        Understanding the Simulation
      </h2>
      
      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-node-protected flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">Limited Resources</h3>
            <p>
              Medical resources (vaccines, hospital beds, personnel) are finite. The simulation 
              demonstrates how these constraints force difficult prioritization decisions between regions.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <TrendingUp className="w-5 h-5 text-node-infected flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">Trade-offs Under Scarcity</h3>
            <p>
              Not all regions can be protected simultaneously. The priority weight parameter balances 
              between protecting high-priority regions versus highly-connected hubs that could accelerate spread.
            </p>
          </div>
        </div>
        
        <div className="bg-secondary/30 rounded-md p-4 mt-4">
          <p className="text-xs leading-relaxed">
            This simulation models a simplified SIR (Susceptible-Infected-Recovered) epidemic with 
            resource constraints. Real-world containment involves far more complexity, including 
            variable population densities, heterogeneous contact patterns, and dynamic policy responses.
          </p>
        </div>
      </div>
    </div>
  );
};