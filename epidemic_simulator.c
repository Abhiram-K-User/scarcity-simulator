/*
 * Epidemic Response Simulator
 * Data Structures Lab Assignment
 * 
 * Implements:
 *   - Graph with Adjacency List
 *   - BFS for infection spread
 *   - MaxHeap Priority Queue for vaccine allocation
 *   - Greedy resource distribution
 *   - Dynamic graph topology updates
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

// Constants

#define MAX_NODES 20
#define MAX_EDGES 50
#define MAX_NAME_LEN 30
#define MAX_NEIGHBORS 10

#define INFECTION_RATE 0.15
#define RECOVERY_RATE 0.08
#define DEATH_RATE 0.03
#define TOTAL_VACCINES 5
#define INITIAL_INFECTED 2

// Node states enum

typedef enum {
    SUSCEPTIBLE,
    AT_RISK,
    INFECTED,
    VACCINATED,
    RECOVERED,
    COLLAPSED
} NodeState;

// Data structures
typedef struct Node {
    int id;
    char name[MAX_NAME_LEN];
    int population;
    NodeState state;
    float priority;
    int infectedPopulation;
    int deaths;
    int recoveries;
    int timestepInfected;
    bool vaccinated;
} Node;
typedef struct Edge {
    int source;
    int target;
    float weight;
} Edge;

typedef struct AdjListNode {
    int nodeId;
    struct AdjListNode* next;
} AdjListNode;
typedef struct Graph {
    int numNodes;
    int numEdges;
    Node nodes[MAX_NODES];
    Edge edges[MAX_EDGES];
    AdjListNode* adjList[MAX_NODES];
} Graph;
typedef struct QueueNode {
    int nodeId;
    struct QueueNode* next;
} QueueNode;

typedef struct Queue {
    QueueNode* front;
    QueueNode* rear;
} Queue;

typedef struct HeapNode {
    int nodeId;
    float priority;
} HeapNode;

typedef struct MaxHeap {
    HeapNode items[MAX_NODES];
    int size;
} MaxHeap;

// Queue operations for BFS

Queue* createQueue() {
    Queue* q = (Queue*)malloc(sizeof(Queue));
    q->front = q->rear = NULL;
    return q;
}

bool isQueueEmpty(Queue* q) {
    return q->front == NULL;
}

void enqueue(Queue* q, int nodeId) {
    QueueNode* newNode = (QueueNode*)malloc(sizeof(QueueNode));
    newNode->nodeId = nodeId;
    newNode->next = NULL;
    
    if (q->rear == NULL) {
        q->front = q->rear = newNode;
        return;
    }
    
    q->rear->next = newNode;
    q->rear = newNode;
}

int dequeue(Queue* q) {
    if (isQueueEmpty(q)) return -1;
    
    QueueNode* temp = q->front;
    int nodeId = temp->nodeId;
    q->front = q->front->next;
    
    if (q->front == NULL)
        q->rear = NULL;
    
    free(temp);
    return nodeId;
}

void destroyQueue(Queue* q) {
    while (!isQueueEmpty(q)) {
        dequeue(q);
    }
    free(q);
}

// MaxHeap implementation

MaxHeap* createMaxHeap() {
    MaxHeap* heap = (MaxHeap*)malloc(sizeof(MaxHeap));
    heap->size = 0;
    return heap;
}

void swap(HeapNode* a, HeapNode* b) {
    HeapNode temp = *a;
    *a = *b;
    *b = temp;
}

void bubbleUp(MaxHeap* heap, int index) {
    while (index > 0) {
        int parent = (index - 1) / 2;
        if (heap->items[index].priority <= heap->items[parent].priority)
            break;
        
        swap(&heap->items[index], &heap->items[parent]);
        index = parent;
    }
}

void bubbleDown(MaxHeap* heap, int index) {
    while (true) {
        int leftChild = 2 * index + 1;
        int rightChild = 2 * index + 2;
        int largest = index;
        
        if (leftChild < heap->size && 
            heap->items[leftChild].priority > heap->items[largest].priority)
            largest = leftChild;
        
        if (rightChild < heap->size && 
            heap->items[rightChild].priority > heap->items[largest].priority)
            largest = rightChild;
        
        if (largest == index)
            break;
        
        swap(&heap->items[index], &heap->items[largest]);
        index = largest;
    }
}

void heapInsert(MaxHeap* heap, int nodeId, float priority) {
    if (heap->size >= MAX_NODES) return;
    
    heap->items[heap->size].nodeId = nodeId;
    heap->items[heap->size].priority = priority;
    bubbleUp(heap, heap->size);
    heap->size++;
}

int heapExtractMax(MaxHeap* heap) {
    if (heap->size == 0) return -1;
    
    int maxNodeId = heap->items[0].nodeId;
    heap->size--;
    
    if (heap->size > 0) {
        heap->items[0] = heap->items[heap->size];
        bubbleDown(heap, 0);
    }
    
    return maxNodeId;
}

// Graph functions

Graph* createGraph() {
    Graph* graph = (Graph*)malloc(sizeof(Graph));
    graph->numNodes = 0;
    graph->numEdges = 0;
    
    for (int i = 0; i < MAX_NODES; i++) {
        graph->adjList[i] = NULL;
    }
    
    return graph;
}

void addNode(Graph* graph, const char* name, int population, float priority) {
    if (graph->numNodes >= MAX_NODES) return;
    
    int id = graph->numNodes;
    graph->nodes[id].id = id;
    strncpy(graph->nodes[id].name, name, MAX_NAME_LEN - 1);
    graph->nodes[id].population = population;
    graph->nodes[id].state = SUSCEPTIBLE;
    graph->nodes[id].priority = priority;
    graph->nodes[id].infectedPopulation = 0;
    graph->nodes[id].deaths = 0;
    graph->nodes[id].recoveries = 0;
    graph->nodes[id].timestepInfected = -1;
    graph->nodes[id].vaccinated = false;
    
    graph->numNodes++;
}

void addEdgeToAdjList(Graph* graph, int source, int target) {
    // Add edge from source to target
    AdjListNode* newNode = (AdjListNode*)malloc(sizeof(AdjListNode));
    newNode->nodeId = target;
    newNode->next = graph->adjList[source];
    graph->adjList[source] = newNode;
    
    // Add edge from target to source (undirected graph)
    newNode = (AdjListNode*)malloc(sizeof(AdjListNode));
    newNode->nodeId = source;
    newNode->next = graph->adjList[target];
    graph->adjList[target] = newNode;
}

void addEdge(Graph* graph, int source, int target, float weight) {
    if (graph->numEdges >= MAX_EDGES) return;
    
    graph->edges[graph->numEdges].source = source;
    graph->edges[graph->numEdges].target = target;
    graph->edges[graph->numEdges].weight = weight;
    graph->numEdges++;
    
    addEdgeToAdjList(graph, source, target);
}

void removeNodeEdges(Graph* graph, int nodeId) {
    // Remove from adjacency lists
    for (int i = 0; i < graph->numNodes; i++) {
        if (i == nodeId) {
            // Clear this node's adjacency list
            AdjListNode* current = graph->adjList[i];
            while (current) {
                AdjListNode* temp = current;
                current = current->next;
                free(temp);
            }
            graph->adjList[i] = NULL;
        } else {
            // Remove nodeId from other nodes' adjacency lists
            AdjListNode** current = &graph->adjList[i];
            while (*current) {
                if ((*current)->nodeId == nodeId) {
                    AdjListNode* temp = *current;
                    *current = (*current)->next;
                    free(temp);
                } else {
                    current = &(*current)->next;
                }
            }
        }
    }
}

int countNeighbors(Graph* graph, int nodeId) {
    int count = 0;
    AdjListNode* current = graph->adjList[nodeId];
    while (current) {
        count++;
        current = current->next;
    }
    return count;
}

// BFS epidemic spread

void bfsEpidemicSpread(Graph* graph, bool visited[]) {
    Queue* q = createQueue();
    
    printf("\n[BFS] Starting breadth-first search for infection spread...\n");
    
    // Initialize queue with all infected nodes
    for (int i = 0; i < graph->numNodes; i++) {
        if (graph->nodes[i].state == INFECTED) {
            enqueue(q, i);
            visited[i] = true;
            printf("[BFS] Initial infected node: %s\n", graph->nodes[i].name);
        }
    }
    
    // BFS traversal
    int waveCount = 0;
    while (!isQueueEmpty(q)) {
        int currentNodeId = dequeue(q);
        Node* currentNode = &graph->nodes[currentNodeId];
        
        printf("[BFS] Processing infected node: %s\n", currentNode->name);
        
        // Traverse all neighbors
        AdjListNode* neighbor = graph->adjList[currentNodeId];
        while (neighbor) {
            int neighborId = neighbor->nodeId;
            
            if (!visited[neighborId]) {
                Node* neighborNode = &graph->nodes[neighborId];
                
                // Skip immune states
                if (neighborNode->state == VACCINATED || 
                    neighborNode->state == RECOVERED ||
                    neighborNode->state == COLLAPSED) {
                    visited[neighborId] = true;
                    neighbor = neighbor->next;
                    continue;
                }
                
                // Infection spread probability
                if (neighborNode->state == SUSCEPTIBLE && 
                    ((float)rand() / RAND_MAX) < INFECTION_RATE) {
                    neighborNode->state = AT_RISK;
                    visited[neighborId] = true;
                    waveCount++;
                    printf("[BFS]   -> %s exposed (SUSCEPTIBLE -> AT_RISK)\n", 
                           neighborNode->name);
                }
            }
            
            neighbor = neighbor->next;
        }
    }
    
    printf("[BFS] Epidemic wave complete. %d nodes newly exposed.\n", waveCount);
    destroyQueue(q);
}

// Vaccine allocation with priority queue

void allocateVaccines(Graph* graph, int availableVaccines, int currentTime) {
    MaxHeap* heap = createMaxHeap();
    
    printf("\n[VACCINE] Allocating %d vaccines...\n", availableVaccines);
    
    // Build priority queue with at-risk nodes
    for (int i = 0; i < graph->numNodes; i++) {
        if (graph->nodes[i].state == AT_RISK) {
            int neighbors = countNeighbors(graph, i);
            // Priority = base priority + connectivity factor
            float priority = graph->nodes[i].priority * 0.6 + (neighbors / 10.0) * 0.4;
            
            heapInsert(heap, i, priority);
            printf("[VACCINE] Added to queue: %s (priority: %.2f, neighbors: %d)\n",
                   graph->nodes[i].name, priority, neighbors);
        }
    }
    
    // Greedy allocation: extract highest priority nodes
    int vaccinated = 0;
    while (vaccinated < availableVaccines && heap->size > 0) {
        int nodeId = heapExtractMax(heap);
        if (nodeId == -1) break;
        
        Node* node = &graph->nodes[nodeId];
        node->state = VACCINATED;
        node->vaccinated = true;
        vaccinated++;
        
        printf("[VACCINE] ✓ Vaccinated: %s (priority-based selection)\n", node->name);
        
        // Graph topology update: remove edges (isolation)
        printf("[TOPOLOGY] Isolating vaccinated node, removing edges...\n");
        removeNodeEdges(graph, nodeId);
    }
    
    printf("[VACCINE] Total vaccinated this round: %d\n", vaccinated);
    free(heap);
}

// Disease progression

void progressDisease(Graph* graph, int currentTime) {
    printf("\n[DISEASE] Processing infection progression...\n");
    
    for (int i = 0; i < graph->numNodes; i++) {
        Node* node = &graph->nodes[i];
        
        // Process infected nodes
        if (node->state == INFECTED) {
            int infected = node->infectedPopulation;
            
            // Calculate deaths
            int newDeaths = (int)(infected * DEATH_RATE);
            node->deaths += newDeaths;
            infected -= newDeaths;
            
            // Calculate recoveries
            int newRecoveries = (int)(infected * RECOVERY_RATE);
            node->recoveries += newRecoveries;
            infected -= newRecoveries;
            
            node->infectedPopulation = infected;
            
            if (newDeaths > 0 || newRecoveries > 0) {
                printf("[DISEASE] %s: %d deaths, %d recoveries\n", 
                       node->name, newDeaths, newRecoveries);
            }
            
            // Check for recovery or collapse
            if (infected == 0) {
                node->state = RECOVERED;
                node->timestepInfected = -1;
                printf("[DISEASE] %s RECOVERED (no infected population)\n", node->name);
            } else if (currentTime - node->timestepInfected > 5) {
                if (node->deaths > node->population * 0.3) {
                    node->state = COLLAPSED;
                    printf("[DISEASE] %s COLLAPSED (high mortality)\n", node->name);
                }
            }
        }
        
        // At-risk nodes become infected if not vaccinated
        if (node->state == AT_RISK) {
            // Count infected neighbors
            int infectedNeighbors = 0;
            AdjListNode* neighbor = graph->adjList[i];
            while (neighbor) {
                if (graph->nodes[neighbor->nodeId].state == INFECTED)
                    infectedNeighbors++;
                neighbor = neighbor->next;
            }
            
            float infectionProb = INFECTION_RATE * (1 + infectedNeighbors * 0.5);
            if (((float)rand() / RAND_MAX) < infectionProb) {
                node->state = INFECTED;
                node->timestepInfected = currentTime;
                node->infectedPopulation = (int)(node->population * 0.05);
                printf("[DISEASE] %s became INFECTED (AT_RISK -> INFECTED)\n", node->name);
            }
        }
    }
}

// Display functions

const char* getStateName(NodeState state) {
    switch (state) {
        case SUSCEPTIBLE: return "SUSCEPTIBLE";
        case AT_RISK: return "AT_RISK";
        case INFECTED: return "INFECTED";
        case VACCINATED: return "VACCINATED";
        case RECOVERED: return "RECOVERED";
        case COLLAPSED: return "COLLAPSED";
        default: return "UNKNOWN";
    }
}

void displayGraphState(Graph* graph, int timestep) {
    printf("\n");
    printf("========================================\n");
    printf("TIMESTEP %d\n", timestep);
    printf("========================================\n");
    printf("%-15s %-12s %-10s %-8s %-8s %-8s\n", 
           "Node", "State", "Pop", "Infected", "Deaths", "Recovered");
    printf("----------------------------------------\n");
    
    int totalSusceptible = 0, totalAtRisk = 0, totalInfected = 0;
    int totalVaccinated = 0, totalRecovered = 0, totalCollapsed = 0;
    
    for (int i = 0; i < graph->numNodes; i++) {
        Node* node = &graph->nodes[i];
        printf("%-15s %-12s %-10d %-8d %-8d %-8d\n",
               node->name, getStateName(node->state), 
               node->population, node->infectedPopulation,
               node->deaths, node->recoveries);
        
        switch (node->state) {
            case SUSCEPTIBLE: totalSusceptible++; break;
            case AT_RISK: totalAtRisk++; break;
            case INFECTED: totalInfected++; break;
            case VACCINATED: totalVaccinated++; break;
            case RECOVERED: totalRecovered++; break;
            case COLLAPSED: totalCollapsed++; break;
        }
    }
    
    printf("----------------------------------------\n");
    printf("Susceptible=%d, At-Risk=%d, Infected=%d, Vaccinated=%d\n",
           totalSusceptible, totalAtRisk, totalInfected, totalVaccinated);
    printf("Recovered=%d, Collapsed=%d\n", totalRecovered, totalCollapsed);
    printf("----------------------------------------\n");
}

void displayAdjacencyList(Graph* graph) {
    printf("\n");
    printf("========================================\n");
    printf("ADJACENCY LIST\n");
    printf("========================================\n");
    
    for (int i = 0; i < graph->numNodes; i++) {
        printf("%s [%s]: ", graph->nodes[i].name, getStateName(graph->nodes[i].state));
        
        AdjListNode* current = graph->adjList[i];
        if (!current) {
            printf("(ISOLATED - No connections)");
        } else {
            while (current) {
                printf("-> %s ", graph->nodes[current->nodeId].name);
                current = current->next;
            }
        }
        printf("\n");
    }
    printf("========================================\n");
}

// Initialize simulation

void initializeSimulation(Graph* graph) {
    printf("\n");
    printf("========================================\n");
    printf("INITIALIZING SIMULATION\n");
    printf("========================================\n");
    
    // Add nodes (regions/communities)
    addNode(graph, "Metro Alpha", 500000, 0.9);
    addNode(graph, "District Beta", 300000, 0.7);
    addNode(graph, "Zone Gamma", 450000, 0.8);
    addNode(graph, "Sector Delta", 200000, 0.6);
    addNode(graph, "Region Epsilon", 600000, 0.85);
    addNode(graph, "Area Zeta", 350000, 0.75);
    addNode(graph, "Hub Eta", 400000, 0.7);
    addNode(graph, "Node Theta", 250000, 0.65);
    
    printf("Created %d nodes (regions/communities)\n", graph->numNodes);
    
    // Add edges (create network topology - ring with shortcuts)
    for (int i = 0; i < graph->numNodes; i++) {
        addEdge(graph, i, (i + 1) % graph->numNodes, 0.8);
    }
    
    // Add random shortcuts
    addEdge(graph, 0, 3, 0.5);
    addEdge(graph, 1, 5, 0.4);
    addEdge(graph, 2, 6, 0.6);
    addEdge(graph, 4, 7, 0.5);
    
    printf("Created %d edges (contact connections)\n", graph->numEdges);
    
    // Initialize infected nodes
    printf("\nInitializing %d infected nodes...\n", INITIAL_INFECTED);
    for (int i = 0; i < INITIAL_INFECTED && i < graph->numNodes; i++) {
        graph->nodes[i].state = INFECTED;
        graph->nodes[i].timestepInfected = 0;
        graph->nodes[i].infectedPopulation = (int)(graph->nodes[i].population * 0.05);
        printf("  - %s: INFECTED (initial)\n", graph->nodes[i].name);
    }
    
    printf("\n");
    printf("Simulation Parameters:\n");
    printf("  Infection Rate: %.2f\n", INFECTION_RATE);
    printf("  Recovery Rate: %.2f\n", RECOVERY_RATE);
    printf("  Death Rate: %.2f\n", DEATH_RATE);
    printf("  Vaccines: %d per round\n", TOTAL_VACCINES);
    printf("========================================\n");
}

/* ============================================================================
 * MAIN SIMULATION LOOP
 * ============================================================================ */

