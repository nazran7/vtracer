import { RawImage } from './types';

export function getIndex(x: number, y: number, width: number): number {
  return (y * width + x) * 4;
}

export function getPixel(image: RawImage, x: number, y: number): [number, number, number, number] {
  const index = getIndex(x, y, image.width);
  const data = image.data;
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

export function colorToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function quantizeColor(
  r: number,
  g: number,
  b: number,
  precisionLoss: number
): [number, number, number] {
  if (precisionLoss <= 0) {
    return [r, g, b];
  }
  const shift = precisionLoss;
  const mask = 0xff << shift;
  return [r & mask, g & mask, b & mask];
}

export function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = Math.abs(a[0] - b[0]);
  const dg = Math.abs(a[1] - b[1]);
  const db = Math.abs(a[2] - b[2]);
  return Math.max(dr, dg, db);
}
