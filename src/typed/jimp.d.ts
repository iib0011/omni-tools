declare module 'jimp' {
  class JimpImage {
    getPixelColor: (x: number, y: number) => number;
  }

  export function read(buffer: Buffer): Promise<JimpImage>;
}
