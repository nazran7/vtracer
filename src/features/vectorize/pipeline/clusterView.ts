import { LabeledImage, RawImage } from './types';

export function buildClusterImage(labeled: LabeledImage): RawImage {
  const { width, height, labels, clusters } = labeled;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const outIndex = index * 4;
      const label = labels[index];
      if (label === -1) {
        data[outIndex] = 0;
        data[outIndex + 1] = 0;
        data[outIndex + 2] = 0;
        data[outIndex + 3] = 0;
        continue;
      }
      const cluster = clusters[label];
      data[outIndex] = cluster.rgb[0];
      data[outIndex + 1] = cluster.rgb[1];
      data[outIndex + 2] = cluster.rgb[2];
      data[outIndex + 3] = 255;
    }
  }

  return { width, height, data };
}
