export const AUDIO_FORMATS = {
  // Lossy formats
  mp3: { codec: 'libmp3lame', bitrate: '192k', mimeType: 'audio/mpeg' },
  aac: { codec: 'aac', bitrate: '192k', mimeType: 'audio/aac' },
  ogg: { codec: 'libvorbis', bitrate: '192k', mimeType: 'audio/ogg' },

  // Lossless formats
  wav: { codec: 'pcm_s16le', bitrate: null, mimeType: 'audio/wav' },
  flac: { codec: 'flac', bitrate: null, mimeType: 'audio/flac' }
} as const;

export type AudioFormat = keyof typeof AUDIO_FORMATS;

export type InitialValuesType = {
  outputFormat: AudioFormat;
};
