//! Rust/WASM Computation Module
//!
//! Provides multiple computation algorithms optimized for WebAssembly.

use wasm_bindgen::prelude::*;

// Computation modules
pub mod blur;
pub mod mandelbrot;
pub mod matrix;
pub mod primes;

// Re-export all public functions
pub use blur::*;
pub use mandelbrot::*;
pub use matrix::*;
pub use primes::*;

// ============================================================================
// SHARED STATE
// ============================================================================

/// Persistent buffer for pixel data - avoids allocation on each call
pub static mut PIXEL_BUFFER: Vec<u8> = Vec::new();

/// Pre-computed color palette for fast lookup
pub static mut COLOR_PALETTE: [[u8; 3]; 2048] = [[0; 3]; 2048];
static mut PALETTE_INITIALIZED: bool = false;

/// Initialize panic hook and color palette
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    // Pre-compute color palette
    unsafe {
        if !PALETTE_INITIALIZED {
            for i in 0..2048 {
                let t = i as f32 / 2048.0;
                let (r, g, b) = fast_hsl_to_rgb_f32(t);
                COLOR_PALETTE[i] = [r, g, b];
            }
            PALETTE_INITIALIZED = true;
        }
    }
}

/// Ensure buffer is large enough and return a pointer to it
#[wasm_bindgen]
pub fn get_buffer_ptr(size: usize) -> *mut u8 {
    unsafe {
        if PIXEL_BUFFER.len() < size {
            PIXEL_BUFFER.resize(size, 0);
        }
        PIXEL_BUFFER.as_mut_ptr()
    }
}

/// Get the name of this computation module
#[wasm_bindgen]
pub fn get_module_name() -> String {
    "Rust/WASM + SIMD".to_string()
}

// ============================================================================
// UTILITIES
// ============================================================================

#[inline(always)]
fn fast_hsl_to_rgb_f32(t: f32) -> (u8, u8, u8) {
    let h = t;
    let s = 0.8f32;
    let l = 0.5f32;

    let q = l + s - l * s;
    let p = 2.0 * l - q;

    let r = hue2rgb_f32(p, q, h + 1.0 / 3.0);
    let g = hue2rgb_f32(p, q, h);
    let b = hue2rgb_f32(p, q, h - 1.0 / 3.0);

    ((r * 255.0) as u8, (g * 255.0) as u8, (b * 255.0) as u8)
}

#[inline(always)]
fn hue2rgb_f32(p: f32, q: f32, mut t: f32) -> f32 {
    if t < 0.0 {
        t += 1.0;
    }
    if t > 1.0 {
        t -= 1.0;
    }

    if t < 1.0 / 6.0 {
        p + (q - p) * 6.0 * t
    } else if t < 0.5 {
        q
    } else if t < 2.0 / 3.0 {
        p + (q - p) * (2.0 / 3.0 - t) * 6.0
    } else {
        p
    }
}
