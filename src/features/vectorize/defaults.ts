import { VectorizeConfig } from './types';

export const defaultConfig: VectorizeConfig = {
  mode: 'spline',
  clusteringMode: 'color',
  hierarchical: 'stacked',
  cornerThreshold: 60,
  lengthThreshold: 4,
  maxIterations: 10,
  spliceThreshold: 45,
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  pathPrecision: 8
};
