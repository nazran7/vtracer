import { vectorizeImage } from '../pipeline';
import { VectorizeConfig } from '../types';
import { RawImage } from '../pipeline/types';

interface VectorizeRequest {
  type: 'vectorize';
  id: string;
  image: {
    width: number;
    height: number;
    data: Uint8ClampedArray | number[];
  };
  config: VectorizeConfig;
}

type WorkerMessage = VectorizeRequest;

const ctx: Worker = self as unknown as Worker;

ctx.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  if (message.type !== 'vectorize') {
    return;
  }

  try {
    const rawImage: RawImage = {
      width: message.image.width,
      height: message.image.height,
      data:
        message.image.data instanceof Uint8ClampedArray
          ? message.image.data
          : new Uint8ClampedArray(message.image.data)
    };

    const svg = vectorizeImage(rawImage, message.config, (progress) => {
      ctx.postMessage({ type: 'progress', id: message.id, progress });
    });

    ctx.postMessage({ type: 'result', id: message.id, svg });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Unknown worker error';
    ctx.postMessage({ type: 'error', id: message.id, message: messageText });
  }
});
