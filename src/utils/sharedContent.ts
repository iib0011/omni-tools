import { ToolCategory } from '../tools/defineTool';

export interface SharedData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
  timestamp?: number;
}

const DB_NAME = 'omnitools-share-db';
const STORE_NAME = 'shares';

export function getSharedData(): Promise<SharedData | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => {
      try {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          resolve(null);
          return;
        }
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get('latest');
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
  });
}

export function clearSharedData(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve();
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (event) => {
      try {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          resolve();
          return;
        }
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete('latest');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    };
    request.onerror = () => resolve();
  });
}

export function detectCategoriesForFile(file: File): ToolCategory[] {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return ['pdf'];
  }
  if (
    type.startsWith('image/') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp') ||
    name.endsWith('.gif') ||
    name.endsWith('.svg')
  ) {
    if (name.endsWith('.gif') || type === 'image/gif') {
      return ['gif', 'image-generic'];
    }
    if (name.endsWith('.png') || type === 'image/png') {
      return ['png', 'image-generic'];
    }
    return ['image-generic', 'png'];
  }
  if (
    type.startsWith('video/') ||
    name.endsWith('.mp4') ||
    name.endsWith('.webm') ||
    name.endsWith('.mov') ||
    name.endsWith('.avi') ||
    name.endsWith('.mkv')
  ) {
    return ['video'];
  }
  if (
    type.startsWith('audio/') ||
    name.endsWith('.mp3') ||
    name.endsWith('.wav') ||
    name.endsWith('.ogg') ||
    name.endsWith('.m4a') ||
    name.endsWith('.flac')
  ) {
    return ['audio'];
  }
  if (type === 'application/json' || name.endsWith('.json')) {
    return ['json', 'string'];
  }
  if (
    type === 'text/csv' ||
    type === 'application/csv' ||
    name.endsWith('.csv') ||
    name.endsWith('.tsv')
  ) {
    return ['csv', 'string'];
  }
  if (
    type === 'application/xml' ||
    type === 'text/xml' ||
    name.endsWith('.xml')
  ) {
    return ['xml', 'string'];
  }
  return ['string'];
}

export function matchesFileCriteria(
  file: File,
  accept?: string[] | string,
  type?: string
): boolean {
  if (type) {
    if (type === 'image' && !file.type.startsWith('image/')) return false;
    if (type === 'video' && !file.type.startsWith('video/')) return false;
    if (type === 'audio' && !file.type.startsWith('audio/')) return false;
    if (
      type === 'pdf' &&
      file.type !== 'application/pdf' &&
      !file.name.endsWith('.pdf')
    )
      return false;
  }

  if (!accept) return true;

  const acceptList = Array.isArray(accept)
    ? accept
    : accept.split(',').map((s) => s.trim());
  if (
    acceptList.length === 0 ||
    acceptList.includes('*') ||
    acceptList.includes('*/*')
  ) {
    return true;
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return acceptList.some((pattern) => {
    const p = pattern.toLowerCase();
    if (p.startsWith('.')) {
      return fileName.endsWith(p);
    }
    if (p.endsWith('/*')) {
      const base = p.slice(0, -2);
      return fileType.startsWith(base);
    }
    return fileType === p;
  });
}
