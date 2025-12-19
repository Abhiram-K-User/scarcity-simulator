import { useRef, useEffect, useCallback, useState } from 'react';
import { SimulationNode, SimulationEdge, NodeState } from '@/types/simulation';

interface NetworkGraphProps {
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  onNodeClick?: (nodeId: string) => void;
}

const stateColors: Record<NodeState, string> = {
  susceptible: '#4A9EFF',
  infected: '#F59E0B',
  recovered: '#10B981',
  protected: '#A78BFA',
};

const stateGlowColors: Record<NodeState, string> = {
  susceptible: 'rgba(74, 158, 255, 0.3)',
  infected: 'rgba(245, 158, 11, 0.5)',
  recovered: 'rgba(16, 185, 129, 0.3)',
  protected: 'rgba(167, 139, 250, 0.3)',
};

// Human silhouette path (simplified SVG person)
const drawHumanIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  glowColor: string,
  isHovered: boolean
) => {
  const scale = size / 24;
  
  // Glow effect
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = isHovered ? 25 : 15;
  ctx.fillStyle = color;
  
  // Head (circle)
  ctx.beginPath();
  ctx.arc(x, y - scale * 10, scale * 5, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - scale * 4);
  ctx.lineTo(x - scale * 6, y + scale * 2);
  ctx.lineTo(x - scale * 4, y + scale * 4);
  ctx.lineTo(x - scale * 2, y);
  ctx.lineTo(x - scale * 2, y + scale * 10);
  ctx.lineTo(x - scale * 4, y + scale * 14);
  ctx.lineTo(x - scale * 2, y + scale * 15);
  ctx.lineTo(x, y + scale * 10);
  ctx.lineTo(x + scale * 2, y + scale * 15);
  ctx.lineTo(x + scale * 4, y + scale * 14);
  ctx.lineTo(x + scale * 2, y + scale * 10);
  ctx.lineTo(x + scale * 2, y);
  ctx.lineTo(x + scale * 4, y + scale * 4);
  ctx.lineTo(x + scale * 6, y + scale * 2);
  ctx.lineTo(x, y - scale * 4);
  ctx.closePath();
  ctx.fill();
  
  // Highlight effect when hovered
  if (isHovered) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  ctx.restore();
};

// Draw lab background
const drawLabBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // Dark gradient background
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  gradient.addColorStop(0, 'hsl(210, 40%, 12%)');
  gradient.addColorStop(1, 'hsl(220, 50%, 6%)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Grid pattern
  ctx.strokeStyle = 'rgba(100, 180, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Hexagon pattern overlay (lab/scientific feel)
  ctx.strokeStyle = 'rgba(100, 180, 255, 0.03)';
  const hexRadius = 60;
  const hexHeight = hexRadius * Math.sqrt(3);
  
  for (let row = -1; row < height / hexHeight + 1; row++) {
    for (let col = -1; col < width / (hexRadius * 1.5) + 1; col++) {
      const centerX = col * hexRadius * 1.5;
      const centerY = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = centerX + hexRadius * 0.7 * Math.cos(angle);
        const hy = centerY + hexRadius * 0.7 * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  
  // Microscope lens effect (vignette corners)
  const vignetteGradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.8
  );
  vignetteGradient.addColorStop(0, 'transparent');
  vignetteGradient.addColorStop(1, 'rgba(0, 10, 30, 0.6)');
  ctx.fillStyle = vignetteGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Subtle DNA helix pattern
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.02)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const offsetX = width * (0.1 + i * 0.4);
    ctx.beginPath();
    for (let y = 0; y < height; y += 2) {
      const wave = Math.sin(y * 0.02 + i) * 30;
      if (y === 0) ctx.moveTo(offsetX + wave, y);
      else ctx.lineTo(offsetX + wave, y);
    }
    ctx.stroke();
  }
};

export const NetworkGraph = ({ nodes, edges, onNodeClick }: NetworkGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: SimulationNode } | null>(null);

  const getNodeAtPosition = useCallback((mouseX: number, mouseY: number): SimulationNode | null => {
    for (const node of nodes) {
      const pos = nodePositionsRef.current.get(node.id);
      if (!pos) continue;
      
      const size = Math.sqrt(node.population / 100000) * 8 + 20;
      const distance = Math.sqrt((mouseX - pos.x) ** 2 + (mouseY - pos.y) ** 2);
      
      if (distance < size) {
        return node;
      }
    }
    return null;
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const node = getNodeAtPosition(mouseX, mouseY);
    setHoveredNode(node?.id || null);
    
    if (node) {
      setTooltip({ x: e.clientX, y: e.clientY, node });
      canvas.style.cursor = 'pointer';
    } else {
      setTooltip(null);
      canvas.style.cursor = 'default';
    }
  }, [getNodeAtPosition]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const node = getNodeAtPosition(mouseX, mouseY);
    if (node && onNodeClick) {
      onNodeClick(node.id);
    }
  }, [getNodeAtPosition, onNodeClick]);

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

    // Draw lab background
    drawLabBackground(ctx, rect.width, rect.height);

    // Calculate node positions if not set
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.35;

    nodes.forEach((node, i) => {
      if (!nodePositionsRef.current.has(node.id)) {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        const jitter = (Math.random() - 0.5) * 50;
        nodePositionsRef.current.set(node.id, {
          x: centerX + Math.cos(angle) * (radius + jitter),
          y: centerY + Math.sin(angle) * (radius + jitter),
        });
      }
    });

    // Draw edges with gradient
    edges.forEach(edge => {
      const sourcePos = nodePositionsRef.current.get(edge.source);
      const targetPos = nodePositionsRef.current.get(edge.target);
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourcePos && targetPos && sourceNode && targetNode) {
        const gradient = ctx.createLinearGradient(
          sourcePos.x, sourcePos.y,
          targetPos.x, targetPos.y
        );
        gradient.addColorStop(0, stateGlowColors[sourceNode.state]);
        gradient.addColorStop(1, stateGlowColors[targetNode.state]);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();
      }
    });

    // Draw nodes (humans)
    nodes.forEach(node => {
      const pos = nodePositionsRef.current.get(node.id);
      if (!pos) return;

      const size = Math.sqrt(node.population / 100000) * 8 + 20;
      const color = stateColors[node.state];
      const glowColor = stateGlowColors[node.state];
      const isHovered = hoveredNode === node.id;

      drawHumanIcon(ctx, pos.x, pos.y, size, color, glowColor, isHovered);

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.name.split(' ')[1] || node.name, pos.x, pos.y + size * 0.8);
    });
  }, [nodes, edges, hoveredNode]);

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
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => {
          setHoveredNode(null);
          setTooltip(null);
        }}
      />
      
      {/* Tooltip */}
      {tooltip && (
        <div 
          className="fixed z-50 bg-card/95 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{ 
            left: tooltip.x + 15, 
            top: tooltip.y + 15,
            transform: 'translateY(-50%)'
          }}
        >
          <p className="text-sm font-medium text-foreground">{tooltip.node.name}</p>
          <p className="text-xs text-muted-foreground">
            Population: {tooltip.node.population.toLocaleString()}
          </p>
          <p className="text-xs capitalize" style={{ color: stateColors[tooltip.node.state] }}>
            Status: {tooltip.node.state}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to toggle protection
          </p>
        </div>
      )}
      
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

      {/* Lab indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-card/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-muted-foreground font-mono">LAB SIMULATION</span>
      </div>
    </div>
  );
};
