type Graph<T> = Map<T, Set<T>>;

function topologicalSortLevels<T>(graph: Graph<T>, startNode?: T): T[][] {
  const inDegree = new Map<T, number>();
  const queue: T[] = [];
  const result: T[][] = [];

  // Initialize in-degree for all nodes
  for (const [node, neighbors] of graph.entries()) {
    if (!inDegree.has(node)) inDegree.set(node, 0);
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
    }
  }

  // Enqueue start node or nodes with in-degree 0
  if (startNode !== undefined) {
    if (!graph.has(startNode))
      throw new Error(`Start node ${String(startNode)} not found in graph`);
    queue.push(startNode);
    inDegree.set(startNode, 0); // Treat start node as having 0 in-degree
  } else {
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(node);
    }
  }

  // Perform level-based topological sort
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: T[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node);

      const neighbors = graph.get(node) || new Set<T>();
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    result.push(currentLevel);
  }

  // Check for cycles
  if (
    inDegree.size > 0 &&
    [...inDegree.values()].some((degree) => degree > 0)
  ) {
    throw new Error('Graph contains a cycle');
  }

  return result;
}

// Helper function to create a graph
function createGraph<T>(): Graph<T> {
  return new Map<T, Set<T>>();
}

// Helper function to add an edge to the graph
function addEdge<T>(graph: Graph<T>, from: T, to: T) {
  if (!graph.has(from)) {
    graph.set(from, new Set<T>());
  }
  graph.get(from)!.add(to);
}

// Example usage:
const graph = createGraph<string>();
addEdge(graph, 'A', 'B');
addEdge(graph, 'A', 'C');
addEdge(graph, 'B', 'D');
addEdge(graph, 'C', 'D');
addEdge(graph, 'D', 'E');
addEdge(graph, 'F', 'G');

console.log(topologicalSortLevels(graph));
// Output: [['A', 'F'], ['B', 'C', 'G'], ['D'], ['E']]

console.log(topologicalSortLevels(graph, 'A'));
// Output: [['A'], ['B', 'C'], ['D'], ['E']]

// Trying to start from a non-existent node
try {
  topologicalSortLevels(graph, 'X');
} catch (error) {
  console.log(error.message); // "Start node X not found in graph"
}
