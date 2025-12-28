import { useSimulation } from '@/hooks/useSimulation';
import { NetworkGraph } from '@/components/simulation/NetworkGraph';
import { ControlPanel } from '@/components/simulation/ControlPanel';
import { SimulationControls } from '@/components/simulation/SimulationControls';
import { MetricsDashboard } from '@/components/simulation/MetricsDashboard';
import { ExplanatorySection } from '@/components/simulation/ExplanatorySection';
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
  } = useSimulation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-medium text-foreground tracking-tight">
                Containment Under Scarcity
              </h1>
              <p className="text-xs text-muted-foreground">
                Epidemic Control Simulation
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${isRunning && !isPaused ? 'bg-stress-low animate-subtle-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground font-mono tracking-wider">
                {isRunning ? (isPaused ? 'PAUSED' : 'ACTIVE') : 'READY'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-5">
        <div className="grid lg:grid-cols-[1fr_300px] gap-5">
          {/* Left Column - Visualization & Detail */}
          <div className="space-y-5">
            {/* Network Visualization */}
            <div className="bg-card border border-border rounded overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <h2 className="analytical-header">
                  Network State
                </h2>
                <span className="text-xs font-mono text-muted-foreground">
                  {nodes.length} regions · {edges.length} connections
                </span>
              </div>
              <div className="aspect-[16/10]">
                <NetworkGraph 
                  nodes={nodes} 
                  edges={edges} 
                  onNodeClick={selectNode}
                  showHeatmap={showHeatmap}
                  selectedNodeId={selectedNode?.id}
                />
              </div>
            </div>

            {/* Node Detail + Explanation Row */}
            <div className="grid md:grid-cols-2 gap-5">
              <NodeDetailPanel 
                node={selectedNode} 
                onClose={() => selectNode(null)} 
              />
              {!selectedNode && <ExplanatorySection />}
              {selectedNode && <ExplanatorySection />}
            </div>
          </div>

          {/* Right Column - Controls & Metrics */}
          <div className="space-y-5">
            {/* Simulation Controls */}
            <div className="bg-card border border-border rounded p-4">
              <h2 className="analytical-header mb-3">
                Simulation
              </h2>
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

            {/* Parameters */}
            <div className="bg-card border border-border rounded p-4">
              <h2 className="analytical-header mb-3">
                Parameters
              </h2>
              <ControlPanel
                params={params}
                onChange={setParams}
                disabled={isRunning && !isPaused}
              />
            </div>

            {/* Metrics */}
            <div className="bg-card border border-border rounded p-4">
              <h2 className="analytical-header mb-3">
                Analysis
              </h2>
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
      <footer className="border-t border-border mt-8">
        <div className="container mx-auto px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            A systems analysis tool for studying resource allocation under epidemic containment scenarios.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;