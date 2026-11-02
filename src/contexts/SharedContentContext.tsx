import React, { createContext, useContext, useState, ReactNode } from 'react';
import { matchesFileCriteria } from '../utils/sharedContent';

export interface PendingShare {
  files: File[];
  text: string;
  title: string;
  url: string;
}

interface SharedContentContextType {
  pendingShare: PendingShare | null;
  setPendingShare: (
    data: {
      files?: File[];
      text?: string;
      title?: string;
      url?: string;
    } | null
  ) => void;
  consumeFile: (accept?: string[] | string, type?: string) => File | null;
  consumeFiles: (accept?: string[] | string, type?: string) => File[];
  consumeText: () => string | null;
  clearPendingShare: () => void;
}

export const SharedContentContext = createContext<SharedContentContextType>({
  pendingShare: null,
  setPendingShare: () => {},
  consumeFile: () => null,
  consumeFiles: () => [],
  consumeText: () => null,
  clearPendingShare: () => {}
});

export const useSharedContent = () => useContext(SharedContentContext);

export const SharedContentProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [pendingShare, setPendingShareState] = useState<PendingShare | null>(
    null
  );

  const setPendingShare = (
    data: {
      files?: File[];
      text?: string;
      title?: string;
      url?: string;
    } | null
  ) => {
    if (!data) {
      setPendingShareState(null);
      return;
    }
    setPendingShareState({
      files: data.files || [],
      text: data.text || '',
      title: data.title || '',
      url: data.url || ''
    });
  };

  const consumeFile = (
    accept?: string[] | string,
    type?: string
  ): File | null => {
    if (!pendingShare || pendingShare.files.length === 0) return null;

    const fileIndex = pendingShare.files.findIndex((f) =>
      matchesFileCriteria(f, accept, type)
    );

    if (fileIndex === -1) return null;

    const file = pendingShare.files[fileIndex];
    const newFiles = [...pendingShare.files];
    newFiles.splice(fileIndex, 1);

    setPendingShareState({
      ...pendingShare,
      files: newFiles
    });

    return file;
  };

  const consumeFiles = (accept?: string[] | string, type?: string): File[] => {
    if (!pendingShare || pendingShare.files.length === 0) return [];

    const matchedFiles = pendingShare.files.filter((f) =>
      matchesFileCriteria(f, accept, type)
    );

    if (matchedFiles.length === 0) return [];

    const remainingFiles = pendingShare.files.filter(
      (f) => !matchedFiles.includes(f)
    );

    setPendingShareState({
      ...pendingShare,
      files: remainingFiles
    });

    return matchedFiles;
  };

  const consumeText = (): string | null => {
    if (!pendingShare) return null;

    const textToReturn =
      pendingShare.text || pendingShare.url || pendingShare.title;
    if (!textToReturn) return null;

    setPendingShareState({
      ...pendingShare,
      text: '',
      title: '',
      url: ''
    });

    return textToReturn;
  };

  const clearPendingShare = () => {
    setPendingShareState(null);
  };

  return (
    <SharedContentContext.Provider
      value={{
        pendingShare,
        setPendingShare,
        consumeFile,
        consumeFiles,
        consumeText,
        clearPendingShare
      }}
    >
      {children}
    </SharedContentContext.Provider>
  );
};
