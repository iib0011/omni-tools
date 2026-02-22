export function resetFileState<T>(
  setFile: (value: T | null) => void,
  setResult?: (value: any) => void
) {
  setFile(null);
  if (setResult) {
    setResult(null);
  }
}
