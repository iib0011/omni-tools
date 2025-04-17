import { areColorsSimilar } from '@utils/color';

export const processImage = async (
  file: File,
  fromColor: [number, number, number],
  toColor: [number, number, number],
  similarity: number,
  setResult: (result: File | null) => void
): Promise<void> => {
  if (file.type === 'image/svg+xml') {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;

      let svgContent = e.target.result as string;
      const toColorHex = rgbToHex(toColor[0], toColor[1], toColor[2]);

      // Replace hex colors with various formats (#fff, #ffffff)
      const hexRegexShort = new RegExp(`#[0-9a-f]{3}\\b`, 'gi');
      const hexRegexLong = new RegExp(`#[0-9a-f]{6}\\b`, 'gi');

      svgContent = svgContent.replace(hexRegexShort, (match) => {
        // Expand short hex to full form for comparison
        const expanded =
          '#' + match[1] + match[1] + match[2] + match[2] + match[3] + match[3];
        const matchRgb = hexToRgb(expanded);
        if (matchRgb && areColorsSimilar(matchRgb, fromColor, similarity)) {
          return toColorHex;
        }
        return match;
      });

      svgContent = svgContent.replace(hexRegexLong, (match) => {
        const matchRgb = hexToRgb(match);
        if (matchRgb && areColorsSimilar(matchRgb, fromColor, similarity)) {
          return toColorHex;
        }
        return match;
      });

      // Replace RGB colors
      const rgbRegex = new RegExp(
        `rgb\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)`,
        'gi'
      );
      svgContent = svgContent.replace(rgbRegex, (match, r, g, b) => {
        const matchRgb: [number, number, number] = [
          parseInt(r),
          parseInt(g),
          parseInt(b)
        ];
        if (areColorsSimilar(matchRgb, fromColor, similarity)) {
          return `rgb(${toColor[0]}, ${toColor[1]}, ${toColor[2]})`;
        }
        return match;
      });

      // Replace RGBA colors (preserving alpha)
      const rgbaRegex = new RegExp(
        `rgba\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*([\\d.]+)\\s*\\)`,
        'gi'
      );
      svgContent = svgContent.replace(rgbaRegex, (match, r, g, b, a) => {
        const matchRgb: [number, number, number] = [
          parseInt(r),
          parseInt(g),
          parseInt(b)
        ];
        if (areColorsSimilar(matchRgb, fromColor, similarity)) {
          return `rgba(${toColor[0]}, ${toColor[1]}, ${toColor[2]}, ${a})`;
        }
        return match;
      });

      // Replace named SVG colors if they match our target color
      const namedColors = {
        red: [255, 0, 0],
        green: [0, 128, 0],
        blue: [0, 0, 255],
        black: [0, 0, 0],
        white: [255, 255, 255]
        // Add more named colors as needed
      };

      Object.entries(namedColors).forEach(([name, rgb]) => {
        if (
          areColorsSimilar(
            rgb as [number, number, number],
            fromColor,
            similarity
          )
        ) {
          const colorRegex = new RegExp(`\\b${name}\\b`, 'gi');
          svgContent = svgContent.replace(colorRegex, toColorHex);
        }
      });

      // Create new file with modified content
      const newFile = new File([svgContent], file.name, {
        type: 'image/svg+xml'
      });
      setResult(newFile);
    };
    reader.readAsText(file);
    return;
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx == null) return;
  const img = new Image();

  img.src = URL.createObjectURL(file);
  await img.decode();

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data: Uint8ClampedArray = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const currentColor: [number, number, number] = [
      data[i],
      data[i + 1],
      data[i + 2]
    ];
    if (areColorsSimilar(currentColor, fromColor, similarity)) {
      data[i] = toColor[0]; // Red
      data[i + 1] = toColor[1]; // Green
      data[i + 2] = toColor[2]; // Blue
    }
  }

  ctx.putImageData(imageData, 0, 0);

  canvas.toBlob((blob) => {
    if (blob) {
      const newFile = new File([blob], file.name, {
        type: file.type
      });
      setResult(newFile);
    }
  }, file.type);
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

// Helper function to parse hex to RGB
const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : null;
};
