import { Path, Point } from './types';
import { markCorners, removeDuplicatePoints, smoothPath, splitByAngle, subdivideByLength, simplifyPath } from './simplify';

function formatValue(value: number, precision: number): string {
  return Number(value.toFixed(precision)).toString();
}

function formatPoint(point: Point, precision: number): string {
  return `${formatValue(point.x, precision)},${formatValue(point.y, precision)}`;
}

function normalizeClosedPath(points: Point[]): Point[] {
  if (points.length < 2) {
    return points.slice();
  }
  const first = points[0];
  const last = points[points.length - 1];
  if (first.x === last.x && first.y === last.y) {
    return points.slice(0, -1);
  }
  return points.slice();
}

function buildPolygonPath(points: Point[], precision: number): string {
  const normalized = normalizeClosedPath(points);
  if (normalized.length === 0) {
    return '';
  }
  const segments = normalized.map((point) => formatPoint(point, precision));
  return `M ${segments[0]} L ${segments.slice(1).join(' ')} Z`;
}

function catmullRomToBezier(points: Point[], precision: number): string {
  const normalized = normalizeClosedPath(points);
  if (normalized.length < 2) {
    return '';
  }

  const n = normalized.length;
  let d = `M ${formatPoint(normalized[0], precision)}`;

  // Catmull-Rom to cubic Bezier conversion for smooth closed curves.
  for (let i = 0; i < n; i += 1) {
    const p0 = normalized[(i - 1 + n) % n];
    const p1 = normalized[i];
    const p2 = normalized[(i + 1) % n];
    const p3 = normalized[(i + 2) % n];

    const c1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6
    };

    d += ` C ${formatPoint(c1, precision)} ${formatPoint(c2, precision)} ${formatPoint(p2, precision)}`;
  }

  return `${d} Z`;
}

export function buildPathD(
  path: Path,
  mode: 'none' | 'polygon' | 'spline',
  precision: number,
  cornerThreshold: number,
  spliceThreshold: number,
  lengthThreshold: number,
  maxIterations: number
): string {
  const points = removeDuplicatePoints(normalizeClosedPath(path.points));
  if (points.length < 2) {
    return '';
  }

  if (mode === 'none') {
    return buildPolygonPath(points, precision);
  }

  const simplified = simplifyPath(points, Math.max(0.5, lengthThreshold / 6));
  if (mode === 'polygon') {
    return buildPolygonPath(simplified, precision);
  }

  const refined = subdivideByLength(simplified, maxIterations, lengthThreshold);
  const cornerFlags = markCorners(refined, cornerThreshold);
  const smoothed = smoothPath(refined, cornerFlags);
  const segments = splitByAngle(smoothed, spliceThreshold).filter((segment) => segment.length > 2);
  const curves = segments.map((segment) => catmullRomToBezier(segment, precision));
  return curves.filter(Boolean).join(' ');
}

export function buildSvg(
  width: number,
  height: number,
  paths: Array<{ d: string; color: string; fillRule?: 'evenodd' | 'nonzero' }>
): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>';
  const comment = '<!-- Generator: vtracer-modern -->';
  const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
  const body = paths
    .map((path) => {
      const fillRule = path.fillRule ? ` fill-rule="${path.fillRule}"` : '';
      return `<path d="${path.d}" fill="${path.color}"${fillRule} />`;
    })
    .join('\n');
  return `${header}\n${comment}\n${svgHeader}\n${body}\n</svg>`;
}
