import { useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

interface CanvasPanelProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  svgMarkup: string;
  progress: number;
  status: 'idle' | 'running' | 'error';
  error: string | null;
  hasImage: boolean;
  aspectRatio?: number;
  onFileSelected: (file: File) => void;
}

export default function CanvasPanel({
  canvasRef,
  svgMarkup,
  progress,
  status,
  error,
  hasImage,
  aspectRatio,
  onFileSelected
}: CanvasPanelProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovered(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const progressWidth = useMemo(() => `${Math.min(progress, 100)}%`, [progress]);

  return (
    <section className="panel canvas-panel">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="progress" aria-hidden={status !== 'running'}>
        <div style={{ width: progressWidth }} />
      </div>

      <div
        className={`dropzone ${isHovered ? 'is-hovered' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <strong>Drop an image</strong>
        <p>
          Paste with Cmd/Ctrl + V or{' '}
          <button className="button" type="button" onClick={handleSelectClick}>
            select a file
          </button>
        </p>
      </div>

      <div
        className="canvas-stack"
        style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
      >
        <canvas ref={canvasRef} />
        <div
          className="svg-layer"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
        {!hasImage && (
          <div className="dropzone" style={{ position: 'absolute', inset: 18 }}>
            <p>Drop an image to start tracing.</p>
          </div>
        )}
      </div>

      {status === 'error' && error && <p className="mono">Error: {error}</p>}
    </section>
  );
}
