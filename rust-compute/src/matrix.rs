//! Matrix Multiplication Computation

use wasm_bindgen::prelude::*;

/// Multiply two square matrices
#[wasm_bindgen]
pub fn matrix_multiply(a: &[f64], b: &[f64], size: u32) -> Vec<f64> {
    let size = size as usize;
    let mut result = vec![0.0; size * size];
    
    for i in 0..size {
        for j in 0..size {
            let mut sum = 0.0;
            for k in 0..size {
                sum += a[i * size + k] * b[k * size + j];
            }
            result[i * size + j] = sum;
        }
    }
    
    result
}

/// Optimized matrix multiply with cache-friendly access pattern
#[wasm_bindgen]
pub fn matrix_multiply_optimized(a: &[f64], b: &[f64], size: u32) -> Vec<f64> {
    let size = size as usize;
    let mut result = vec![0.0; size * size];
    
    // Transpose B for cache-friendly access
    let mut b_t = vec![0.0; size * size];
    for i in 0..size {
        for j in 0..size {
            b_t[j * size + i] = b[i * size + j];
        }
    }
    
    for i in 0..size {
        for j in 0..size {
            let mut sum = 0.0;
            for k in 0..size {
                sum += a[i * size + k] * b_t[j * size + k];
            }
            result[i * size + j] = sum;
        }
    }
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_matrix_multiply() {
        // 2x2 identity matrix
        let a = vec![1.0, 0.0, 0.0, 1.0];
        let b = vec![2.0, 3.0, 4.0, 5.0];
        let result = matrix_multiply(&a, &b, 2);
        assert_eq!(result, vec![2.0, 3.0, 4.0, 5.0]);
    }
    
    #[test]
    fn test_matrix_multiply_optimized() {
        let a = vec![1.0, 2.0, 3.0, 4.0];
        let b = vec![5.0, 6.0, 7.0, 8.0];
        let result = matrix_multiply_optimized(&a, &b, 2);
        // [1*5+2*7, 1*6+2*8, 3*5+4*7, 3*6+4*8] = [19, 22, 43, 50]
        assert_eq!(result, vec![19.0, 22.0, 43.0, 50.0]);
    }
}

