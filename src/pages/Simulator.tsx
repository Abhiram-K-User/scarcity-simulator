import { useSimulation } from '@/hooks/useSimulation';
import { CommandTab } from '@/components/tabs/CommandTab';
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab';
import { DetailsTab } from '@/components/tabs/DetailsTab';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SimulationControls } from '@/components/simulation/SimulationControls';
import { AnimatedBackground } from '@/components/AnimatedBackground.tsx';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, BarChart3, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TabId = 'command' | 'analytics' | 'details';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'command', label: 'Graph Simulation', icon: Network },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'details', label: 'Details', icon: FileText },
];

const Simulator = () => {
  const [activeTab, setActiveTab] = useState<TabId>('command');
  const navigate = useNavigate();
  
  const {
    nodes,
    edges,
    params,
    setParams,
    metrics,
    history,
    snapshots,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
    stepOnce,
    takeSnapshot,
    selectedNode,
    selectNode,
    showHeatmap,
    setShowHeatmap,
    updateNodeName,
    currentScenario,
    applyScenario,
  } = useSimulation();

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      {/* Header with Tabs */}
      <header className="glassmorphic-dark sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => navigate('/')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Scarcity Simulator
                </h1>
                <p className="text-xs text-muted-foreground">
                  Resource Optimization & Containment Analysis
                </p>
              </div>
            </motion.button>

            {/* Tabs in Header */}
            <nav className="flex gap-2 ml-auto mr-auto flex-1 justify-center">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-5 py-2.5 rounded-lg font-medium text-base transition-all duration-300 flex items-center gap-2 ${
                        isActive
                          ? 'text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg"
                          initial={false}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                      
                      <Icon className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  isRunning && !isPaused 
                    ? 'bg-stress-low animate-pulse shadow-lg shadow-stress-low/50' 
                    : 'bg-muted-foreground'
                } transition-all duration-300`} />
                <span className="text-xs text-muted-foreground tracking-wider font-semibold px-3 py-1 glassmorphic rounded-full">
                  {isRunning ? (isPaused ? 'PAUSED' : 'ACTIVE') : 'READY'}
                </span>
                <div className="h-6 w-px bg-border/50" />
                <span className="text-xs text-muted-foreground tracking-wider font-semibold px-3 py-1 glassmorphic rounded-full">
                  t={metrics.currentTime}
                </span>
              </div>
              
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Simulation Controls - Always Visible */}
      <div className="glassmorphic-dark border-b border-border/50 sticky top-[73px] z-40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-3">
          <h3 className="text-xs font-medium text-primary/70 uppercase tracking-wider mb-2">Simulation Controls</h3>
          <SimulationControls
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onStep={stepOnce}
            showHeatmap={showHeatmap}
            onToggleHeatmap={setShowHeatmap}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'command' && (
              <CommandTab
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedNode?.id || null}
                selectNode={selectNode}
                showHeatmap={showHeatmap}
                setShowHeatmap={setShowHeatmap}
                metrics={metrics}
                isRunning={isRunning}
                isPaused={isPaused}
                onNodeClick={() => setActiveTab('details')}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab
                params={params}
                setParams={setParams}
                metrics={metrics}
                history={history}
                snapshots={snapshots}
                isRunning={isRunning}
                isPaused={isPaused}
                currentScenario={currentScenario}
                applyScenario={applyScenario}
                onTakeSnapshot={takeSnapshot}
              />
            )}

            {activeTab === 'details' && (
              <DetailsTab
                selectedNode={selectedNode}
                selectNode={selectNode}
                updateNodeName={updateNodeName}
                snapshots={snapshots}
                onTakeSnapshot={takeSnapshot}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Simulator;