void runSimulation(Graph* graph, int maxTimesteps) {
    printf("\n========================================\n");
    printf("STARTING SIMULATION\n");
    printf("========================================\n");
    
    displayGraphState(graph, 0);
    displayAdjacencyList(graph);
    
    for (int t = 1; t <= maxTimesteps; t++) {
        printf("\n\n========================================\n");
        printf("TIMESTEP %d\n", t);
        printf("========================================\n");
        
        // Step 1: BFS-based epidemic spread
        bool visited[MAX_NODES] = {false};
        bfsEpidemicSpread(graph, visited);
        
        // Step 2: Vaccine allocation using priority queue
        allocateVaccines(graph, TOTAL_VACCINES, t);
        
        // Step 3: Disease progression (deaths, recoveries)
        progressDisease(graph, t);
        
        // Display current state
        displayGraphState(graph, t);
        
        // Check termination condition
        int activeInfections = 0;
        int atRiskNodes = 0;
        for (int i = 0; i < graph->numNodes; i++) {
            if (graph->nodes[i].state == INFECTED) activeInfections++;
            if (graph->nodes[i].state == AT_RISK) atRiskNodes++;
        }
        
        if (activeInfections == 0 && atRiskNodes == 0) {
            printf("\n========================================\n");
            printf("EPIDEMIC CONTAINED\n");
            printf("========================================\n");
            break;
        }
        
        // Pause for readability (optional)
        #ifdef MANUAL_STEP
        printf("\nPress Enter to continue to next timestep...");
        getchar();
        #endif
    }
    
    printf("\n\nFinal network topology:\n");
    displayAdjacencyList(graph);
}

