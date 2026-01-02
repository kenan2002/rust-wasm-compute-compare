//! Prime Sieve Computation (Optimized Bit Sieve - odds only)

use wasm_bindgen::prelude::*;

#[inline(always)]
fn get_bit(sieve: &[u8], i: usize) -> bool {
    (sieve[i >> 3] & (1 << (i & 7))) != 0
}

#[inline(always)]
fn clear_bit(sieve: &mut [u8], i: usize) {
    sieve[i >> 3] &= !(1 << (i & 7));
}

/// Count primes up to a limit using optimized bit sieve
#[wasm_bindgen]
pub fn count_primes(limit: u32) -> u32 {
    if limit < 2 {
        return 0;
    }
    if limit == 2 {
        return 1;
    }
    
    let limit = limit as usize;
    
    // Only store odd numbers: index i represents number (2*i + 3)
    let sieve_size = (limit - 1) / 2;
    let mut sieve = vec![0xFFu8; (sieve_size + 7) / 8];
    
    let sqrt_limit = ((limit as f64).sqrt() as usize + 1) / 2;
    
    for i in 0..sqrt_limit {
        if get_bit(&sieve, i) {
            let prime = 2 * i + 3;
            let mut j = (prime * prime - 3) / 2;
            while j < sieve_size {
                clear_bit(&mut sieve, j);
                j += prime;
            }
        }
    }
    
    // Count: 1 for prime 2, plus all set bits
    let mut count = 1u32;
    for i in 0..sieve_size {
        if get_bit(&sieve, i) {
            count += 1;
        }
    }
    
    count
}

/// Find all primes up to a limit
#[wasm_bindgen]
pub fn prime_sieve(limit: u32) -> Vec<u32> {
    if limit < 2 {
        return Vec::new();
    }
    
    let limit = limit as usize;
    let sieve_size = if limit < 3 { 0 } else { (limit - 1) / 2 };
    let mut sieve = vec![0xFFu8; (sieve_size + 7) / 8];
    
    let sqrt_limit = ((limit as f64).sqrt() as usize + 1) / 2;
    
    for i in 0..sqrt_limit {
        if get_bit(&sieve, i) {
            let prime = 2 * i + 3;
            let mut j = (prime * prime - 3) / 2;
            while j < sieve_size {
                clear_bit(&mut sieve, j);
                j += prime;
            }
        }
    }
    
    // Collect primes
    let mut primes = Vec::with_capacity(count_primes(limit as u32) as usize);
    primes.push(2);
    for i in 0..sieve_size {
        if get_bit(&sieve, i) {
            primes.push((2 * i + 3) as u32);
        }
    }
    
    primes
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_count_primes() {
        assert_eq!(count_primes(10), 4);  // 2, 3, 5, 7
        assert_eq!(count_primes(100), 25);
        assert_eq!(count_primes(1000), 168);
    }
    
    #[test]
    fn test_prime_sieve() {
        let primes = prime_sieve(20);
        assert_eq!(primes, vec![2, 3, 5, 7, 11, 13, 17, 19]);
    }
}

