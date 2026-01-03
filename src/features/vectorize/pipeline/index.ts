import { clusterBinary, clusterColor } from './cluster';
import { buildClusterImage } from './clusterView';
import { buildPathD, buildSvg } from './svg';
import { traceCluster } from './trace';
import { LabeledImage, RawImage } from './types';
import { VectorizeConfig } from '../types';
import { applyKeyColor, findUnusedKeyColor, shouldKeyImage } from './keying';
import { quantizeColor } from './image';

export function vectorizeImage(
  image: RawImage,
  config: VectorizeConfig,
  onProgress?: (progress: number) => void
): string {
  const precisionLoss = Math.max(0, 8 - config.colorPrecision);
  const filterSpeckleArea = config.filterSpeckle * config.filterSpeckle;

  onProgress?.(5);

  let labeled: LabeledImage;
  if (config.clusteringMode === 'binary') {
    labeled = clusterBinary(image);
  } else {
    const needsKeying = shouldKeyImage(image);
    const keyColor = needsKeying ? findUnusedKeyColor(image) : null;
    const keyedImage = applyKeyColor(image, keyColor);
    const diagonal = config.layerDifference === 0;
    const ignoreColor = keyColor ? quantizeColor(keyColor[0], keyColor[1], keyColor[2], precisionLoss) : null;
    labeled = clusterColor(keyedImage, precisionLoss, config.layerDifference, { diagonal, ignoreColor });

    if (config.hierarchical === 'cutout') {
      const clusterImage = buildClusterImage(labeled);
      labeled = clusterColor(clusterImage, 0, 0, { diagonal: false, ignoreColor: keyColor });
    }
  }

  // Filter tiny regions and set a draw order based on the selected hierarchy mode.
  onProgress?.(40);

  const clusters = labeled.clusters
    .filter((cluster) => config.hierarchical === 'cutout' || cluster.area >= filterSpeckleArea)
    .sort((a, b) => {
      if (config.hierarchical === 'stacked') {
        return b.area - a.area;
      }
      return a.id - b.id;
    });

  const total = clusters.length || 1;
  const paths: Array<{ d: string; color: string; fillRule?: 'evenodd' | 'nonzero' }> = [];

  clusters.forEach((cluster, index) => {
    const clusterPaths = traceCluster(labeled, cluster.id);
    const subPaths = clusterPaths
      .map((path) =>
        buildPathD(
          path,
          config.mode,
          config.pathPrecision,
          config.cornerThreshold,
          config.spliceThreshold,
          config.lengthThreshold,
          config.maxIterations
        )
      )
      .filter((d) => Boolean(d));
    if (subPaths.length > 0) {
      paths.push({ d: subPaths.join(' '), color: cluster.color, fillRule: 'evenodd' });
    }

    const progress = 50 + Math.round((50 * (index + 1)) / total);
    onProgress?.(progress);
  });

  onProgress?.(100);

  return buildSvg(image.width, image.height, paths);
}
