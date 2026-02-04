import { SimulationParams } from '@/types/simulation';
import { DiseaseScenario, diseaseScenarios } from '@/types/DiseaseScenarios';
import { motion } from 'framer-motion';
import { Syringe, Activity, Settings } from 'lucide-react';

interface ScenariosTabProps {
  currentScenario: DiseaseScenario;
  applyScenario: (scenario: DiseaseScenario) => void;
  params: SimulationParams;
  setParams: (params: SimulationParams) => void;
  isRunning: boolean;
}

export const ScenariosTab = ({
  currentScenario,
  applyScenario,
  params,
  setParams,
  isRunning,
}: ScenariosTabProps) => {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setParams({ ...params, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Disease Scenario Library */}
      <div>
        <h2 className="text-sm font-medium text-primary/80 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Disease Scenario Library
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diseaseScenarios.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !isRunning && applyScenario(scenario)}
              disabled={isRunning}
              className={`analytical-panel p-6 text-left hover-lift relative overflow-hidden ${
                currentScenario.id === scenario.id ? 'ring-2 ring-primary' : ''
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={!isRunning ? { scale: 1.02 } : {}}
              whileTap={!isRunning ? { scale: 0.98 } : {}}
            >
              {currentScenario.id === scenario.id && (
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              )}
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  
                  {currentScenario.id === scenario.id && (
                    <div className="glassmorphic px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-primary">Active</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2 text-foreground">{scenario.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Infection Rate</span>
                    <span className="font-semibold">{(scenario.params.infectionRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Recovery Rate</span>
                    <span className="font-semibold">{(scenario.params.recoveryRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Death Rate</span>
                    <span className="font-semibold">{(scenario.params.deathRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="analytical-panel p-6"
        >
          <h3 className="text-sm font-medium text-primary/80 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Quick Configuration
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Initial Infected Regions
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={params.initialInfected}
                  onChange={(e) => updateParam('initialInfected', Number(e.target.value))}
                  disabled={isRunning}
                  className="flex-1"
                />
                <div className="glassmorphic px-4 py-2 rounded-lg">
                  <span className="font-semibold text-primary">{params.initialInfected}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Total Resources (Vaccines per Step)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={params.totalResources}
                  onChange={(e) => updateParam('totalResources', Number(e.target.value))}
                  disabled={isRunning}
                  className="flex-1"
                />
                <div className="glassmorphic px-4 py-2 rounded-lg">
                  <span className="font-semibold text-primary">{params.totalResources}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Simulation Speed
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="200"
                  value={params.timeStepSpeed}
                  onChange={(e) => updateParam('timeStepSpeed', Number(e.target.value))}
                  className="flex-1"
                />
                <div className="glassmorphic px-4 py-2 rounded-lg">
                  <span className="font-semibold text-primary">
                    {params.timeStepSpeed}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="analytical-panel p-6"
        >
          <h3 className="text-sm font-medium text-primary/80 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Syringe className="w-4 h-4" />
            Advanced Options
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 glassmorphic rounded-lg">
              <div>
                <div className="font-medium text-foreground mb-1">Uncertainty Mode</div>
                <div className="text-sm text-muted-foreground">
                  Enable random variations in transmission
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.uncertaintyEnabled}
                  onChange={(e) => updateParam('uncertaintyEnabled', e.target.checked)}
                  disabled={isRunning}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 glassmorphic rounded-lg">
              <div>
                <div className="font-medium text-foreground mb-1">Delayed Effects</div>
                <div className="text-sm text-muted-foreground">
                  Simulate realistic incubation periods
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.delayedEffects}
                  onChange={(e) => updateParam('delayedEffects', e.target.checked)}
                  disabled={isRunning}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {isRunning && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm text-primary">
                  ⚠️ Stop the simulation to change configuration
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
