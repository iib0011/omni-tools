/**
 * Copy text to the clipboard, with a fallback for non-secure contexts.
 *
 * The async Clipboard API (`navigator.clipboard`) is only available in a secure
 * context (HTTPS or localhost). Self-hosted deployments served over plain HTTP
 * (e.g. Umbrel) have no `navigator.clipboard`, so a copy button would otherwise
 * silently do nothing. In that case fall back to the legacy `execCommand('copy')`.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise<void>((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Keep it out of view and prevent scrolling/zooming to it on mobile.
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const previousRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();

    try {
      const succeeded = document.execCommand('copy');
      if (succeeded) {
        resolve();
      } else {
        reject(new Error('Copy command was unsuccessful'));
      }
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    } finally {
      document.body.removeChild(textarea);
      if (previousRange && selection) {
        selection.removeAllRanges();
        selection.addRange(previousRange);
      }
    }
  });
}