// Final stats

void displayFinalStatistics(Graph* graph) {
    printf("\n\n========================================\n");
    printf("FINAL STATISTICS\n");
    printf("========================================\n");
    
    int totalDeaths = 0, totalRecoveries = 0, totalVaccinated = 0;
    int totalPopulation = 0, totalInfectedPop = 0;
    
    for (int i = 0; i < graph->numNodes; i++) {
        Node* node = &graph->nodes[i];
        totalPopulation += node->population;
        totalInfectedPop += node->infectedPopulation;
        totalDeaths += node->deaths;
        totalRecoveries += node->recoveries;
        if (node->vaccinated) totalVaccinated++;
    }
    
    printf("\nPopulation Impact:\n");
    printf("  - Total Population: %d\n", totalPopulation);
    printf("  - Currently Infected: %d\n", totalInfectedPop);
    printf("  - Total Deaths: %d (%.2f%%)\n", totalDeaths, 
           (totalDeaths * 100.0) / totalPopulation);
    printf("  - Total Recoveries: %d (%.2f%%)\n", totalRecoveries,
           (totalRecoveries * 100.0) / totalPopulation);
    
    printf("\nIntervention Effectiveness:\n");
    printf("  - Nodes Vaccinated: %d / %d (%.1f%%)\n", 
           totalVaccinated, graph->numNodes,
           (totalVaccinated * 100.0) / graph->numNodes);
    
    printf("\nFinal Node States:\n");
    int stateCounts[6] = {0};
    for (int i = 0; i < graph->numNodes; i++) {
        stateCounts[graph->nodes[i].state]++;
    }
    printf("  - Susceptible: %d\n", stateCounts[SUSCEPTIBLE]);
    printf("  - At-Risk: %d\n", stateCounts[AT_RISK]);
    printf("  - Infected: %d\n", stateCounts[INFECTED]);
    printf("  - Vaccinated: %d\n", stateCounts[VACCINATED]);
    printf("  - Recovered: %d\n", stateCounts[RECOVERED]);
    printf("  - Collapsed: %d\n", stateCounts[COLLAPSED]);
    
    printf("\n========================================\n");
    printf("SIMULATION COMPLETE\n");
    printf("========================================\n");
}

int main() {
    srand(time(NULL));
    
    printf("\n========================================\n");
    printf("Epidemic Response Simulator\n");
    printf("========================================\n");
    printf("Graph-based epidemic model with:\n");
    printf("- Adjacency list representation\n");
    printf("- BFS for infection spread\n");
    printf("- MaxHeap priority queue\n");
    printf("- Greedy vaccine allocation\n");
    printf("========================================\n");
    
    // Create graph
    Graph* graph = createGraph();
    
    // Initialize simulation
    initializeSimulation(graph);
    
    // Run simulation
    runSimulation(graph, 10);
    
    // Display final statistics
    displayFinalStatistics(graph);
    
    // Cleanup
    for (int i = 0; i < MAX_NODES; i++) {
        AdjListNode* current = graph->adjList[i];
        while (current) {
            AdjListNode* temp = current;
            current = current->next;
            free(temp);
        }
    }
    free(graph);
    
    return 0;
}

/* Compile: gcc -o epidemic_simulator epidemic_simulator.c -lm
 * Run: ./epidemic_simulator
 * Step mode: gcc -DMANUAL_STEP -o epidemic_simulator epidemic_simulator.c -lm
 */
