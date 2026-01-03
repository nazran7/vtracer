export type VectorizeMode = 'none' | 'polygon' | 'spline';
export type ClusteringMode = 'binary' | 'color';
export type HierarchicalMode = 'stacked' | 'cutout';

export interface VectorizeConfig {
  mode: VectorizeMode;
  clusteringMode: ClusteringMode;
  hierarchical: HierarchicalMode;
  cornerThreshold: number;
  lengthThreshold: number;
  maxIterations: number;
  spliceThreshold: number;
  filterSpeckle: number;
  colorPrecision: number;
  layerDifference: number;
  pathPrecision: number;
}

export interface PresetConfig extends VectorizeConfig {
  id: string;
  src: string;
  title: string;
  credit: string;
}
