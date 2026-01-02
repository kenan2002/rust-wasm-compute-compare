# Rust vs JavaScript Computation Comparison

A project that compares computation performance between JavaScript and Rust (compiled to WebAssembly).

## Project Structure

```
├── frontend/          # Vite-powered web frontend
├── js-compute/        # JavaScript computation module
└── rust-compute/      # Rust crate (compiles to WASM)
```

## Prerequisites

- Node.js 18+
- Rust toolchain (`rustup`)
- wasm-pack (`cargo install wasm-pack`)

## Setup

```bash
# Install all dependencies
npm run install:all

# Build WASM and start dev server
npm run dev
```

## How It Works

1. The frontend loads both the JS module and WASM module
2. You can run the same computation in both environments
3. Results are compared for correctness and timing

