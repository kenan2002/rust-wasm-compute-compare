# ⚡ Compute Race — Rust/WASM vs JavaScript

A visual performance comparison between JavaScript and Rust (compiled to WebAssembly) across multiple computation benchmarks.

## Benchmarks

### 🌀 Mandelbrot Set
CPU-intensive fractal rendering. Rust uses SIMD to process 4 pixels at once. Click to zoom!

### 🔢 Prime Sieve
Sieve of Eratosthenes with bit-level optimization. Find primes up to 100 million.

### 📊 Matrix Multiplication
Multiply two N×N matrices. O(N³) operations with cache-optimized access patterns.

## Features

- 🎨 Side-by-side visual comparisons
- ⏱️ Real-time performance measurement
- 🔍 Interactive zoom for Mandelbrot
- 📊 Speedup calculation and winner announcement
- 🚀 SIMD-optimized Rust for maximum performance
- ⚖️ Fair comparisons with same algorithms on both sides

## Project Structure

```
├── frontend/           # Vite web app
│   ├── index.html      # Multi-benchmark UI
│   └── src/
│       ├── main.js     # Benchmark runner
│       └── style.css   # Styled UI
│
├── js-compute/         # JavaScript implementations
│   └── index.js        # All benchmarks
│
└── rust-compute/       # Rust implementations → WASM
    └── src/lib.rs      # SIMD Mandelbrot, bit sieve, matrix multiply
```

## Prerequisites

- Node.js 18+
- Rust toolchain (`rustup`)
- wasm-pack (`cargo install wasm-pack`)

## Setup

```bash
# Install dependencies
npm run install:all

# Build WASM (with SIMD) and start dev server
npm run dev
```

Then open http://localhost:3000

## Adding New Computations

1. Add the function to `js-compute/index.js`
2. Add the equivalent function to `rust-compute/src/lib.rs` with `#[wasm_bindgen]`
3. Add UI controls and results section in `frontend/index.html`
4. Wire up the comparison in `frontend/src/main.js`

## Performance Notes

| Benchmark | Rust Advantage | Why |
|-----------|----------------|-----|
| Mandelbrot | ~2-4× | SIMD processes 4 pixels at once |
| Prime Sieve | ~1.2-2× | Better memory efficiency, no GC |
| Matrix Multiply | ~1.5-3× | Cache-optimized, predictable performance |

Modern JS engines (V8, SpiderMonkey) are highly optimized. Rust/WASM wins through SIMD, memory control, and predictable execution.
