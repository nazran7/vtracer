import { LabeledImage, Path, Point } from './types';

interface Edge {
  start: Point;
  end: Point;
  dir: number;
}

function key(point: Point): string {
  return `${point.x},${point.y}`;
}

export function traceCluster(labeled: LabeledImage, clusterId: number): Path[] {
  const { width, height, labels } = labeled;
  const edges: Edge[] = [];
  const edgesByStart = new Map<string, number[]>();

  // Build boundary edges by checking 4-neighborhood transitions.
  const pushEdge = (start: Point, end: Point) => {
    const index = edges.length;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    let dir = 0;
    if (dx === 1 && dy === 0) dir = 0; // right
    if (dx === 0 && dy === 1) dir = 1; // down
    if (dx === -1 && dy === 0) dir = 2; // left
    if (dx === 0 && dy === -1) dir = 3; // up
    edges.push({ start, end, dir });
    const mapKey = key(start);
    const bucket = edgesByStart.get(mapKey);
    if (bucket) {
      bucket.push(index);
    } else {
      edgesByStart.set(mapKey, [index]);
    }
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      if (labels[idx] !== clusterId) {
        continue;
      }
      const top = y === 0 || labels[(y - 1) * width + x] !== clusterId;
      const right = x === width - 1 || labels[y * width + x + 1] !== clusterId;
      const bottom = y === height - 1 || labels[(y + 1) * width + x] !== clusterId;
      const left = x === 0 || labels[y * width + x - 1] !== clusterId;

      if (top) {
        pushEdge({ x, y }, { x: x + 1, y });
      }
      if (right) {
        pushEdge({ x: x + 1, y }, { x: x + 1, y: y + 1 });
      }
      if (bottom) {
        pushEdge({ x: x + 1, y: y + 1 }, { x, y: y + 1 });
      }
      if (left) {
        pushEdge({ x, y: y + 1 }, { x, y });
      }
    }
  }

  const used = new Uint8Array(edges.length);
  const paths: Path[] = [];
  const turnPreference = [1, 0, 3, 2]; // right, straight, left, back

  for (let i = 0; i < edges.length; i += 1) {
    if (used[i]) {
      continue;
    }
    const startEdge = edges[i];
    const startPoint = startEdge.start;
    const points: Point[] = [startPoint];
    let currentIndex = i;
    let currentDir = startEdge.dir;

    while (true) {
      used[currentIndex] = 1;
      const edge = edges[currentIndex];
      points.push(edge.end);
      if (edge.end.x === startPoint.x && edge.end.y === startPoint.y) {
        break;
      }
      const candidates = edgesByStart.get(key(edge.end)) || [];
      let nextIndex: number | undefined;
      for (const turn of turnPreference) {
        const targetDir = (currentDir + turn) % 4;
        nextIndex = candidates.find((idx) => !used[idx] && edges[idx].dir === targetDir);
        if (nextIndex !== undefined) {
          break;
        }
      }
      if (nextIndex === undefined) {
        nextIndex = candidates.find((idx) => !used[idx]);
      }
      if (nextIndex === undefined) {
        break;
      }
      currentIndex = nextIndex;
      currentDir = edges[currentIndex].dir;
    }

    if (points.length > 2) {
      paths.push({ points });
    }
  }

  return paths;
}
