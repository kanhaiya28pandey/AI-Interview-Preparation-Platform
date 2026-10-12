/**
 * Client-side Image Compression Utility
 * Resizes images to max 1280px on the longest dimension and compresses to JPEG ~0.8 quality (< 500KB).
 */

export interface CompressionOptions {
  maxDimension?: number;
  quality?: number;
  maxSizeBytes?: number;
}

export async function compressImage(
  source: File | Blob | string,
  options: CompressionOptions = {}
): Promise<string> {
  const maxDimension = options.maxDimension || 1280;
  const initialQuality = options.quality !== undefined ? options.quality : 0.8;
  const maxSizeBytes = options.maxSizeBytes || 500 * 1024; // 500 KB

  let dataUrl: string;

  if (typeof source === "string") {
    dataUrl = source;
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    });
  }

  // If already a tiny data URL or sample URL, return directly
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // White background for transparent PNGs converted to JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      let quality = initialQuality;
      let outputDataUrl = canvas.toDataURL("image/jpeg", quality);

      // Binary size estimation from Base64 length
      const estimateSize = (b64: string) => Math.round((b64.length * 3) / 4);

      if (estimateSize(outputDataUrl) > maxSizeBytes && quality > 0.4) {
        quality = 0.6;
        outputDataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      resolve(outputDataUrl);
    };

    img.onerror = () => {
      // Fallback to original dataUrl if decoding fails
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
