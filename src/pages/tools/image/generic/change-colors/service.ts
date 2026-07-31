import { areColorsSimilar } from '@utils/color';

export const processImage = async (
  file: File,
  fromColor: [number, number, number, number],
  toColor: [number, number, number, number],
  similarity: number
): Promise<File> => {
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) return;

        let svgContent = e.target.result as string;
        const toColorHex = rgbToHex(
          toColor[0],
          toColor[1],
          toColor[2],
          toColor[3]
        );

        const hexRegexShort = new RegExp(`#[0-9a-f]{3}\\b`, 'gi');
        const hexRegexLong = new RegExp(`#[0-9a-f]{6}\\b`, 'gi');
        const hexRegexAlpha = new RegExp(`#[0-9a-f]{8}\\b`, 'gi');

        svgContent = svgContent.replace(hexRegexShort, (match) => {
          const expanded =
            '#' +
            match[1] +
            match[1] +
            match[2] +
            match[2] +
            match[3] +
            match[3];
          const matchRgb = hexToRgb(expanded);
          if (matchRgb && areColorsSimilar(matchRgb, fromColor, similarity))
            return toColorHex;
          return match;
        });

        svgContent = svgContent.replace(hexRegexLong, (match) => {
          const matchRgb = hexToRgb(match);
          if (matchRgb && areColorsSimilar(matchRgb, fromColor, similarity))
            return toColorHex;
          return match;
        });

        svgContent = svgContent.replace(hexRegexAlpha, (match) => {
          const matchRgba = hexToRgba(match);
          if (matchRgba && areColorsSimilar(matchRgba, fromColor, similarity))
            return toColorHex;
          return match;
        });

        const rgbRegex = new RegExp(
          `rgb\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)`,
          'gi'
        );
        svgContent = svgContent.replace(rgbRegex, (match, r, g, b) => {
          const matchRgb: [number, number, number, number] = [
            parseInt(r),
            parseInt(g),
            parseInt(b),
            255
          ];
          if (areColorsSimilar(matchRgb, fromColor, similarity)) {
            return `rgb(${toColor[0]}, ${toColor[1]}, ${toColor[2]})`;
          }
          return match;
        });

        const rgbaRegex = new RegExp(
          `rgba\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*([\\d.]+)\\s*\\)`,
          'gi'
        );
        svgContent = svgContent.replace(rgbaRegex, (match, r, g, b, a) => {
          const matchRgba: [number, number, number, number] = [
            parseInt(r),
            parseInt(g),
            parseInt(b),
            Math.round(parseFloat(a) * 255)
          ];
          if (areColorsSimilar(matchRgba, fromColor, similarity)) {
            return `rgba(${toColor[0]}, ${toColor[1]}, ${toColor[2]}, ${
              toColor[3] / 255
            })`;
          }
          return match;
        });

        const namedColors: Record<string, [number, number, number, number]> = {
          red: [255, 0, 0, 255],
          green: [0, 128, 0, 255],
          blue: [0, 0, 255, 255],
          black: [0, 0, 0, 255],
          white: [255, 255, 255, 255]
        };

        Object.entries(namedColors).forEach(([name, rgba]) => {
          if (areColorsSimilar(rgba, fromColor, similarity)) {
            const colorRegex = new RegExp(`\\b${name}\\b`, 'gi');
            svgContent = svgContent.replace(colorRegex, toColorHex);
          }
        });

        resolve(new File([svgContent], file.name, { type: 'image/svg+xml' }));
      };
      reader.readAsText(file);
    });
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const img = new Image();
  const url = URL.createObjectURL(file);
  img.src = url;
  await img.decode();
  URL.revokeObjectURL(url);

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const currentColor: [number, number, number, number] = [
      data[i],
      data[i + 1],
      data[i + 2],
      data[i + 3]
    ];
    if (areColorsSimilar(currentColor, fromColor, similarity)) {
      data[i] = toColor[0];
      data[i + 1] = toColor[1];
      data[i + 2] = toColor[2];
      data[i + 3] = toColor[3];
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(new File([blob], file.name, { type: file.type }));
      else reject(new Error('Failed to create blob'));
    }, file.type);
  });
};

const rgbToHex = (r: number, g: number, b: number, a = 255): string =>
  '#' + [r, g, b, a].map((x) => x.toString(16).padStart(2, '0')).join('');

const hexToRgb = (hex: string): [number, number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255
      ]
    : null;
};

const hexToRgba = (hex: string): [number, number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    hex
  );
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        parseInt(result[4], 16)
      ]
    : null;
};
