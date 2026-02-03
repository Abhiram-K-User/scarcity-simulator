import { useRef, useEffect, useCallback, useState } from 'react';
import { SimulationNode, SimulationEdge, NodeState } from '@/types/simulation';

interface NetworkGraphProps {
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  onNodeClick?: (nodeId: string) => void;
  showHeatmap?: boolean;
  selectedNodeId?: string | null;
}

const stateColors: Record<NodeState, string> = {
  susceptible: '#8B9DC3',
  healthy: '#6B8CAE',
  'at-risk': '#C9A857',
  infected: '#B5636A',
  vaccinated: '#5C946E',
  recovered: '#7BA37A',
  collapsed: '#505A64',
};

const stateLabels: Record<NodeState, string> = {
  susceptible: 'Susceptible',
  healthy: 'Healthy',
  'at-risk': 'At Risk',
  infected: 'Infected',
  vaccinated: 'Vaccinated',
  recovered: 'Recovered',
  collapsed: 'Collapsed',
};

const drawNode = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  isHovered: boolean,
  isSelected: boolean,
  opacity: number = 1
) => {
  ctx.save();
  ctx.globalAlpha = opacity;

  // Enhanced glow effect with stronger shadows
  if (isHovered || isSelected) {
    ctx.shadowColor = color;
    ctx.shadowBlur = isSelected ? 25 : 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // More vibrant gradient for main circle
  const gradient = ctx.createRadialGradient(x - size * 0.35, y - size * 0.35, 0, x, y, size);
  gradient.addColorStop(0, color + 'ff');
  gradient.addColorStop(0.5, color + 'f5');
  gradient.addColorStop(0.8, color + 'dd');
  gradient.addColorStop(1, color + 'bb');

  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Enhanced border with glow
  if (isSelected) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Outer glow ring with animation
    ctx.beginPath();
    ctx.arc(x, y, size + 5, 0, Math.PI * 2);
    ctx.strokeStyle = color + 'aa';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (isHovered) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // Inner highlight for depth - more pronounced
  if (isHovered || isSelected) {
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
  } else {
    // Subtle highlight even when not hovered
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y - size * 0.25, size * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
  }

  ctx.restore();
};

const drawHeatmapOverlay = (
  ctx: CanvasRenderingContext2D,
  nodes: SimulationNode[],
  nodePositions: Map<string, { x: number; y: number }>,
  width: number,
  height: number
) => {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.6
  );
  gradient.addColorStop(0, 'rgba(181, 99, 106, 0.1)');
  gradient.addColorStop(1, 'rgba(181, 99, 106, 0)');

  nodes.forEach(node => {
    const pos = nodePositions.get(node.id);
    if (!pos) return;

    const intensity = node.riskScore || 0;
    if (intensity > 0) {
      const riskGradient = ctx.createRadialGradient(
        pos.x, pos.y, 0,
        pos.x, pos.y, 60 + intensity * 40
      );
      riskGradient.addColorStop(0, `rgba(181, 99, 106, ${intensity * 0.3})`);
      riskGradient.addColorStop(1, 'rgba(181, 99, 106, 0)');
      ctx.fillStyle = riskGradient;
      ctx.fillRect(0, 0, width, height);
    }
  });
};

