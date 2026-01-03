import { presets } from '../features/vectorize/presets';
import { PresetConfig } from '../features/vectorize/types';

interface GalleryProps {
  onSelect: (preset: PresetConfig) => void;
}

export default function Gallery({ onSelect }: GalleryProps) {
  return (
    <section className="panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="section-title">Sample Gallery</div>
      <div className="gallery">
        {presets.map((preset) => (
          <button
            key={preset.id}
            className="gallery-item"
            type="button"
            onClick={() => onSelect(preset)}
            title={preset.title}
          >
            <img src={preset.src} alt={preset.title} />
          </button>
        ))}
      </div>
      <details>
        <summary className="mono">Photo credits</summary>
        <div className="mono" style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          {presets.map((preset) => (
            <span
              key={`${preset.id}-credit`}
              dangerouslySetInnerHTML={{ __html: preset.credit }}
            />
          ))}
        </div>
      </details>
    </section>
  );
}
