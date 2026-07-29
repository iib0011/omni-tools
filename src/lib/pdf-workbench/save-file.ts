import { WorkbenchError } from './errors';

interface WritableFileHandle {
  createWritable(): Promise<{
    write(data: Blob): Promise<void>;
    close(): Promise<void>;
    abort?(): Promise<void>;
  }>;
}

interface SavePickerWindow extends Window {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<WritableFileHandle>;
}

export interface SaveFileOptions {
  suggestedName: string;
  mimeType: string;
  extensions: string[];
  description?: string;
  preferFilePicker?: boolean;
}

export async function saveBlob(
  blob: Blob,
  options: SaveFileOptions
): Promise<'file-system' | 'download'> {
  const picker = (window as SavePickerWindow).showSaveFilePicker;
  if (options.preferFilePicker !== false && picker) {
    try {
      const handle = await picker({
        suggestedName: options.suggestedName,
        types: [
          {
            description: options.description ?? 'File',
            accept: { [options.mimeType]: options.extensions }
          }
        ]
      });
      const writable = await handle.createWritable();
      try {
        await writable.write(blob);
        await writable.close();
        return 'file-system';
      } catch (error) {
        await writable.abort?.();
        throw error;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      // Permission/API failures fall back to the ordinary browser download.
    }
  }

  let url: string | null = null;
  let link: HTMLAnchorElement | null = null;
  try {
    url = URL.createObjectURL(blob);
    link = document.createElement('a');
    link.href = url;
    link.download = options.suggestedName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    return 'download';
  } catch (error) {
    throw new WorkbenchError({
      code: 'save-failed',
      message: 'The browser could not save the generated file.',
      details: error instanceof Error ? error.message : String(error)
    });
  } finally {
    link?.remove();
    if (url) {
      const objectUrl = url;
      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    }
  }
}
