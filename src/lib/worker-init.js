export async function compressWithGhostScript(dataStruct) {
  const worker = new Worker(
    new URL('./background-worker.js', import.meta.url),
    { type: 'module' }
  );
  worker.postMessage({ data: dataStruct, target: 'wasm' });
  return new Promise((resolve, reject) => {
    const listener = (e) => {
      resolve(e.data);
      worker.removeEventListener('message', listener);
      setTimeout(() => worker.terminate(), 0);
    };
    worker.addEventListener('message', listener);
  });
}
