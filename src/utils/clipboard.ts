/**
 * Copy text to the clipboard, falling back to a hidden-textarea + execCommand
 * approach when the async Clipboard API is unavailable. This commonly happens
 * on http:// (non-secure) hosts, e.g. self-hosted tools like Umbrel.
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  const clipboardApiAvailable = navigator.clipboard && window.isSecureContext;
  if (clipboardApiAvailable) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Clipboard API can reject (e.g. missing permission); fall back below.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) {
    throw new Error('Failed to copy using the fallback method');
  }
};
