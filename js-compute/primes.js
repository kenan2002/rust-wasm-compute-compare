/**
 * Prime Sieve Computation (Optimized Bit Sieve - odds only)
 */

/**
 * Get bit at index i
 */
function getBit(sieve, i) {
  return (sieve[i >> 3] & (1 << (i & 7))) !== 0;
}

/**
 * Clear bit at index i
 */
function clearBit(sieve, i) {
  sieve[i >> 3] &= ~(1 << (i & 7));
}

/**
 * Count primes up to a limit using optimized bit sieve (odds only)
 * 
 * @param {number} limit - Count primes up to this number
 * @returns {number} - Number of primes found
 */
export function countPrimes(limit) {
  if (limit < 2) return 0;
  if (limit === 2) return 1;
  
  // Only store odd numbers: index i represents number (2*i + 3)
  const sieveSize = (limit - 1) >> 1;
  const sieve = new Uint8Array(((sieveSize + 7) >> 3)).fill(0xFF);
  
  const sqrtLimit = ((Math.sqrt(limit) | 0) + 1) >> 1;
  
  for (let i = 0; i < sqrtLimit; i++) {
    if (getBit(sieve, i)) {
      const prime = 2 * i + 3;
      let j = (prime * prime - 3) >> 1;
      while (j < sieveSize) {
        clearBit(sieve, j);
        j += prime;
      }
    }
  }
  
  let count = 1; // for 2
  for (let i = 0; i < sieveSize; i++) {
    if (getBit(sieve, i)) {
      count++;
    }
  }
  
  return count;
}

/**
 * Find all prime numbers up to a given limit using optimized bit sieve.
 * 
 * @param {number} limit - Find primes up to this number
 * @returns {Uint32Array} - Array of prime numbers
 */
export function primeSieve(limit) {
  if (limit < 2) return new Uint32Array(0);
  if (limit === 2) return new Uint32Array([2]);
  
  const sieveSize = (limit - 1) >> 1;
  const sieve = new Uint8Array(((sieveSize + 7) >> 3)).fill(0xFF);
  
  const sqrtLimit = ((Math.sqrt(limit) | 0) + 1) >> 1;
  
  for (let i = 0; i < sqrtLimit; i++) {
    if (getBit(sieve, i)) {
      const prime = 2 * i + 3;
      let j = (prime * prime - 3) >> 1;
      while (j < sieveSize) {
        clearBit(sieve, j);
        j += prime;
      }
    }
  }
  
  // Count first
  let count = 1;
  for (let i = 0; i < sieveSize; i++) {
    if (getBit(sieve, i)) count++;
  }
  
  // Collect primes
  const primes = new Uint32Array(count);
  primes[0] = 2;
  let idx = 1;
  for (let i = 0; i < sieveSize; i++) {
    if (getBit(sieve, i)) {
      primes[idx++] = 2 * i + 3;
    }
  }
  
  return primes;
}

