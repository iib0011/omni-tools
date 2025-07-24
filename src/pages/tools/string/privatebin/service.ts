import { InitialValuesType, PasteData } from './types';

// Simple encryption using Web Crypto API
async function encryptText(text: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Generate key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('privatebin-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return (
    btoa(String.fromCharCode(...new Uint8Array(encrypted))) +
    '.' +
    btoa(String.fromCharCode(...iv))
  );
}

async function decryptText(
  encryptedData: string,
  password: string
): Promise<string> {
  try {
    const [encrypted, iv] = encryptedData.split('.');
    const encryptedBytes = new Uint8Array(
      atob(encrypted)
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const ivBytes = new Uint8Array(
      atob(iv)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('privatebin-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      key,
      encryptedBytes
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt: Invalid password or corrupted data');
  }
}

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function getExpirationDuration(expiration: string): number {
  switch (expiration) {
    case '1hour':
      return 60 * 60 * 1000;
    case '1day':
      return 24 * 60 * 60 * 1000;
    case '1week':
      return 7 * 24 * 60 * 60 * 1000;
    case '1month':
      return 30 * 24 * 60 * 60 * 1000;
    case 'never':
      return 0;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

export async function createPaste(
  content: string,
  options: InitialValuesType
): Promise<string> {
  const pasteData: PasteData = {
    id: generateId(),
    content: await encryptText(content, options.password || 'default'),
    expiration: options.expiration,
    burnAfterReading: options.burnAfterReading,
    password: options.password,
    createdAt: Date.now()
  };

  // Store in localStorage (in a real app, this would be server-side)
  const pastes = JSON.parse(localStorage.getItem('privatebin_pastes') || '{}');
  pastes[pasteData.id] = pasteData;
  localStorage.setItem('privatebin_pastes', JSON.stringify(pastes));

  return pasteData.id;
}

export async function retrievePaste(
  id: string,
  password: string
): Promise<string> {
  const pastes = JSON.parse(localStorage.getItem('privatebin_pastes') || '{}');
  const paste = pastes[id];

  if (!paste) {
    throw new Error('Paste not found');
  }

  // Check expiration
  const duration = getExpirationDuration(paste.expiration);
  if (
    paste.expiration !== 'never' &&
    duration > 0 &&
    paste.createdAt + duration < Date.now()
  ) {
    delete pastes[id];
    localStorage.setItem('privatebin_pastes', JSON.stringify(pastes));
    throw new Error('Paste has expired');
  }

  const decryptedContent = await decryptText(paste.content, password);

  // Delete if burn after reading
  if (paste.burnAfterReading) {
    delete pastes[id];
    localStorage.setItem('privatebin_pastes', JSON.stringify(pastes));
  }

  return decryptedContent;
}

export function main(
  input: string,
  options: InitialValuesType
): Promise<string> {
  return createPaste(input, options);
}
