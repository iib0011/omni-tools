export interface BaseFileInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept: string[];
  title?: string;
}

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

export const createObjectURL = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeObjectURL = (url: string): void => {
  URL.revokeObjectURL(url);
};
