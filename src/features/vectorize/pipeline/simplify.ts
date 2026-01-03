import { Point } from './types';

function perpendicularDistance(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  const projX = start.x + t * dx;
  const projY = start.y + t * dy;
  return Math.hypot(point.x - projX, point.y - projY);
}

export function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) {
    return points.slice();
  }

  let maxDistance = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i += 1) {
    const distance = perpendicularDistance(points[i], points[0], points[end]);
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }

  if (maxDistance > epsilon) {
    const left = simplifyPath(points.slice(0, index + 1), epsilon);
    const right = simplifyPath(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }

  return [points[0], points[end]];
}

export function removeDuplicatePoints(points: Point[]): Point[] {
  if (points.length === 0) {
    return [];
  }
  const cleaned: Point[] = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const prev = cleaned[cleaned.length - 1];
    const current = points[i];
    if (prev.x !== current.x || prev.y !== current.y) {
      cleaned.push(current);
    }
  }
  return cleaned;
}

export function angleAt(prev: Point, current: Point, next: Point): number {
  const v1x = prev.x - current.x;
  const v1y = prev.y - current.y;
  const v2x = next.x - current.x;
  const v2y = next.y - current.y;
  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);
  if (mag1 === 0 || mag2 === 0) {
    return 180;
  }
  const cos = Math.min(Math.max(dot / (mag1 * mag2), -1), 1);
  return (Math.acos(cos) * 180) / Math.PI;
}

export function subdivideByLength(points: Point[], maxIterations: number, lengthThreshold: number): Point[] {
  if (points.length < 2) {
    return points.slice();
  }

  let output = points.slice();
  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const nextPoints: Point[] = [];
    let hasLongSegment = false;
    const lastIndex = output.length - 1;
    for (let i = 0; i < output.length; i += 1) {
      const current = output[i];
      const next = output[(i + 1) % output.length];
      nextPoints.push(current);
      const isClosingEdge = i === lastIndex;
      const distance = Math.hypot(next.x - current.x, next.y - current.y);
      if (distance > lengthThreshold) {
        hasLongSegment = true;
        const mid = { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 };
        if (!isClosingEdge) {
          nextPoints.push(mid);
        } else {
          nextPoints.push(mid);
        }
      }
    }
    output = removeDuplicatePoints(nextPoints);
    if (!hasLongSegment) {
      break;
    }
  }
  return output;
}

export function markCorners(points: Point[], cornerThreshold: number): boolean[] {
  const flags = new Array(points.length).fill(false);
  if (points.length < 3) {
    return flags;
  }
  for (let i = 0; i < points.length; i += 1) {
    const prev = points[(i - 1 + points.length) % points.length];
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const angle = angleAt(prev, current, next);
    flags[i] = angle < cornerThreshold;
  }
  return flags;
}

export function smoothPath(points: Point[], cornerFlags: boolean[]): Point[] {
  if (points.length < 3) {
    return points.slice();
  }
  const smoothed: Point[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const prev = points[(i - 1 + points.length) % points.length];
    const current = points[i];
    const next = points[(i + 1) % points.length];
    if (cornerFlags[i]) {
      smoothed.push(current);
      continue;
    }
    smoothed.push({
      x: (prev.x + 2 * current.x + next.x) / 4,
      y: (prev.y + 2 * current.y + next.y) / 4
    });
  }
  return smoothed;
}

export function splitByAngle(points: Point[], minAngle: number): Point[][] {
  if (points.length < 3) {
    return [points.slice()];
  }

  const segments: Point[][] = [];
  let current: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i += 1) {
    current.push(points[i]);
    const angle = angleAt(points[i - 1], points[i], points[i + 1]);
    if (angle < minAngle) {
      segments.push(current);
      current = [points[i]];
    }
  }

  current.push(points[points.length - 1]);
  segments.push(current);

  return segments;
}
