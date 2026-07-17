export const COMPRESS_ACTION = 'compress-pdf';
export const PROTECT_ACTION = 'protect-pdf';

export async function compressWithGhostScript(dataStruct: {
  psDataURL: string;
}): Promise<string> {
  const worker = getWorker();
  worker.postMessage({
    data: { ...dataStruct, type: COMPRESS_ACTION },
    target: 'wasm'
  });
  return getListener(worker);
}

export async function protectWithGhostScript(dataStruct: {
  psDataURL: string;
}): Promise<string> {
  const worker = getWorker();
  worker.postMessage({
    data: { ...dataStruct, type: PROTECT_ACTION },
    target: 'wasm'
  });
  return getListener(worker);
}

const WORKER_TIMEOUT_MS = 30000;

const getListener = (worker: Worker): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Worker timed out'));
    }, WORKER_TIMEOUT_MS);

    worker.addEventListener('error', (e) => {
      clearTimeout(timeout);
      worker.terminate();
      reject(new Error(`Worker error: ${e.message}`));
    });

    const listener = (e: MessageEvent) => {
      clearTimeout(timeout);
      resolve(e.data);
      worker.removeEventListener('message', listener);
      setTimeout(() => worker.terminate(), 0);
    };
    worker.addEventListener('message', listener);
  });
};

const getWorker = () => {
  return new Worker(new URL('./background-worker.js', import.meta.url), {
    type: 'module'
  });
};
