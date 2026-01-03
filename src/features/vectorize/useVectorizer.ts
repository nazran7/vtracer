import { useCallback, useEffect, useRef, useState } from 'react';
import { VectorizeConfig } from './types';

interface VectorizeResult {
  svg: string;
  progress: number;
  status: 'idle' | 'running' | 'error';
  error: string | null;
  run: (image: ImageData, config: VectorizeConfig) => void;
}

export function useVectorizer(): VectorizeResult {
  const workerRef = useRef<Worker | null>(null);
  const activeJob = useRef<string | null>(null);
  const [svg, setSvg] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('./worker/vectorize.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.addEventListener('message', (event) => {
      const message = event.data as
        | { type: 'progress'; id: string; progress: number }
        | { type: 'result'; id: string; svg: string }
        | { type: 'error'; id: string; message: string };

      if (!activeJob.current || message.id !== activeJob.current) {
        return;
      }

      if (message.type === 'progress') {
        setProgress(message.progress);
      } else if (message.type === 'result') {
        setSvg(message.svg);
        setProgress(100);
        setStatus('idle');
        setError(null);
      } else if (message.type === 'error') {
        setStatus('error');
        setError(message.message);
      }
    });

    return () => {
      worker.terminate();
    };
  }, []);

  const run = useCallback((image: ImageData, config: VectorizeConfig) => {
    if (!workerRef.current) {
      return;
    }
    const jobId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    activeJob.current = jobId;
    setStatus('running');
    setProgress(0);
    setError(null);

    const payload = {
      type: 'vectorize' as const,
      id: jobId,
      image: {
        width: image.width,
        height: image.height,
        data: new Uint8ClampedArray(image.data)
      },
      config
    };

    workerRef.current.postMessage(payload);
  }, []);

  return { svg, progress, status, error, run };
}
