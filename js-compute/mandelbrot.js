/**
 * Mandelbrot Set Computation (Optimized with pre-computed palette)
 */

// Pre-computed color palette
const COLOR_PALETTE = new Uint8Array(2048 * 3);
let paletteInitialized = false;

function initPalette() {
  if (paletteInitialized) return;
  for (let i = 0; i < 2048; i++) {
    const t = i / 2048;
    const [r, g, b] = hslToRgb(t, 0.8, 0.5);
    COLOR_PALETTE[i * 3] = r;
    COLOR_PALETTE[i * 3 + 1] = g;
    COLOR_PALETTE[i * 3 + 2] = b;
  }
  paletteInitialized = true;
}

function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Compute the Mandelbrot set for a given image region.
 * 
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {number} centerX - Center X coordinate in complex plane
 * @param {number} centerY - Center Y coordinate in complex plane
 * @param {number} zoom - Zoom level (higher = more zoomed in)
 * @param {number} maxIterations - Maximum iterations per pixel
 * @returns {Uint8Array} - RGBA pixel data (width * height * 4 bytes)
 */
export function mandelbrot(width, height, centerX, centerY, zoom, maxIterations) {
  initPalette();
  
  const pixels = new Uint8Array(width * height * 4);
  const scale = 4.0 / (width * zoom);
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const invMaxIter = 2048 / maxIterations;
  
  for (let py = 0; py < height; py++) {
    const y0 = (py - halfHeight) * scale + centerY;
    
    for (let px = 0; px < width; px++) {
      const x0 = (px - halfWidth) * scale + centerX;
      
      let x = 0.0;
      let y = 0.0;
      let x2 = 0.0;
      let y2 = 0.0;
      let iteration = 0;
      
      while (x2 + y2 <= 4.0 && iteration < maxIterations) {
        y = 2.0 * x * y + y0;
        x = x2 - y2 + x0;
        x2 = x * x;
        y2 = y * y;
        iteration++;
      }
      
      const idx = (py * width + px) * 4;
      
      if (iteration === maxIterations) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 255;
      } else {
        const paletteIdx = ((iteration * invMaxIter) | 0) * 3;
        pixels[idx] = COLOR_PALETTE[paletteIdx];
        pixels[idx + 1] = COLOR_PALETTE[paletteIdx + 1];
        pixels[idx + 2] = COLOR_PALETTE[paletteIdx + 2];
        pixels[idx + 3] = 255;
      }
    }
  }
  
  return pixels;
}

