//! Mandelbrot Set Computation (SIMD Optimized)

use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use std::arch::wasm32::*;

use crate::{PIXEL_BUFFER, COLOR_PALETTE};

/// SIMD-optimized Mandelbrot - processes 4 pixels at once using f32
#[wasm_bindgen]
#[cfg(target_arch = "wasm32")]
pub fn mandelbrot_to_buffer(
    width: u32,
    height: u32,
    center_x: f64,
    center_y: f64,
    zoom: f64,
    max_iterations: u32,
) {
    let size = (width * height * 4) as usize;
    
    unsafe {
        if PIXEL_BUFFER.len() < size {
            PIXEL_BUFFER.resize(size, 0);
        }
        
        let pixels = &mut PIXEL_BUFFER[..size];
        compute_mandelbrot_simd(pixels, width, height, center_x as f32, center_y as f32, zoom as f32, max_iterations);
    }
}

#[cfg(target_arch = "wasm32")]
#[inline(always)]
fn compute_mandelbrot_simd(
    pixels: &mut [u8],
    width: u32,
    height: u32,
    center_x: f32,
    center_y: f32,
    zoom: f32,
    max_iterations: u32,
) {
    let scale = 4.0 / (width as f32 * zoom);
    let half_width = width as f32 * 0.5;
    let half_height = height as f32 * 0.5;
    
    let _max_iter_v = u32x4_splat(max_iterations);
    let four = f32x4_splat(4.0);
    let two = f32x4_splat(2.0);
    let one_u32 = u32x4_splat(1);
    
    for py in 0..height {
        let y0 = (py as f32 - half_height) * scale + center_y;
        let y0_v = f32x4_splat(y0);
        
        let mut px = 0u32;
        while px + 4 <= width {
            let x0_base = (px as f32 - half_width) * scale + center_x;
            let x0_v = f32x4(
                x0_base,
                x0_base + scale,
                x0_base + scale * 2.0,
                x0_base + scale * 3.0,
            );
            
            let mut x = f32x4_splat(0.0);
            let mut y = f32x4_splat(0.0);
            let mut x2 = f32x4_splat(0.0);
            let mut y2 = f32x4_splat(0.0);
            let mut iterations = u32x4_splat(0);
            let mut active = u32x4_splat(u32::MAX);
            
            for _ in 0..max_iterations {
                let magnitude = f32x4_add(x2, y2);
                let not_escaped = f32x4_le(magnitude, four);
                active = v128_and(active, not_escaped);
                
                if u32x4_all_true(v128_not(active)) {
                    break;
                }
                
                let xy = f32x4_mul(x, y);
                y = f32x4_add(f32x4_mul(two, xy), y0_v);
                x = f32x4_add(f32x4_sub(x2, y2), x0_v);
                x2 = f32x4_mul(x, x);
                y2 = f32x4_mul(y, y);
                iterations = u32x4_add(iterations, v128_and(one_u32, active));
            }
            
            let iters: [u32; 4] = unsafe { std::mem::transmute(iterations) };
            
            for i in 0..4 {
                let idx = ((py * width + px + i as u32) * 4) as usize;
                let iter = iters[i];
                
                if iter >= max_iterations {
                    pixels[idx] = 0;
                    pixels[idx + 1] = 0;
                    pixels[idx + 2] = 0;
                    pixels[idx + 3] = 255;
                } else {
                    let palette_idx = ((iter * 2048) / max_iterations) as usize;
                    let palette_idx = palette_idx.min(2047);
                    unsafe {
                        let color = COLOR_PALETTE[palette_idx];
                        pixels[idx] = color[0];
                        pixels[idx + 1] = color[1];
                        pixels[idx + 2] = color[2];
                        pixels[idx + 3] = 255;
                    }
                }
            }
            
            px += 4;
        }
        
        // Handle remaining pixels
        while px < width {
            let x0 = (px as f32 - half_width) * scale + center_x;
            let y0_scalar = (py as f32 - half_height) * scale + center_y;
            
            let mut x = 0.0f32;
            let mut y = 0.0f32;
            let mut iteration = 0u32;
            
            while x * x + y * y <= 4.0 && iteration < max_iterations {
                let x_temp = x * x - y * y + x0;
                y = 2.0 * x * y + y0_scalar;
                x = x_temp;
                iteration += 1;
            }
            
            let idx = ((py * width + px) * 4) as usize;
            
            if iteration >= max_iterations {
                pixels[idx] = 0;
                pixels[idx + 1] = 0;
                pixels[idx + 2] = 0;
                pixels[idx + 3] = 255;
            } else {
                let palette_idx = ((iteration * 2048) / max_iterations) as usize;
                let palette_idx = palette_idx.min(2047);
                unsafe {
                    let color = COLOR_PALETTE[palette_idx];
                    pixels[idx] = color[0];
                    pixels[idx + 1] = color[1];
                    pixels[idx + 2] = color[2];
                    pixels[idx + 3] = 255;
                }
            }
            
            px += 1;
        }
    }
}

/// Mandelbrot returning Vec (compatibility)
#[wasm_bindgen]
pub fn mandelbrot(
    width: u32,
    height: u32,
    center_x: f64,
    center_y: f64,
    zoom: f64,
    max_iterations: u32,
) -> Vec<u8> {
    let size = (width * height * 4) as usize;
    
    unsafe {
        if PIXEL_BUFFER.len() < size {
            PIXEL_BUFFER.resize(size, 0);
        }
        
        #[cfg(target_arch = "wasm32")]
        compute_mandelbrot_simd(&mut PIXEL_BUFFER[..size], width, height, center_x as f32, center_y as f32, zoom as f32, max_iterations);
        
        PIXEL_BUFFER[..size].to_vec()
    }
}

#[cfg(target_arch = "wasm32")]
#[inline(always)]
fn u32x4_all_true(v: v128) -> bool {
    u32x4_bitmask(v) == 0b1111
}

