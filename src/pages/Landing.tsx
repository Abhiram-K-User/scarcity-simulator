import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Network, Cpu, BarChart3, Zap, PlayCircle, Github } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnimatedBackground } from '@/components/AnimatedBackground.tsx';

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glassmorphic rounded-2xl p-8 hover-lift group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <motion.div
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        
        <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-50 glassmorphic-dark border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Scarcity Simulator
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pb-32">
        <div className="container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <motion.div
              className="inline-block px-6 py-2 rounded-full glassmorphic mb-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="text-sm font-medium text-primary">
                🦠 Advanced Epidemic Response Simulation
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Constrained Epidemic
              </span>
              <br />
              <span className="text-foreground">Response Simulator</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
              Explore network-based disease propagation with resource-constrained intervention strategies.
              <br />
              <span className="text-primary font-medium">BFS algorithms • MaxHeap priority queues • Real-time visualization</span>
            </p>

            <motion.button
              onClick={() => navigate('/simulator')}
              className="group relative px-12 py-5 rounded-xl text-lg font-semibold overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="relative flex items-center gap-3 text-white">
                <PlayCircle className="w-6 h-6" />
                Launch Simulation
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 text-foreground">
              Powered by Advanced <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Algorithms</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Academic-quality implementations of epidemic modeling techniques
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Network}
              title="BFS Epidemic Spread"
              description="Wave-based infection propagation using breadth-first search for realistic network epidemic modeling."
              delay={0.1}
            />
            <FeatureCard
              icon={Cpu}
              title="MaxHeap Allocation"
              description="Efficient vaccine distribution via priority queue with O(log n) operations for optimal resource management."
              delay={0.2}
            />
            <FeatureCard
              icon={BarChart3}
              title="Dynamic Topology"
              description="Real-time graph updates as nodes are vaccinated, demonstrating network isolation effects."
              delay={0.3}
            />
            <FeatureCard
              icon={Zap}
              title="7-State Model"
              description="Comprehensive SIR/SEIR implementation tracking susceptible, exposed, infected, and recovered states."
              delay={0.4}
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time Metrics"
              description="Live time-series charts tracking infection curves, system stress, and population-level statistics."
              delay={0.5}
            />
            <FeatureCard
              icon={Network}
              title="Interactive Visualization"
              description="Animated network graph with hover details, heatmaps, and infection wave visualization."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glassmorphic-dark rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Ready to Explore?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start simulating epidemic scenarios and resource allocation strategies right now.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => navigate('/simulator')}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Launch Simulator
                </motion.button>
                
                <motion.button
                  onClick={() => window.open('https://github.com/abhijayms12/scarcity-simulator', '_blank')}
                  className="px-10 py-4 rounded-xl glassmorphic font-semibold text-lg flex items-center gap-3 justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 12s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
