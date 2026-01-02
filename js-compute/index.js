/**
 * JavaScript Computation Module
 * 
 * Re-exports all computation algorithms for comparison with Rust/WASM.
 */

// Mandelbrot
export { mandelbrot } from './mandelbrot.js';

// Prime Sieve
export { countPrimes, primeSieve } from './primes.js';

// Matrix Multiplication
export { matrixMultiply, matrixMultiplyOptimized } from './matrix.js';

// Image Blur
export { boxBlur, generateTestImage } from './blur.js';

/**
 * Get the name of this computation module
 * @returns {string}
 */
export function getModuleName() {
  return "JavaScript";
}

/**
 * List available computations
 * @returns {string[]}
 */
export function listComputations() {
  return ["mandelbrot", "primeSieve", "matrixMultiply"];
}
