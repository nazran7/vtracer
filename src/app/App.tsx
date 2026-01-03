import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CanvasPanel from '../components/CanvasPanel';
import ControlsPanel from '../components/ControlsPanel';
import Gallery from '../components/Gallery';
import { defaultConfig } from '../features/vectorize/defaults';
import { PresetConfig, VectorizeConfig } from '../features/vectorize/types';
import { useVectorizer } from '../features/vectorize/useVectorizer';
import { useDebouncedValue } from '../utils/useDebouncedValue';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<VectorizeConfig>(defaultConfig);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [activePreset, setActivePreset] = useState<PresetConfig | null>(null);
  const { svg, progress, status, error, run } = useVectorizer();
  const debouncedConfig = useDebouncedValue(config, 250);
  const inlineSvg = useMemo(
    () => svg.replace(/<\?xml[^>]*>\s*/i, '').replace(/<!--.*?-->/, ''),
    [svg]
  );

  const hasImage = Boolean(imageData);

  const updateCanvasWithImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setImageData(data);
    setAspectRatio(img.naturalWidth / img.naturalHeight);
  }, []);

  const loadImage = useCallback(
    (source: File | string) => {
      const img = new Image();
      if (typeof source === 'string') {
        img.src = source;
      } else {
        const objectUrl = URL.createObjectURL(source);
        img.src = objectUrl;
        setActivePreset(null);
        img.onload = () => {
          updateCanvasWithImage(img);
          URL.revokeObjectURL(objectUrl);
        };
        return;
      }
      img.onload = () => {
        updateCanvasWithImage(img);
      };
    },
    [updateCanvasWithImage]
  );

  useEffect(() => {
    if (imageData) {
      run(imageData, debouncedConfig);
    }
  }, [imageData, debouncedConfig, run]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }
      for (const item of items) {
        if (item.type.includes('image')) {
          const file = item.getAsFile();
          if (file) {
            loadImage(file);
            event.preventDefault();
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [loadImage]);

  const handlePresetSelect = (preset: PresetConfig) => {
    const { id, src, title, credit, ...configOverride } = preset;
    setConfig(configOverride);
    setActivePreset(preset);
    loadImage(src);
  };

  const handleDownload = () => {
    if (!svg) {
      return;
    }
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vtracer-${new Date().toISOString().slice(0, 19).replace(/:/g, '')}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const activePresetTitle = useMemo(() => activePreset?.title, [activePreset]);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          VTracer Modern <span>Vector Lab</span>
        </div>
        <div className="header-actions">
          <a
            className="button"
            href="https://www.visioncortex.org/vtracer-docs"
            target="_blank"
            rel="noreferrer"
          >
            Article
          </a>
          <a
            className="button"
            href="https://github.com/visioncortex/vtracer"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <button className="button primary" type="button" onClick={handleDownload}>
            Download SVG
          </button>
        </div>
      </header>

      <main className="layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <CanvasPanel
            canvasRef={canvasRef}
            svgMarkup={inlineSvg}
            progress={progress}
            status={status}
            error={error}
            hasImage={hasImage}
            aspectRatio={aspectRatio}
            onFileSelected={loadImage}
          />
          <Gallery onSelect={handlePresetSelect} />
          {activePresetTitle && <p className="footer-note">Preset: {activePresetTitle}</p>}
        </div>

        <ControlsPanel config={config} onChange={setConfig} />
      </main>
    </div>
  );
}
