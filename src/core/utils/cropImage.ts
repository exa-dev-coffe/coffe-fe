export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  file: File;
  previewUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180;

/**
 * Returns the cropped image as a WebP File and Blob URL with client-side compression.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  originalFileName = "product.webp",
  originalSizeBytes = 0,
  targetMaxWidth = 800,
  targetMaxHeight = 600,
  quality = 0.82
): Promise<CropResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context available");
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = {
    width:
      Math.abs(Math.cos(rotRad) * image.width) +
      Math.abs(Math.sin(rotRad) * image.height),
    height:
      Math.abs(Math.sin(rotRad) * image.width) +
      Math.abs(Math.cos(rotRad) * image.height),
  };

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to a central location on image to allow rotating around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  // Create a second canvas for the actual cropped and resized output
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("No 2d context available for cropped canvas");
  }

  // Calculate target dimension preserving crop aspect ratio while capping at targetMax
  const cropAspect = pixelCrop.width / pixelCrop.height;
  let finalWidth = pixelCrop.width;
  let finalHeight = pixelCrop.height;

  if (finalWidth > targetMaxWidth || finalHeight > targetMaxHeight) {
    if (finalWidth / targetMaxWidth > finalHeight / targetMaxHeight) {
      finalWidth = targetMaxWidth;
      finalHeight = Math.round(targetMaxWidth / cropAspect);
    } else {
      finalHeight = targetMaxHeight;
      finalWidth = Math.round(targetMaxHeight * cropAspect);
    }
  }

  croppedCanvas.width = finalWidth;
  croppedCanvas.height = finalHeight;

  // Clear canvas
  croppedCtx.clearRect(0, 0, finalWidth, finalHeight);

  // Enable high-quality image smoothing
  croppedCtx.imageSmoothingEnabled = true;
  croppedCtx.imageSmoothingQuality = "high";

  // Safe clipping computation to prevent Canvas IndexSizeError if pixelCrop extends beyond bounds (fit/contain mode or zoom out)
  const srcX = Math.max(0, pixelCrop.x);
  const srcY = Math.max(0, pixelCrop.y);
  const srcMaxX = Math.min(canvas.width, pixelCrop.x + pixelCrop.width);
  const srcMaxY = Math.min(canvas.height, pixelCrop.y + pixelCrop.height);
  const srcW = Math.max(0, srcMaxX - srcX);
  const srcH = Math.max(0, srcMaxY - srcY);

  const dstX = Math.round(((srcX - pixelCrop.x) / pixelCrop.width) * finalWidth);
  const dstY = Math.round(((srcY - pixelCrop.y) / pixelCrop.height) * finalHeight);
  const dstW = Math.round((srcW / pixelCrop.width) * finalWidth);
  const dstH = Math.round((srcH / pixelCrop.height) * finalHeight);

  if (srcW > 0 && srcH > 0 && dstW > 0 && dstH > 0) {
    croppedCtx.drawImage(
      canvas,
      srcX,
      srcY,
      srcW,
      srcH,
      dstX,
      dstY,
      dstW,
      dstH
    );
  }

  // Generate WebP blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty or conversion failed"));
          return;
        }

        // Clean filename extension to .webp
        const baseName = originalFileName.replace(/\.[^/.]+$/, "");
        const webpFileName = `${baseName}.webp`;

        const file = new File([blob], webpFileName, { type: "image/webp" });
        const previewUrl = URL.createObjectURL(blob);

        resolve({
          file,
          previewUrl,
          originalSizeBytes,
          compressedSizeBytes: blob.size,
        });
      },
      "image/webp",
      quality
    );
  });
}
