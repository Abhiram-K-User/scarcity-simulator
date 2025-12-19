import { useSimulation } from '@/hooks/useSimulation';
import { NetworkGraph } from '@/components/simulation/NetworkGraph';
import { ControlPanel } from '@/components/simulation/ControlPanel';
import { SimulationControls } from '@/components/simulation/SimulationControls';
import { MetricsDashboard } from '@/components/simulation/MetricsDashboard';
import { ExplanatorySection } from '@/components/simulation/ExplanatorySection';

const Index = () => {
  const {
    nodes,
    edges,
    params,
    setParams,
    metrics,
    history,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
    stepOnce,
  } = useSimulation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Containment Under Scarcity
              </h1>
              <p className="text-sm text-muted-foreground">
                Epidemic Control Simulator
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning && !isPaused ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground font-mono">
                {isRunning ? (isPaused ? 'PAUSED' : 'RUNNING') : 'READY'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left Column - Visualization & Explanation */}
          <div className="space-y-6">
            {/* Network Visualization */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Network Visualization
                </h2>
              </div>
              <div className="aspect-[16/10]">
                <NetworkGraph nodes={nodes} edges={edges} />
              </div>
            </div>

            {/* Explanation */}
            <ExplanatorySection />
          </div>

          {/* Right Column - Controls & Metrics */}
          <div className="space-y-6">
            {/* Simulation Controls */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Simulation
              </h2>
              <SimulationControls
                isRunning={isRunning}
                isPaused={isPaused}
                onStart={start}
                onPause={pause}
                onReset={reset}
                onStep={stepOnce}
              />
            </div>

            {/* Parameters */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Parameters
              </h2>
              <ControlPanel
                params={params}
                onChange={setParams}
                disabled={isRunning && !isPaused}
              />
            </div>

            {/* Metrics */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Metrics
              </h2>
              <MetricsDashboard
                metrics={metrics}
                history={history}
                totalResources={params.totalResources}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            A systems simulation for studying resource allocation trade-offs during epidemic containment.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;