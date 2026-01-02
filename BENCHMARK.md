# Benchmark Results

Actual benchmark results captured on Chrome (macOS). All results are from the **second run** to avoid WASM initialization overhead.

## 🌀 Mandelbrot Set (768×768, 1000 iterations)

| Implementation | Time |
|----------------|------|
| JavaScript | 132.8ms |
| Rust/WASM | 36.6ms |
| **Speedup** | **3.6×** |

![Mandelbrot Benchmark](./screenshots/mandelbrot-benchmark.png)

---

## 🔢 Prime Sieve (10 Million)

| Implementation | Time | Primes Found |
|----------------|------|--------------|
| JavaScript | 13.1ms | 664,579 |
| Rust/WASM | 7.8ms | 664,579 |
| **Speedup** | **1.7×** | — |

![Prime Sieve Benchmark](./screenshots/primes-benchmark.png)

---

## 📊 Matrix Multiplication (512×512)

| Implementation | Time | Operations |
|----------------|------|------------|
| JavaScript | 130.0ms | 268,435,456 |
| Rust/WASM | 87.0ms | 268,435,456 |
| **Speedup** | **1.5×** | — |

![Matrix Benchmark](./screenshots/matrix-benchmark.png)

---

## 🌫️ Image Blur (512×512, radius 5)

| Implementation | Time |
|----------------|------|
| JavaScript | 76.7ms |
| Rust/WASM | 37.7ms |
| **Speedup** | **2.0×** |

![Image Blur Benchmark](./screenshots/blur-benchmark.png)

---

## Summary

| Benchmark | Rust Advantage | Why |
|-----------|----------------|-----|
| Mandelbrot | ~3.6× | SIMD processes 4 pixels at once |
| Prime Sieve | ~1.7× | Better memory efficiency, no GC |
| Matrix Multiply | ~1.5× | Cache-optimized, predictable performance |
| Image Blur | ~2.0× | Efficient pixel buffer access |

> **Note**: Results may vary depending on browser, CPU, and system load. Modern JS engines (V8, SpiderMonkey) are highly optimized. Rust/WASM wins through SIMD, memory control, and predictable execution.

