import { useRef, useEffect, useCallback } from 'react';
import { SimulationNode, SimulationEdge, NodeState } from '@/types/simulation';

interface NetworkGraphProps {
  nodes: SimulationNode[];
  edges: SimulationEdge[];
}

const stateColors: Record<NodeState, string> = {
  susceptible: '#4A9EFF',
  infected: '#F59E0B',
  recovered: '#10B981',
  protected: '#A78BFA',
};

const stateGlowColors: Record<NodeState, string> = {
  susceptible: 'rgba(74, 158, 255, 0.4)',
  infected: 'rgba(245, 158, 11, 0.5)',
  recovered: 'rgba(16, 185, 129, 0.4)',
  protected: 'rgba(167, 139, 250, 0.4)',
};

export const NetworkGraph = ({ nodes, edges }: NetworkGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = 'hsl(222, 47%, 6%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Calculate node positions if not set
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.35;

    nodes.forEach((node, i) => {
      if (!nodePositionsRef.current.has(node.id)) {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        const jitter = (Math.random() - 0.5) * 40;
        nodePositionsRef.current.set(node.id, {
          x: centerX + Math.cos(angle) * (radius + jitter),
          y: centerY + Math.sin(angle) * (radius + jitter),
        });
      }
    });

    // Draw edges
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    edges.forEach(edge => {
      const sourcePos = nodePositionsRef.current.get(edge.source);
      const targetPos = nodePositionsRef.current.get(edge.target);
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositionsRef.current.get(node.id);
      if (!pos) return;

      const nodeRadius = Math.sqrt(node.population / 100000) * 6 + 8;
      const color = stateColors[node.state];
      const glowColor = stateGlowColors[node.state];

      // Glow effect
      const gradient = ctx.createRadialGradient(
        pos.x, pos.y, 0,
        pos.x, pos.y, nodeRadius * 2.5
      );
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Node body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Node border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.name.split(' ')[1] || node.name, pos.x, pos.y + nodeRadius + 4);
    });
  }, [nodes, edges]);

  useEffect(() => {
    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  useEffect(() => {
    const handleResize = () => {
      nodePositionsRef.current.clear();
      draw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
        {(['susceptible', 'infected', 'recovered', 'protected'] as NodeState[]).map(state => (
          <div key={state} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: stateColors[state] }}
            />
            <span className="text-xs text-muted-foreground capitalize">{state}</span>
          </div>
        ))}
      </div>
    </div>
  );
};