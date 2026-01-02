//! Image Blur Computation (Box Blur)

use wasm_bindgen::prelude::*;

/// Apply a box blur to an RGBA image.
#[wasm_bindgen]
pub fn box_blur(pixels: &[u8], width: u32, height: u32, radius: u32) -> Vec<u8> {
    let width = width as usize;
    let height = height as usize;
    let radius = radius as i32;
    let size = (radius * 2 + 1) as usize;
    let area = (size * size) as u32;

    let mut result = vec![0u8; pixels.len()];

    for y in 0..height {
        for x in 0..width {
            let mut r: u32 = 0;
            let mut g: u32 = 0;
            let mut b: u32 = 0;
            let mut a: u32 = 0;

            // Sample the kernel
            for ky in -radius..=radius {
                for kx in -radius..=radius {
                    let sx = (x as i32 + kx).clamp(0, width as i32 - 1) as usize;
                    let sy = (y as i32 + ky).clamp(0, height as i32 - 1) as usize;
                    let idx = (sy * width + sx) * 4;

                    r += pixels[idx] as u32;
                    g += pixels[idx + 1] as u32;
                    b += pixels[idx + 2] as u32;
                    a += pixels[idx + 3] as u32;
                }
            }

            let out_idx = (y * width + x) * 4;
            result[out_idx] = (r / area) as u8;
            result[out_idx + 1] = (g / area) as u8;
            result[out_idx + 2] = (b / area) as u8;
            result[out_idx + 3] = (a / area) as u8;
        }
    }

    result
}

/// Generate a test pattern image
#[wasm_bindgen]
pub fn generate_test_image(width: u32, height: u32) -> Vec<u8> {
    let width = width as usize;
    let height = height as usize;
    let mut pixels = vec![0u8; width * height * 4];

    let cx = width as f32 / 2.0;
    let cy = height as f32 / 2.0;
    let max_dist = (cx * cx + cy * cy).sqrt();

    for y in 0..height {
        for x in 0..width {
            let idx = (y * width + x) * 4;

            // Gradient background
            let r = (x as f32 / width as f32) * 255.0;
            let g = (y as f32 / height as f32) * 255.0;
            let b = ((x + y) as f32 / (width + height) as f32) * 255.0;

            // Distance from center
            let dx = x as f32 - cx;
            let dy = y as f32 - cy;
            let dist = (dx * dx + dy * dy).sqrt();

            if dist < max_dist * 0.3 {
                // White circle
                pixels[idx] = 255;
                pixels[idx + 1] = 255;
                pixels[idx + 2] = 255;
            } else if (x + y) % 40 < 3 {
                // Dark diagonal lines
                pixels[idx] = 50;
                pixels[idx + 1] = 50;
                pixels[idx + 2] = 50;
            } else {
                pixels[idx] = r as u8;
                pixels[idx + 1] = g as u8;
                pixels[idx + 2] = b as u8;
            }

            pixels[idx + 3] = 255;
        }
    }

    pixels
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_blur_output_size() {
        let input = vec![255u8; 100 * 100 * 4];
        let result = box_blur(&input, 100, 100, 3);
        assert_eq!(result.len(), input.len());
    }

    #[test]
    fn test_generate_image() {
        let img = generate_test_image(64, 64);
        assert_eq!(img.len(), 64 * 64 * 4);
    }
}
