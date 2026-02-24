import JSZip from 'jszip';

export async function zipFiles(
  blobs: { blob: Blob; filename: string }[],
  zipFilename: string
): Promise<File> {
  const zip = new JSZip();
  blobs.forEach(({ blob, filename }) => zip.file(filename, blob));
  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
  return new File([zipBuffer], zipFilename, { type: 'application/zip' });
}
