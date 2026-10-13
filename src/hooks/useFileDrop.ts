import { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';

const HEIC_EXTENSIONS = ['heic', 'heif'];

const getExtension = (name: string) =>
  name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';

export const isAcceptedFile = (file: File, accept: string[]): boolean => {
  const extension = getExtension(file.name);
  return accept.some((acceptType) => {
    if (acceptType.startsWith('.')) {
      return extension === acceptType.slice(1).toLowerCase();
    }
    if (acceptType.endsWith('/*')) {
      const category = acceptType.split('/')[0];
      if (file.type) return file.type.startsWith(`${category}/`);
      // Some browsers report an empty type for HEIC/HEIF files
      return category === 'image' && HEIC_EXTENSIONS.includes(extension);
    }
    if (acceptType === file.type) return true;
    return (
      !file.type &&
      /^image\/hei[cf]$/.test(acceptType) &&
      HEIC_EXTENSIONS.includes(extension)
    );
  });
};

interface UseFileDropOptions {
  accept: string[];
  onFiles: (files: File[]) => void | Promise<void>;
}

/**
 * Shared drag-and-drop / file filtering logic for the multiple file inputs.
 * Spread `dropHandlers` on the drop zone and pass picker files to `addFiles`.
 */
export default function useFileDrop({ accept, onFiles }: UseFileDropOptions) {
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave also fire for child elements, so count them
  const dragCounter = useRef(0);

  const addFiles = async (files: FileList | File[]) => {
    const all = Array.from(files);
    const accepted = all.filter((file) => isAcceptedFile(file, accept));
    if (accepted.length < all.length) {
      showSnackBar(t('toolMultipleInput.invalidFileType'), 'error');
    }
    if (accepted.length > 0) await onFiles(accepted);
  };

  const dropHandlers = {
    onDragEnter: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      dragCounter.current += 1;
      setIsDragging(true);
    },
    onDragOver: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
    },
    onDragLeave: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) setIsDragging(false);
    },
    onDrop: async (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      if (event.dataTransfer.files.length > 0) {
        await addFiles(event.dataTransfer.files);
      }
    }
  };

  return { isDragging, dropHandlers, addFiles };
}
