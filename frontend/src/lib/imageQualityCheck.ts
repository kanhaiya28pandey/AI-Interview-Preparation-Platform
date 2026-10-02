export interface ImageQualityCheckResult {
  valid: boolean;
  reason?: string;
  blurScore: number;
  width: number;
  height: number;
}

/**
 * Evaluates an uploaded ID image file using HTML Canvas diagnostics
 * Checks file size, dimensions, and performs Laplacian variance blur detection.
 */
export async function checkImageQuality(file: File): Promise<ImageQualityCheckResult> {
  // 1. File type validation
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      reason: "Invalid file format. Please upload a PNG, JPG, or WebP image.",
      blurScore: 0,
      width: 0,
      height: 0,
    };
  }

  // 2. File size validation (max 10MB, min 5KB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      reason: "File size exceeds 10MB limit. Please compress or crop your photo.",
      blurScore: 0,
      width: 0,
      height: 0,
    };
  }

  if (file.size < 5 * 1024) {
    return {
      valid: false,
      reason: "File size is too small (under 5KB). Image appears corrupted or blank.",
      blurScore: 0,
      width: 0,
      height: 0,
    };
  }

  // 3. Load image & check dimensions + blur variance
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (width < 350 || height < 200) {
        return resolve({
          valid: false,
          reason: `Image resolution (${width}x${height}px) is too small. Minimum required is 350x200px for readable ID text.`,
          blurScore: 0,
          width,
          height,
        });
      }

      // Compute Laplacian Variance for blur detection
      const canvas = document.createElement("canvas");
      const sampleSize = 150;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return resolve({ valid: true, blurScore: 100, width, height });
      }

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;

      // Convert to grayscale
      const gray = new Float32Array(sampleSize * sampleSize);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      // Compute 3x3 Laplacian response
      const laplacian = new Float32Array(sampleSize * sampleSize);
      let sum = 0;
      let count = 0;

      for (let y = 1; y < sampleSize - 1; y++) {
        for (let x = 1; x < sampleSize - 1; x++) {
          const idx = y * sampleSize + x;
          const val =
            gray[idx - sampleSize] +
            gray[idx - 1] +
            -4 * gray[idx] +
            gray[idx + 1] +
            gray[idx + sampleSize];
          laplacian[idx] = val;
          sum += val;
          count++;
        }
      }

      const mean = sum / count;
      let varianceSum = 0;
      for (let i = 0; i < laplacian.length; i++) {
        varianceSum += (laplacian[i] - mean) ** 2;
      }
      const rawVariance = varianceSum / count;
      // Normalize raw variance into a sensible percentage capped at 100%
      // 30 is the sharp pass threshold (maps to 60%)
      let blurScore = 0;
      if (rawVariance < 30) {
        blurScore = Math.min(59, Math.round((rawVariance / 30) * 59));
      } else {
        blurScore = Math.min(100, Math.round(60 + Math.min(40, ((rawVariance - 30) / 200) * 40)));
      }

      // Low blur score (< 60%) indicates low sharpness / out of focus image
      if (blurScore < 60) {
        return resolve({
          valid: false,
          reason: `Image is too blurry (clarity score: ${blurScore}%). Please upload a sharp, well-lit photo of your college ID card.`,
          blurScore,
          width,
          height,
        });
      }

      resolve({
        valid: true,
        blurScore,
        width,
        height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        reason: "Failed to read image file. Please try another photo.",
        blurScore: 0,
        width: 0,
        height: 0,
      });
    };

    img.src = url;
  });
}
