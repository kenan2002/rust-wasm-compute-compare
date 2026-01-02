/**
 * Image Blur Computation (Box Blur)
 */

/**
 * Apply a box blur to an RGBA image.
 * 
 * @param {Uint8Array} pixels - RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} radius - Blur radius (1-20)
 * @returns {Uint8Array} - Blurred RGBA pixel data
 */
export function boxBlur(pixels, width, height, radius) {
  const result = new Uint8Array(pixels.length);
  const size = radius * 2 + 1;
  const area = size * size;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      // Sample the kernel
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const sx = Math.min(Math.max(x + kx, 0), width - 1);
          const sy = Math.min(Math.max(y + ky, 0), height - 1);
          const idx = (sy * width + sx) * 4;
          
          r += pixels[idx];
          g += pixels[idx + 1];
          b += pixels[idx + 2];
          a += pixels[idx + 3];
        }
      }
      
      const outIdx = (y * width + x) * 4;
      result[outIdx] = (r / area) | 0;
      result[outIdx + 1] = (g / area) | 0;
      result[outIdx + 2] = (b / area) | 0;
      result[outIdx + 3] = (a / area) | 0;
    }
  }
  
  return result;
}

/**
 * Generate a test pattern image (colorful gradient with shapes)
 * 
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Uint8Array} - RGBA pixel data
 */
export function generateTestImage(width, height) {
  const pixels = new Uint8Array(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Gradient background
      const r = (x / width) * 255;
      const g = (y / height) * 255;
      const b = ((x + y) / (width + height)) * 255;
      
      // Add some shapes for visual interest
      const cx = width / 2, cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
      
      if (dist < maxDist * 0.3) {
        // Circle in the middle
        pixels[idx] = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
      } else if ((x + y) % 40 < 3) {
        // Diagonal lines
        pixels[idx] = 50;
        pixels[idx + 1] = 50;
        pixels[idx + 2] = 50;
      } else {
        pixels[idx] = r | 0;
        pixels[idx + 1] = g | 0;
        pixels[idx + 2] = b | 0;
      }
      
      pixels[idx + 3] = 255;
    }
  }
  
  return pixels;
}

