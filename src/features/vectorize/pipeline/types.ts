export interface RawImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface ClusterInfo {
  id: number;
  color: string;
  rgb: [number, number, number];
  area: number;
}

export interface LabeledImage {
  width: number;
  height: number;
  labels: Int32Array;
  clusters: ClusterInfo[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
}
