import { expect, describe, it, vi, beforeEach } from 'vitest';
import { createPaste, retrievePaste } from './service';
import { InitialValuesType } from './types';

globalThis.crypto = require('crypto').webcrypto;

describe('PrivateBin Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const defaultOptions: InitialValuesType = {
    expiration: '1day',
    burnAfterReading: false,
    password: 'testpassword'
  };

  it('should create and retrieve a paste', async () => {
    const content = 'Hello, PrivateBin!';
    const pasteId = await createPaste(content, defaultOptions);
    expect(typeof pasteId).toBe('string');

    const retrieved = await retrievePaste(pasteId, defaultOptions.password);
    expect(retrieved).toBe(content);
  });

  it('should not retrieve with wrong password', async () => {
    const content = 'Secret Message';
    const pasteId = await createPaste(content, defaultOptions);
    await expect(retrievePaste(pasteId, 'wrongpassword')).rejects.toThrow();
  });

  it('should expire a paste after the set time', async () => {
    const content = 'Expiring Message';
    defaultOptions.expiration = '1hour';
    const options = { ...defaultOptions };
    const pasteId = await createPaste(content, options);
    // Simulate expiration by manipulating createdAt
    const pastes = JSON.parse(
      localStorage.getItem('privatebin_pastes') || '{}'
    );
    pastes[pasteId].createdAt = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
    localStorage.setItem('privatebin_pastes', JSON.stringify(pastes));
    await expect(retrievePaste(pasteId, options.password)).rejects.toThrow(
      'Paste has expired'
    );
  });

  it('should burn after reading if option is set', async () => {
    const content = 'Burn after reading';
    const options = { ...defaultOptions, burnAfterReading: true };
    const pasteId = await createPaste(content, options);
    const retrieved = await retrievePaste(pasteId, options.password);
    expect(retrieved).toBe(content);
    // Should be deleted after reading
    await expect(retrievePaste(pasteId, options.password)).rejects.toThrow(
      'Paste not found'
    );
  });

  it('should store and retrieve multiple pastes independently', async () => {
    const content1 = 'First';
    const content2 = 'Second';
    const id1 = await createPaste(content1, defaultOptions);
    const id2 = await createPaste(content2, {
      ...defaultOptions,
      password: 'another'
    });
    const r1 = await retrievePaste(id1, defaultOptions.password);
    const r2 = await retrievePaste(id2, 'another');
    expect(r1).toBe(content1);
    expect(r2).toBe(content2);
  });

  it('should throw if paste not found', async () => {
    await expect(retrievePaste('nonexistent', 'any')).rejects.toThrow(
      'Paste not found'
    );
  });
});
