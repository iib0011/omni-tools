interface OpacityOptions {
  opacity: number;
  mode: 'solid' | 'gradient';
  gradientType: 'linear' | 'radial';
  gradientDirection: 'left-to-right' | 'inside-out';
  areaLeft: number;
  areaTop: number;
  areaWidth: number;
  areaHeight: number;
}

export async function changeOpacity(
  file: File,
  options: OpacityOptions
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not supported'));
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;

        if (options.mode === 'solid') {
          applySolidOpacity(ctx, img, options);
        } else {
          applyGradientOpacity(ctx, img, options);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        }, file.type);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function applySolidOpacity(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  options: OpacityOptions
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalAlpha = options.opacity;
  ctx.drawImage(img, 0, 0);
}

function applyGradientOpacity(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  options: OpacityOptions
) {
  const { areaLeft, areaTop, areaWidth, areaHeight } = options;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(img, 0, 0);

  const gradient =
    options.gradientType === 'linear'
      ? createLinearGradient(ctx, options)
      : createRadialGradient(ctx, options);

  ctx.fillStyle = gradient;
  ctx.fillRect(areaLeft, areaTop, areaWidth, areaHeight);
}

function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  options: OpacityOptions
) {
  const { areaLeft, areaTop, areaWidth, areaHeight } = options;
  const gradient = ctx.createLinearGradient(
    areaLeft,
    areaTop,
    areaLeft + areaWidth,
    areaTop
  );
  gradient.addColorStop(0, `rgba(255,255,255,${options.opacity})`);
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  return gradient;
}

function createRadialGradient(
  ctx: CanvasRenderingContext2D,
  options: OpacityOptions
) {
  const { areaLeft, areaTop, areaWidth, areaHeight } = options;
  const centerX = areaLeft + areaWidth / 2;
  const centerY = areaTop + areaHeight / 2;
  const radius = Math.min(areaWidth, areaHeight) / 2;

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  );

  if (options.gradientDirection === 'inside-out') {
    gradient.addColorStop(0, `rgba(255,255,255,${options.opacity})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
  } else {
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, `rgba(255,255,255,${options.opacity})`);
  }

  return gradient;
}
