export function loadPDFData(url: string, filename: string): Promise<File> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      window.URL.revokeObjectURL(url);
      const blob = new Blob([xhr.response], { type: 'application/pdf' });
      const newFile = new File([blob], filename, {
        type: 'application/pdf'
      });
      resolve(newFile);
    };
    xhr.send();
  });
}
