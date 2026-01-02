/**
 * Matrix Multiplication Computation
 */

/**
 * Multiply two square matrices.
 * 
 * @param {Float64Array} a - First matrix (size × size)
 * @param {Float64Array} b - Second matrix (size × size)
 * @param {number} size - Matrix dimension
 * @returns {Float64Array} - Result matrix
 */
export function matrixMultiply(a, b, size) {
  const result = new Float64Array(size * size);
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += a[i * size + k] * b[k * size + j];
      }
      result[i * size + j] = sum;
    }
  }
  
  return result;
}

/**
 * Optimized matrix multiply with cache-friendly access pattern.
 * Transposes B for better cache locality.
 * 
 * @param {Float64Array} a - First matrix (size × size)
 * @param {Float64Array} b - Second matrix (size × size)
 * @param {number} size - Matrix dimension
 * @returns {Float64Array} - Result matrix
 */
export function matrixMultiplyOptimized(a, b, size) {
  const result = new Float64Array(size * size);
  
  // Transpose B for cache-friendly access
  const bT = new Float64Array(size * size);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      bT[j * size + i] = b[i * size + j];
    }
  }
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += a[i * size + k] * bT[j * size + k];
      }
      result[i * size + j] = sum;
    }
  }
  
  return result;
}

