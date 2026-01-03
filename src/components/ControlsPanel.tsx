import { VectorizeConfig } from '../features/vectorize/types';

interface ControlsPanelProps {
  config: VectorizeConfig;
  onChange: (config: VectorizeConfig) => void;
}

export default function ControlsPanel({ config, onChange }: ControlsPanelProps) {
  const update = (patch: Partial<VectorizeConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <section className="panel controls">
      <div className="section-title">Clustering</div>
      <div className="control-group">
        <div className="toggle-row two">
          <button
            className={`toggle ${config.clusteringMode === 'binary' ? 'active' : ''}`}
            type="button"
            onClick={() => update({ clusteringMode: 'binary' })}
          >
            B/W
          </button>
          <button
            className={`toggle ${config.clusteringMode === 'color' ? 'active' : ''}`}
            type="button"
            onClick={() => update({ clusteringMode: 'color' })}
          >
            Color
          </button>
        </div>
      </div>

      {config.clusteringMode === 'color' && (
        <div className="control-group">
          <div className="toggle-row two">
            <button
              className={`toggle ${config.hierarchical === 'cutout' ? 'active' : ''}`}
              type="button"
              onClick={() => update({ hierarchical: 'cutout' })}
            >
              Cutout
            </button>
            <button
              className={`toggle ${config.hierarchical === 'stacked' ? 'active' : ''}`}
              type="button"
              onClick={() => update({ hierarchical: 'stacked' })}
            >
              Stacked
            </button>
          </div>
        </div>
      )}

      <div className="control-group">
        <label className="mono">Filter Speckle: {config.filterSpeckle}</label>
        <input
          className="range"
          type="range"
          min={0}
          max={128}
          step={1}
          value={config.filterSpeckle}
          onChange={(event) => update({ filterSpeckle: Number(event.target.value) })}
        />
      </div>

      {config.clusteringMode === 'color' && (
        <>
          <div className="control-group">
            <label className="mono">Color Precision: {config.colorPrecision}</label>
            <input
              className="range"
              type="range"
              min={1}
              max={8}
              step={1}
              value={config.colorPrecision}
              onChange={(event) => update({ colorPrecision: Number(event.target.value) })}
            />
          </div>
          <div className="control-group">
            <label className="mono">Gradient Step: {config.layerDifference}</label>
            <input
              className="range"
              type="range"
              min={0}
              max={128}
              step={1}
              value={config.layerDifference}
              onChange={(event) => update({ layerDifference: Number(event.target.value) })}
            />
          </div>
        </>
      )}

      <div className="section-title">Curve Fitting</div>
      <div className="control-group">
        <div className="toggle-row">
          <button
            className={`toggle ${config.mode === 'none' ? 'active' : ''}`}
            type="button"
            onClick={() => update({ mode: 'none' })}
          >
            Pixel
          </button>
          <button
            className={`toggle ${config.mode === 'polygon' ? 'active' : ''}`}
            type="button"
            onClick={() => update({ mode: 'polygon' })}
          >
            Polygon
          </button>
          <button
            className={`toggle ${config.mode === 'spline' ? 'active' : ''}`}
            type="button"
            onClick={() => update({ mode: 'spline' })}
          >
            Spline
          </button>
        </div>
      </div>

      {config.mode === 'spline' && (
        <>
          <div className="control-group">
            <label className="mono">Corner Threshold: {config.cornerThreshold}</label>
            <input
              className="range"
              type="range"
              min={0}
              max={180}
              step={1}
              value={config.cornerThreshold}
              onChange={(event) => update({ cornerThreshold: Number(event.target.value) })}
            />
          </div>
          <div className="control-group">
            <label className="mono">Segment Length: {config.lengthThreshold}</label>
            <input
              className="range"
              type="range"
              min={3.5}
              max={10}
              step={0.5}
              value={config.lengthThreshold}
              onChange={(event) => update({ lengthThreshold: Number(event.target.value) })}
            />
          </div>
          <div className="control-group">
            <label className="mono">Splice Threshold: {config.spliceThreshold}</label>
            <input
              className="range"
              type="range"
              min={0}
              max={180}
              step={1}
              value={config.spliceThreshold}
              onChange={(event) => update({ spliceThreshold: Number(event.target.value) })}
            />
          </div>
        </>
      )}

      <details>
        <summary className="mono">Advanced</summary>
        <div className="control-group" style={{ marginTop: 12 }}>
          <label className="mono">Path Precision: {config.pathPrecision}</label>
          <input
            className="range"
            type="range"
            min={0}
            max={16}
            step={1}
            value={config.pathPrecision}
            onChange={(event) => update({ pathPrecision: Number(event.target.value) })}
          />
        </div>
      </details>
    </section>
  );
}
