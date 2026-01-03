import { colorDistance, colorToHex, getPixel, quantizeColor } from './image';
import { ClusterInfo, LabeledImage, RawImage } from './types';

export function clusterBinary(image: RawImage, threshold = 128): LabeledImage {
  const { width, height } = image;
  const labels = new Int32Array(width * height).fill(-1);
  const clusters: ClusterInfo[] = [];
  let clusterId = 0;

  const queue: number[] = [];

  // Connected-component labeling on a binary mask.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (labels[index] !== -1) {
        continue;
      }
      const [r, _g, _b, a] = getPixel(image, x, y);
      if (a === 0 || r >= threshold) {
        continue;
      }

      labels[index] = clusterId;
      queue.length = 0;
      queue.push(index);
      let area = 0;

      while (queue.length) {
        const current = queue.pop()!;
        area += 1;
        const cx = current % width;
        const cy = Math.floor(current / width);

        const neighbors = [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            continue;
          }
          const nIndex = ny * width + nx;
          if (labels[nIndex] !== -1) {
            continue;
          }
          const [nr, _ng, _nb, na] = getPixel(image, nx, ny);
          if (na === 0 || nr >= threshold) {
            continue;
          }
          labels[nIndex] = clusterId;
          queue.push(nIndex);
        }
      }

      clusters.push({ id: clusterId, color: '#000000', rgb: [0, 0, 0], area });
      clusterId += 1;
    }
  }

  return { width, height, labels, clusters };
}

export function clusterColor(
  image: RawImage,
  precisionLoss: number,
  layerDifference: number,
  options?: {
    ignoreColor?: [number, number, number] | null;
    diagonal?: boolean;
  }
): LabeledImage {
  const { width, height } = image;
  const labels = new Int32Array(width * height).fill(-1);
  const clusters: ClusterInfo[] = [];
  const queue: number[] = [];
  let clusterId = 0;
  const ignoreColor = options?.ignoreColor ?? null;
  const diagonal = options?.diagonal ?? false;

  const qR = new Uint8Array(width * height);
  const qG = new Uint8Array(width * height);
  const qB = new Uint8Array(width * height);
  const alpha = new Uint8Array(width * height);

  // Pre-quantize colors so neighborhood checks are fast and deterministic.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const [r, g, b, a] = getPixel(image, x, y);
      alpha[index] = a;
      const [qr, qg, qb] = quantizeColor(r, g, b, precisionLoss);
      qR[index] = qr;
      qG[index] = qg;
      qB[index] = qb;
    }
  }

  // Region-grow clusters by comparing neighboring quantized colors.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (labels[index] !== -1 || alpha[index] === 0) {
        continue;
      }
      if (ignoreColor) {
        if (qR[index] === ignoreColor[0] && qG[index] === ignoreColor[1] && qB[index] === ignoreColor[2]) {
          continue;
        }
      }

      labels[index] = clusterId;
      queue.length = 0;
      queue.push(index);

      let area = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      const seedColor: [number, number, number] = [qR[index], qG[index], qB[index]];

      while (queue.length) {
        const current = queue.pop()!;
        area += 1;
        sumR += qR[current];
        sumG += qG[current];
        sumB += qB[current];

        const cx = current % width;
        const cy = Math.floor(current / width);
        const neighbors = [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1]
        ];
        if (diagonal) {
          neighbors.push([cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1], [cx + 1, cy + 1]);
        }

        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            continue;
          }
          const nIndex = ny * width + nx;
          if (labels[nIndex] !== -1 || alpha[nIndex] === 0) {
            continue;
          }
          if (ignoreColor) {
            if (qR[nIndex] === ignoreColor[0] && qG[nIndex] === ignoreColor[1] && qB[nIndex] === ignoreColor[2]) {
              continue;
            }
          }

          const nextColor: [number, number, number] = [qR[nIndex], qG[nIndex], qB[nIndex]];
          if (colorDistance(seedColor, nextColor) > layerDifference) {
            continue;
          }

          labels[nIndex] = clusterId;
          queue.push(nIndex);
        }
      }

      const avgR = Math.round(sumR / Math.max(area, 1));
      const avgG = Math.round(sumG / Math.max(area, 1));
      const avgB = Math.round(sumB / Math.max(area, 1));
      clusters.push({
        id: clusterId,
        color: colorToHex(avgR, avgG, avgB),
        rgb: [avgR, avgG, avgB],
        area
      });
      clusterId += 1;
    }
  }

  return { width, height, labels, clusters };
}
