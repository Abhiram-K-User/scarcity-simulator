import { useSimulation } from '@/hooks/useSimulation';
import { NetworkGraph } from '@/components/simulation/NetworkGraph';
import { ControlPanel } from '@/components/simulation/ControlPanel';
import { SimulationControls } from '@/components/simulation/SimulationControls';
import { MetricsDashboard } from '@/components/simulation/MetricsDashboard';
import { NodeDetailPanel } from '@/components/simulation/NodeDetailPanel';

const Index = () => {
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
      {/* Header */}
      <header className="glassmorphic-dark sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-slide-in-right">
              <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Containment Under Scarcity
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Epidemic Control Simulation & Resource Optimization
              </p>
            </div>
            <div className="flex items-center gap-3 animate-scale-in">
              <div className={`w-2 h-2 rounded-full ${isRunning && !isPaused ? 'bg-stress-low animate-subtle-pulse shadow-lg shadow-stress-low/50' : 'bg-muted-foreground'} transition-all duration-300`} />
              <span className="text-xs text-muted-foreground font-mono tracking-wider font-medium px-3 py-1 glassmorphic rounded-full">
                {isRunning ? (isPaused ? 'PAUSED' : 'ACTIVE') : 'READY'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-3 relative z-10">
        {/* Top Controls Row */}
        <div className="grid lg:grid-cols-[auto_1fr_auto] gap-3 mb-3 animate-fade-in">
          {/* Simulation Controls */}
          <div className="analytical-panel p-3">
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

          {/* Quick Metrics Bar */}
          <div className="analytical-panel p-3 flex items-center justify-around gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Infected Pop</div>
              <div className="text-lg font-mono font-semibold text-stress-high">{metrics.totalInfectedPop.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Deaths</div>
              <div className="text-lg font-mono font-semibold text-stress-critical">{metrics.totalDeaths.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Recoveries</div>
              <div className="text-lg font-mono font-semibold text-stress-low">{metrics.totalRecoveries.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">System Stress</div>
              <div className="text-lg font-mono font-semibold" style={{ color: metrics.systemStress > 0.75 ? 'hsl(0, 50%, 45%)' : metrics.systemStress > 0.5 ? 'hsl(0, 40%, 55%)' : 'hsl(150, 30%, 50%)' }}>
                {(metrics.systemStress * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Time Info */}
          <div className="analytical-panel p-3 flex items-center gap-3">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Time</div>
              <div className="text-lg font-mono font-semibold">t={metrics.currentTime}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-3">
          {/* Left: Graph + Node Details */}
          <div className="space-y-3">
            {/* Network Visualization */}
            <div className="analytical-panel overflow-hidden animate-fade-in">
              <div className="px-3 py-2 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                <h2 className="text-xs font-medium text-primary/80 uppercase tracking-wider">Network State</h2>
                <span className="text-xs font-mono text-muted-foreground bg-white/50 px-2 py-0.5 rounded">
                  {nodes.length} regions · {edges.length} connections
                </span>
              </div>
              <div className="aspect-[16/9]">
                <NetworkGraph
                  nodes={nodes}
                  edges={edges}
                  onNodeClick={selectNode}
                  showHeatmap={showHeatmap}
                  selectedNodeId={selectedNode?.id}
                />
              </div>
            </div>

            {/* Node Detail Panel */}
            {selectedNode && (
              <div className="animate-slide-in-right">
                <NodeDetailPanel
                  node={selectedNode}
                  onClose={() => selectNode(null)}
                  onUpdateName={updateNodeName}
                />
              </div>
            )}
          </div>

          {/* Right: Parameters + Metrics */}
          <div className="space-y-3">
            {/* Parameters - Compact */}
            <div className="analytical-panel p-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xs font-medium text-primary/80 uppercase tracking-wider mb-3">Parameters</h2>
              <ControlPanel
                params={params}
                onChange={setParams}
                disabled={isRunning && !isPaused}
                currentScenarioId={currentScenario.id}
                onSelectScenario={applyScenario}
              />
            </div>

            {/* Metrics - Compact */}
            <div className="analytical-panel p-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xs font-medium text-primary/80 uppercase tracking-wider mb-3">Analysis</h2>
              <MetricsDashboard
                metrics={metrics}
                history={history}
                totalResources={params.totalResources}
                snapshots={snapshots}
                onTakeSnapshot={takeSnapshot}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 glassmorphic-dark border-t border-white/20 mt-12">
        <div className="container mx-auto px-6 py-4">
          <p className="text-xs text-muted-foreground text-center">
            A systems analysis tool for studying resource allocation under epidemic containment scenarios.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;