export const NetworkGraph = ({
  nodes,
  edges,
  onNodeClick,
  showHeatmap = false,
  selectedNodeId
}: NetworkGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: SimulationNode } | null>(null);
  const fadeTimesRef = useRef<Map<string, number>>(new Map());

  const getNodeAtPosition = useCallback((mouseX: number, mouseY: number): SimulationNode | null => {
    for (const node of nodes) {
      const pos = nodePositionsRef.current.get(node.id);
      if (!pos) continue;

      const size = Math.sqrt(node.population / 100000) * 4 + 12;
      const distance = Math.sqrt((mouseX - pos.x) ** 2 + (mouseY - pos.y) ** 2);

      if (distance < size + 4) {
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

    // Calculate center positions first
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.35;

    // Enhanced gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    bgGradient.addColorStop(0, '#F5F7FA');
    bgGradient.addColorStop(0.5, '#F8F9FB');
    bgGradient.addColorStop(1, '#F5F7FA');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Subtle radial overlay
    const radialGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(rect.width, rect.height) * 0.6
    );
    radialGradient.addColorStop(0, 'rgba(107, 140, 174, 0.02)');
    radialGradient.addColorStop(1, 'rgba(107, 140, 174, 0)');
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Refined grid
    ctx.strokeStyle = 'rgba(107, 140, 174, 0.06)';
    ctx.lineWidth = 0.5;
    const gridSize = 40;

    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Calculate node positions

    nodes.forEach((node, i) => {
      if (!nodePositionsRef.current.has(node.id)) {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        const jitter = (Math.random() - 0.5) * 30;
        nodePositionsRef.current.set(node.id, {
          x: centerX + Math.cos(angle) * (radius + jitter),
          y: centerY + Math.sin(angle) * (radius + jitter),
        });
      }
    });

    // Heatmap overlay
    if (showHeatmap) {
      drawHeatmapOverlay(ctx, nodes, nodePositionsRef.current, rect.width, rect.height);
    }

    // Draw edges with thickness based on weight and infection spreading indicators
    edges.forEach(edge => {
      const sourcePos = nodePositionsRef.current.get(edge.source);
      const targetPos = nodePositionsRef.current.get(edge.target);
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourcePos && targetPos && sourceNode && targetNode) {
        const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target ||
          selectedNodeId === edge.source || selectedNodeId === edge.target;

        // Check if infection is actively spreading along this edge
        const isSpreadingInfection =
          (sourceNode.state === 'infected' && (targetNode.state === 'healthy' || targetNode.state === 'susceptible' || targetNode.state === 'at-risk')) ||
          (targetNode.state === 'infected' && (sourceNode.state === 'healthy' || sourceNode.state === 'susceptible' || sourceNode.state === 'at-risk'));

        // Check if edge is connected to vaccinated/recovered nodes (these edges should be dimmed/removed)
        const hasImmuneNode = sourceNode.state === 'vaccinated' || targetNode.state === 'vaccinated' ||
          sourceNode.state === 'recovered' || targetNode.state === 'recovered';

        // Calculate opacity and color based on node states
        let opacity = 0.15;
        let color = 'rgba(80, 90, 100';

        if (hasImmuneNode) {
          // Dimmed edges for vaccinated/recovered nodes
          opacity = 0.03;
        } else if (sourceNode.state === 'collapsed' || targetNode.state === 'collapsed') {
          opacity = 0.05;
        } else if (isSpreadingInfection) {
          // Active infection spread - use red/orange pulsing effect
          color = 'rgba(181, 99, 106';
          opacity = 0.6 + Math.sin(Date.now() / 200) * 0.2;
        } else if (sourceNode.state === 'infected' && targetNode.state === 'infected') {
          color = 'rgba(181, 99, 106';
          opacity = 0.3;
        } else if (isHighlighted) {
          opacity = 0.4;
        }

        ctx.strokeStyle = `${color}, ${opacity})`;
        ctx.lineWidth = isSpreadingInfection ? edge.weight * 4 + 1 : edge.weight * 3 + 0.5;
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();

        // Draw animated particles along spreading edges
        if (isSpreadingInfection) {
          const infectedPos = sourceNode.state === 'infected' ? sourcePos : targetPos;
          const targetPosEnd = sourceNode.state === 'infected' ? targetPos : sourcePos;

          // Multiple particles moving along the edge
          for (let p = 0; p < 3; p++) {
            const progress = ((Date.now() / 600 + p * 0.33) % 1);
            const particleX = infectedPos.x + (targetPosEnd.x - infectedPos.x) * progress;
            const particleY = infectedPos.y + (targetPosEnd.y - infectedPos.y) * progress;

            ctx.beginPath();
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(181, 99, 106, ${0.8 - progress * 0.5})`;
            ctx.fill();
          }
        }
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositionsRef.current.get(node.id);
      if (!pos) return;

      const size = Math.sqrt(node.population / 100000) * 4 + 12;
      const color = stateColors[node.state];
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNodeId === node.id;

      // Fade collapsed nodes
      let opacity = 1;
      if (node.state === 'collapsed') {
        opacity = 0.5;
      }

      drawNode(ctx, pos.x, pos.y, size, color, isHovered, isSelected, opacity);

      // Improved label with shadow for better readability
      ctx.save();
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = isHovered || isSelected ? 'rgba(20, 30, 40, 0.95)' : 'rgba(30, 40, 50, 0.75)';
      ctx.font = isHovered || isSelected ? 'bold 11px IBM Plex Sans, sans-serif' : '600 10px IBM Plex Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const label = node.name.split(' ')[1] || node.name;
      ctx.fillText(label, pos.x, pos.y + size + 6);
      ctx.restore();
    });
  }, [nodes, edges, hoveredNode, selectedNodeId, showHeatmap]);

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
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] rounded overflow-hidden border border-border">
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
          className="fixed z-50 bg-card border border-border rounded px-3 py-2 shadow-md pointer-events-none"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
          }}
        >
          <p className="text-sm font-semibold text-foreground mb-0.5">{tooltip.node.name}</p>
          <p className="text-xs text-muted-foreground mb-1">
            Pop: {(tooltip.node.population / 1000).toFixed(0)}K
          </p>
          <p className="text-xs font-medium mb-1.5" style={{ color: stateColors[tooltip.node.state] }}>
            {stateLabels[tooltip.node.state]}
          </p>
          <div className="text-xs text-muted-foreground space-y-0.5 border-t border-border/50 pt-1.5">
            <p className="flex justify-between gap-3">
              <span>Infected:</span>
              <span className="font-mono font-medium">{(tooltip.node.populationStats.infected / 1000).toFixed(1)}K</span>
            </p>
            <p className="flex justify-between gap-3">
              <span>Deaths:</span>
              <span className="font-mono font-medium text-stress-critical">{tooltip.node.cumulativeDeaths.toLocaleString()}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span>Recovered:</span>
              <span className="font-mono font-medium text-stress-low">{tooltip.node.cumulativeRecoveries.toLocaleString()}</span>
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 opacity-70 italic">
            Click for details
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-4 bg-card/90 backdrop-blur-sm rounded px-3 py-2 border border-border">
        {(['healthy', 'at-risk', 'infected', 'collapsed'] as NodeState[]).map(state => (
          <div key={state} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: stateColors[state] }}
            />
            <span className="text-xs text-muted-foreground">{stateLabels[state]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};