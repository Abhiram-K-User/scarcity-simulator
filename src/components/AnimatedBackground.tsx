import { useEffect, useState } from 'react';

/**
 * AnimatedBackground Component
 * 
 * Provides a subtle, non-distracting animated background with:
 * 1. Network nodes with connecting edges (graph representation)
 * 2. Large virus illustrations (epidemic theme)
 * 3. Large shield icons (protection theme)
 * 
 * All animations are very slow, looped, and have low opacity to maintain
 * a professional academic appearance.
 */
export const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="animated-bg-container">
      {/* Network Nodes & Edges Layer */}
      <svg className="network-layer" xmlns="http://www.w3.org/2000/svg">
        {/* Network Group 1 - Top Left */}
        <g className="network-group network-1">
          <line x1="20%" y1="20%" x2="28%" y2="25%" className="network-edge" />
          <line x1="28%" y1="25%" x2="25%" y2="33%" className="network-edge" />
          <line x1="20%" y1="20%" x2="25%" y2="33%" className="network-edge" />
          <circle cx="20%" cy="20%" r="3" className="network-node" />
          <circle cx="28%" cy="25%" r="3" className="network-node" />
          <circle cx="25%" cy="33%" r="3" className="network-node" />
        </g>

        {/* Network Group 2 - Top Right */}
        <g className="network-group network-2">
          <line x1="72%" y1="20%" x2="78%" y2="25%" className="network-edge" />
          <line x1="78%" y1="25%" x2="75%" y2="33%" className="network-edge" />
          <circle cx="72%" cy="20%" r="3" className="network-node" />
          <circle cx="78%" cy="25%" r="3" className="network-node" />
          <circle cx="75%" cy="33%" r="3" className="network-node" />
        </g>

        {/* Network Group 3 - Bottom Left */}
        <g className="network-group network-3">
          <line x1="25%" y1="67%" x2="32%" y2="72%" className="network-edge" />
          <line x1="32%" y1="72%" x2="28%" y2="80%" className="network-edge" />
          <line x1="25%" y1="67%" x2="28%" y2="80%" className="network-edge" />
          <circle cx="25%" cy="67%" r="3" className="network-node" />
          <circle cx="32%" cy="72%" r="3" className="network-node" />
          <circle cx="28%" cy="80%" r="3" className="network-node" />
        </g>

        {/* Network Group 4 - Bottom Right */}
        <g className="network-group network-4">
          <line x1="68%" y1="67%" x2="76%" y2="71%" className="network-edge" />
          <line x1="76%" y1="71%" x2="72%" y2="79%" className="network-edge" />
          <circle cx="68%" cy="67%" r="3" className="network-node" />
          <circle cx="76%" cy="71%" r="3" className="network-node" />
          <circle cx="72%" cy="79%" r="3" className="network-node" />
        </g>
      </svg>

      {/* Large Decorative Elements Layer - Emojis */}
      <div className="decorative-layer">
        {/* Huge Virus 1 - Top Left */}
        <div className="huge-virus virus-huge-1">🦠</div>

        {/* Huge Virus 2 - Right Side */}
        <div className="huge-virus virus-huge-2">🦠</div>

        {/* Huge Virus 3 - Bottom Left */}
        <div className="huge-virus virus-huge-3">🦠</div>

        {/* Huge Shield 1 - Top Right */}
        <div className="huge-shield shield-huge-1">🛡️</div>

        {/* Huge Shield 2 - Bottom Right */}
        <div className="huge-shield shield-huge-2">🛡️</div>

        {/* Huge Shield 3 - Left Middle */}
        <div className="huge-shield shield-huge-3">🛡️</div>
      </div>

      <style>{`
        /* ===== CONTAINER ===== */
        .animated-bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* ===== NETWORK LAYER (Graph Nodes & Edges) ===== */
        .network-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.14;
        }

        .network-edge {
          stroke: hsl(var(--primary));
          stroke-width: 1.2;
          fill: none;
        }

        .network-node {
          fill: hsl(var(--primary));
        }

        .dark .network-edge {
          stroke: hsl(180 100% 50%);
        }

        .dark .network-node {
          fill: hsl(180 100% 50%);
        }

        /* Network animation groups - slow floating motion */
        .network-1 {
          animation: floatNetwork1 42s ease-in-out infinite;
        }

        .network-2 {
          animation: floatNetwork2 38s ease-in-out infinite;
        }

        .network-3 {
          animation: floatNetwork3 45s ease-in-out infinite;
        }

        .network-4 {
          animation: floatNetwork4 40s ease-in-out infinite;
        }

        @keyframes floatNetwork1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-10px, -15px); }
          50% { transform: translate(-5px, -25px); }
          75% { transform: translate(-15px, -10px); }
        }

        @keyframes floatNetwork2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(10px, 15px); }
          66% { transform: translate(5px, 20px); }
        }

        @keyframes floatNetwork3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(8px, -12px); }
          50% { transform: translate(-8px, -20px); }
          75% { transform: translate(12px, -8px); }
        }

        @keyframes floatNetwork4 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-12px, 10px); }
          66% { transform: translate(-6px, 18px); }
        }

        /* ===== DECORATIVE LAYER (Huge Viruses & Shields) ===== */
        .decorative-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* Huge Emoji Styles */
        .huge-virus,
        .huge-shield {
          position: absolute;
          font-size: 120px;
          opacity: 0.10;
          filter: grayscale(100%) sepia(100%) saturate(500%) hue-rotate(160deg) brightness(1.1);
        }

        .huge-shield {
          font-size: 100px;
        }

        .dark .huge-virus,
        .dark .huge-shield {
          filter: grayscale(100%) sepia(100%) saturate(800%) hue-rotate(160deg) brightness(1.3);
        }

        /* Positioning */
        /* Left V: Virus-Shield-Virus (point to left) */
        .virus-huge-1 {
          top: 18%;
          left: 6%;
          animation: driftHugeVirus1 60s ease-in-out infinite;
        }

        .shield-huge-1 {
          top: 48%;
          left: 2%;
          animation: floatHugeShield1 55s ease-in-out infinite;
        }

        .virus-huge-3 {
          top: 78%;
          left: 6%;
          animation: driftHugeVirus3 62s ease-in-out infinite;
        }

        /* Right V: Shield-Virus-Shield (point to right) */
        .shield-huge-2 {
          top: 18%;
          left: 82%;
          animation: floatHugeShield2 52s ease-in-out infinite;
        }

        .virus-huge-2 {
          top: 48%;
          left: 86%;
          animation: driftHugeVirus2 65s ease-in-out infinite;
        }

        .shield-huge-3 {
          top: 78%;
          left: 82%;
          animation: floatHugeShield3 58s ease-in-out infinite;
        }

        /* Very slow animations for huge elements */

        @keyframes driftHugeVirus1 {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg);
          }
          25% { 
            transform: translate(-15px, -20px) rotate(15deg);
          }
          50% { 
            transform: translate(-30px, -35px) rotate(30deg);
          }
          75% { 
            transform: translate(-20px, -25px) rotate(20deg);
          }
        }

        @keyframes driftHugeVirus2 {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg);
          }
          33% { 
            transform: translate(20px, 25px) rotate(-20deg);
          }
          66% { 
            transform: translate(35px, 40px) rotate(-35deg);
          }
        }

        @keyframes driftHugeVirus3 {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg);
          }
          25% { 
            transform: translate(15px, -18px) rotate(12deg);
          }
          50% { 
            transform: translate(28px, -32px) rotate(25deg);
          }
          75% { 
            transform: translate(18px, -22px) rotate(15deg);
          }
        }

        @keyframes floatHugeShield1 {
          0%, 100% { 
            transform: translate(0, 0);
          }
          33% { 
            transform: translate(-18px, 20px);
          }
          66% { 
            transform: translate(-30px, 35px);
          }
        }

        @keyframes floatHugeShield2 {
          0%, 100% { 
            transform: translate(0, 0);
          }
          25% { 
            transform: translate(15px, -15px);
          }
          50% { 
            transform: translate(25px, -28px);
          }
          75% { 
            transform: translate(18px, -20px);
          }
        }

        @keyframes floatHugeShield3 {
          0%, 100% { 
            transform: translate(0, 0);
          }
          33% { 
            transform: translate(20px, 15px);
          }
          66% { 
            transform: translate(32px, 25px);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .network-layer {
            opacity: 0.04;
          }
          .huge-virus,
          .huge-shield {
            opacity: 0.08;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
