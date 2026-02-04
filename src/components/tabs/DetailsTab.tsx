import { SimulationNode, Snapshot } from '@/types/simulation';
import { NodeDetailPanel } from '@/components/simulation/NodeDetailPanel';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface DetailsTabProps {
  selectedNode: SimulationNode | null;
  selectNode: (nodeId: string | null) => void;
  updateNodeName: (nodeId: string, name: string) => void;
  snapshots: Snapshot[];
  onTakeSnapshot: () => void;
}

export const DetailsTab = ({
  selectedNode,
  selectNode,
  updateNodeName,
  snapshots,
  onTakeSnapshot,
}: DetailsTabProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      {/* Selected Node Details */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h2 className="text-sm font-medium text-primary/80 uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Selected Region Details
          </h2>
          
          {selectedNode ? (
            <NodeDetailPanel
              node={selectedNode}
              onClose={() => selectNode(null)}
              onUpdateName={updateNodeName}
            />
          ) : (
            <div className="analytical-panel p-12 text-center">
              <div className="text-6xl mb-4 opacity-20">🔍</div>
              <p className="text-muted-foreground">
                Select a region from the network graph to view detailed information
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Snapshots */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-primary/80 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Simulation Snapshots
            </h2>
            
            <motion.button
              onClick={onTakeSnapshot}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium flex items-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera className="w-4 h-4" />
              Take Snapshot
            </motion.button>
          </div>

          {snapshots.length > 0 ? (
            <div className="space-y-3">
              {snapshots.map((snapshot, index) => (
                <motion.div
                  key={snapshot.time}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="analytical-panel p-4 hover-lift cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{snapshot.label}</h3>
                      <p className="text-sm text-muted-foreground">Time: t={snapshot.time}</p>
                    </div>
                    <div className="glassmorphic px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-primary">#{index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Infected</div>
                      <div className="text-sm font-semibold text-stress-high">
                        {snapshot.metrics.totalInfected}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Deaths</div>
                      <div className="text-sm font-semibold text-stress-critical">
                        {snapshot.metrics.totalDeaths.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Recovered</div>
                      <div className="text-sm font-semibold text-stress-low">
                        {snapshot.metrics.totalRecoveries.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Stress</div>
                      <div className="text-sm font-semibold" style={{
                        color: snapshot.metrics.systemStress > 0.75 
                          ? 'hsl(var(--stress-critical))' 
                          : snapshot.metrics.systemStress > 0.5 
                          ? 'hsl(var(--stress-high))' 
                          : 'hsl(var(--stress-low))'
                      }}>
                        {(snapshot.metrics.systemStress * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="analytical-panel p-12 text-center">
              <div className="text-6xl mb-4 opacity-20">📸</div>
              <p className="text-muted-foreground">
                No snapshots taken yet. Capture key moments during simulation.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
