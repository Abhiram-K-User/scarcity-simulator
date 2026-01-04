/**
 * MaxHeap-based Priority Queue for efficient vaccine/resource allocation
 * Provides O(log n) insertion and extraction operations
 */

export interface PriorityItem<T> {
  priority: number;
  data: T;
}

export class MaxHeap<T> {
  private heap: PriorityItem<T>[];

  constructor() {
    this.heap = [];
  }

  /**
   * Get the number of items in the heap
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Check if the heap is empty
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Insert an item with a priority - O(log n)
   */
  insert(priority: number, data: T): void {
    this.heap.push({ priority, data });
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Extract the item with maximum priority - O(log n)
   */
  extractMax(): T | null {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) {
      const item = this.heap.pop()!;
      return item.data;
    }

    const max = this.heap[0].data;
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return max;
  }

  /**
   * Peek at the maximum priority item without removing it
   */
  peekMax(): T | null {
    return this.isEmpty() ? null : this.heap[0].data;
  }

  /**
   * Get all items sorted by priority (highest first)
   */
  toSortedArray(): T[] {
    // Create a copy of the heap to preserve original
    const tempHeap = [...this.heap];
    const result: T[] = [];
    
    while (!this.isEmpty()) {
      const item = this.extractMax();
      if (item !== null) result.push(item);
    }
    
    // Restore original heap
    this.heap = tempHeap;
    
    return result;
  }

  /**
   * Clear all items from the heap
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * Bubble up element at index to maintain heap property
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      if (this.heap[index].priority <= this.heap[parentIndex].priority) {
        break;
      }

      // Swap with parent
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  /**
   * Bubble down element at index to maintain heap property
   */
  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let largest = index;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].priority > this.heap[largest].priority
      ) {
        largest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].priority > this.heap[largest].priority
      ) {
        largest = rightChild;
      }

      if (largest === index) {
        break;
      }

      // Swap with largest child
      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

/**
 * Factory function to create a priority queue from an array of items
 */
export function createPriorityQueue<T>(
  items: T[],
  priorityFn: (item: T) => number
): MaxHeap<T> {
  const heap = new MaxHeap<T>();
  items.forEach(item => {
    heap.insert(priorityFn(item), item);
  });
  return heap;
}
