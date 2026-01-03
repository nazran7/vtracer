import { RawImage } from './types';

const KEYING_THRESHOLD = 0.2;
const KEY_COLORS: Array<[number, number, number]> = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [0, 255, 255],
  [255, 0, 255],
  [128, 128, 128]
];

function colorExistsInImage(image: RawImage, color: [number, number, number]): boolean {
  const { width, height, data } = image;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index] === color[0] && data[index + 1] === color[1] && data[index + 2] === color[2]) {
        return true;
      }
    }
  }
  return false;
}

export function findUnusedKeyColor(image: RawImage): [number, number, number] | null {
  for (const color of KEY_COLORS) {
    if (!colorExistsInImage(image, color)) {
      return color;
    }
  }
  return null;
}

export function shouldKeyImage(image: RawImage): boolean {
  if (image.width === 0 || image.height === 0) {
    return false;
  }

  const { width, height, data } = image;
  const threshold = Math.floor(width * 2 * KEYING_THRESHOLD);
  let transparentCount = 0;
  const yPositions = [0, Math.floor(height / 4), Math.floor(height / 2), Math.floor((3 * height) / 4), height - 1];

  for (const y of yPositions) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4 + 3;
      if (data[index] === 0) {
        transparentCount += 1;
      }
      if (transparentCount >= threshold) {
        return true;
      }
    }
  }

  return false;
}

export function applyKeyColor(image: RawImage, keyColor: [number, number, number] | null): RawImage {
  if (!keyColor) {
    return image;
  }

  const { width, height, data } = image;
  const copy = new Uint8ClampedArray(data);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (copy[index + 3] === 0) {
        copy[index] = keyColor[0];
        copy[index + 1] = keyColor[1];
        copy[index + 2] = keyColor[2];
        copy[index + 3] = 255;
      }
    }
  }

  return { width, height, data: copy };
}
