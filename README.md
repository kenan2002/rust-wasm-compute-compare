# ⚡ Compute Race — Rust/WASM vs JavaScript

A visual performance comparison between JavaScript and Rust (compiled to WebAssembly) across multiple computation benchmarks.

**[🚀 Live Demo](https://kenan2002.github.io/rust-wasm-compute-compare/)**

## Benchmarks

### 🌀 Mandelbrot Set
CPU-intensive fractal rendering. Rust uses SIMD to process 4 pixels at once. Click to zoom!

### 🔢 Prime Sieve
Sieve of Eratosthenes with bit-level optimization. Find primes up to 100 million.

### 📊 Matrix Multiplication
Multiply two N×N matrices. O(N³) operations with cache-optimized access patterns.

### 🌫️ Image Blur
Box blur with configurable radius. Demonstrates pixel-level image processing.

## Features

- 🎨 Side-by-side visual comparisons
- ⏱️ Real-time performance measurement
- 🔍 Interactive zoom for Mandelbrot
- 📊 Speedup calculation and winner announcement
- 🚀 SIMD-optimized Rust for maximum performance
- ⚖️ Fair comparisons with same algorithms on both sides

## Performance Results

See [BENCHMARK.md](./BENCHMARK.md) for detailed results with screenshots.

| Benchmark | Rust Speedup |
|-----------|--------------|
| Mandelbrot (768×768) | **3.6×** faster |
| Prime Sieve (10M) | **1.8×** faster |
| Matrix Multiply (512×512) | **1.4×** faster |
| Image Blur (512×512) | **1.7×** faster |

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

1. Add the function to `js-compute/` as a new module
2. Add the equivalent function to `rust-compute/src/` with `#[wasm_bindgen]`
3. Add UI controls and results section in `frontend/index.html`
4. Wire up the comparison in `frontend/src/main.js`
