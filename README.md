# Constrained Epidemic Response Simulator

## 🎯 Project Overview

An interactive epidemic simulation that demonstrates **network-based disease spread** with **resource-constrained intervention strategies**. This project implements academic-quality algorithms including **BFS-based epidemic propagation**, **MaxHeap priority queue for vaccine allocation**, and **dynamic graph topology updates**.

---

## ✨ Key Features

### 🦠 **BFS-Based Epidemic Spread**
- Wave-based infection propagation using breadth-first search
- Realistic network epidemic modeling
- Queue-based traversal from infected nodes

### 💉 **Priority Queue Vaccine Allocation**
- MaxHeap data structure for efficient resource distribution
- Greedy algorithm for optimal node selection
- O(log n) insertion and extraction operations

### 📊 **Dynamic Graph Topology**
- Edges removed when nodes are vaccinated
- Visual demonstration of network isolation
- Real-time adjacency list updates

### 🎨 **Comprehensive Visualization**
- 7 distinct node states with color coding
- Animated infection spread with pulsing edges
- Interactive network graph with hover details
- Real-time metrics dashboard with time-series charts

### 📈 **Classic Epidemic Model**
- **SIR Model**: Susceptible → Infected → Recovered
- **SEIR Extension**: Exposed (at-risk) state
- Proper vaccination and immunity mechanics
- Population-level disease dynamics

---

## 🏗️ Technical Implementation

### Core Algorithms
- **Graph Representation**: Adjacency list `Map<string, string[]>`
- **Epidemic Spread**: BFS with queue and visited set
- **Resource Allocation**: MaxHeap priority queue
- **State Management**: 7-state FSM (Finite State Machine)

### Node States
1. **Susceptible** 🔵 - Initial state, not exposed
2. **Healthy** 🔷 - Normal, no exposure
3. **At-Risk** 🟡 - Exposed, awaiting vaccine or infection
4. **Infected** 🔴 - Actively infected, spreading disease
5. **Vaccinated** 🟢 - Protected by intervention
6. **Recovered** 🟩 - Natural immunity after infection
7. **Collapsed** ⚫ - System failure from prolonged infection

### Performance
- **BFS Complexity**: O(V + E) per timestep
- **Heap Operations**: O(log k) for k at-risk nodes
- **Metrics Calculation**: O(V) node aggregation

---

## 📦 Installation & Setup

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Quick Start

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd scarcity-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080/`

---

## 🎮 How to Use

### Getting Started
1. Click **"Start Simulation"** to initialize infected nodes
2. Observe BFS wave propagation through the network
3. Watch as vaccines are allocated to high-priority at-risk nodes
4. Monitor metrics dashboard for real-time statistics

### Controls
- **Play/Pause**: Start or pause the simulation
- **Step**: Advance simulation by one timestep
- **Reset**: Restart with new random network
- **Heatmap**: Toggle infection risk overlay

### Parameters
- **Infection Rate**: Controls BFS spread probability (0.0 - 0.3)
- **Recovery Rate**: Population recovery speed (0.0 - 0.2)
- **Death Rate**: Mortality rate for infected (0.0 - 0.1)
- **Total Resources**: Number of vaccines available (0 - 10)
- **Priority Weight**: Balance between node priority and connectivity (0.0 - 1.0)
- **Initial Infected**: Number of starting infected nodes (1 - 5)

### Visualization Features
- **Node Hover**: Highlight connections and view quick stats
- **Node Click**: Open detailed panel with history and metrics
- **Legend**: View all states and their meanings
- **Charts**: Track infection trends over time

---

## 📚 Documentation

- **[DELIVERABLES_STATUS.md](DELIVERABLES_STATUS.md)** - Complete checklist of implemented features
- **[IMPLEMENTATION_UPDATES.md](IMPLEMENTATION_UPDATES.md)** - Technical details of algorithms
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - User guide with testing scenarios

---

## 🧪 Testing

### Manual Testing Scenarios

**Test BFS Propagation:**
```
1. Start with 1-2 infected nodes
2. Watch infection spread in concentric waves
3. Verify breadth-first pattern (ring-by-ring)
```

**Test Priority Queue:**
```
1. Pause when at-risk nodes appear (gold)
2. Step once to trigger vaccine allocation
3. Verify highest-priority nodes turn green first
```

**Test Graph Topology:**
```
1. Wait for vaccinations to occur
2. Look for vaccinated (green) nodes
3. Verify their edges become very dim
```

**Test State Transitions:**
```
1. Follow a node from susceptible → at-risk → infected
2. Observe transition to recovered (sage green) or collapsed (gray)
3. Check metrics dashboard for accurate counts
```

---

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Hooks

---

## 📁 Project Structure

```
scarcity-simulator/
├── src/
│   ├── components/
│   │   └── simulation/
│   │       ├── NetworkGraph.tsx       # Canvas-based network visualization
│   │       ├── MetricsDashboard.tsx   # Real-time metrics display
│   │       ├── ControlPanel.tsx       # Parameter controls
│   │       ├── SimulationControls.tsx # Play/pause/reset buttons
│   │       ├── NodeDetailPanel.tsx    # Selected node details
│   │       └── ExplanatorySection.tsx # Educational content
│   ├── hooks/
│   │   └── useSimulation.ts           # Core simulation logic (BFS, heap, state management)
│   ├── lib/
│   │   ├── priorityQueue.ts           # MaxHeap implementation
│   │   └── utils.ts                   # Utility functions
│   ├── types/
│   │   └── simulation.ts              # TypeScript type definitions
│   └── pages/
│       └── Index.tsx                  # Main application page
├── DELIVERABLES_STATUS.md             # Feature checklist
├── IMPLEMENTATION_UPDATES.md          # Technical documentation
├── VISUAL_GUIDE.md                    # User guide
└── README.md                          # This file
```

---

## 🎓 Academic References

This simulator implements concepts from:
- **Kermack-McKendrick SIR Model** (1927) - Classic epidemic theory
- **Newman's Network Epidemiology** - Graph-based disease spread
- **Greedy Algorithms** (CLRS) - Priority queue optimization
- **Graph Traversal** (Sedgewick) - BFS implementation

---

## 🚀 Future Enhancements

- [ ] Unit tests for MaxHeap and BFS algorithms
- [ ] Multiple infection waves support
- [ ] Vaccine efficacy parameters
- [ ] Network centrality-based prioritization
- [ ] Time-delayed edge reactivation
- [ ] Export simulation data to CSV
- [ ] Comparative analysis tools

---

## 📄 License

MIT License - feel free to use for educational purposes

---

## 🤝 Contributing

Contributions welcome! Areas of interest:
- Performance optimization for large networks (1000+ nodes)
- Additional epidemic models (SEIRD, SIRD)
- Machine learning-based resource allocation
- Real-world network topologies (small-world, scale-free)

---

## 📧 Contact

For questions or feedback about the implementation:
- Check the documentation files first
- Open an issue for bugs or feature requests
- Review the code comments for algorithm details

---

## 🎉 Acknowledgments

Built with modern web technologies and inspired by academic epidemic modeling research.

**All mandatory deliverables implemented ✅**

---

**Project URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
