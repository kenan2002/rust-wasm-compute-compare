import { mandelbrot as jsMandelbrot, countPrimes as jsCountPrimes, matrixMultiply as jsMatrixMultiply, boxBlur as jsBoxBlur, generateTestImage as jsGenerateTestImage } from '@js-compute/index.js';

// WASM module
let wasmModule = null;
let wasmMemory = null;

// Current computation mode
let currentComputation = 'mandelbrot';

// DOM elements
const elements = {
  // Computation selector
  compButtons: document.querySelectorAll('.comp-btn'),
  
  // Mandelbrot controls
  mandelbrotControls: document.getElementById('mandelbrot-controls'),
  resolution: document.getElementById('resolution'),
  iterations: document.getElementById('iterations'),
  zoom: document.getElementById('zoom'),
  centerX: document.getElementById('center-x'),
  centerY: document.getElementById('center-y'),
  runMandelbrotBtn: document.getElementById('run-mandelbrot-btn'),
  
  // Prime controls
  primesControls: document.getElementById('primes-controls'),
  primeLimit: document.getElementById('prime-limit'),
  runPrimesBtn: document.getElementById('run-primes-btn'),
  
  // Matrix controls
  matrixControls: document.getElementById('matrix-controls'),
  matrixSize: document.getElementById('matrix-size'),
  runMatrixBtn: document.getElementById('run-matrix-btn'),
  
  // Blur controls
  blurControls: document.getElementById('blur-controls'),
  blurSize: document.getElementById('blur-size'),
  blurRadius: document.getElementById('blur-radius'),
  runBlurBtn: document.getElementById('run-blur-btn'),
  
  // Status
  status: document.getElementById('status-message'),
  
  // Mandelbrot results
  mandelbrotResults: document.getElementById('mandelbrot-results'),
  jsCanvas: document.getElementById('js-canvas'),
  rustCanvas: document.getElementById('rust-canvas'),
  jsTimeBadge: document.getElementById('js-time-badge'),
  rustTimeBadge: document.getElementById('rust-time-badge'),
  
  // Prime results
  primesResults: document.getElementById('primes-results'),
  jsPrimesTime: document.getElementById('js-primes-time'),
  rustPrimesTime: document.getElementById('rust-primes-time'),
  jsPrimeCount: document.getElementById('js-prime-count'),
  rustPrimeCount: document.getElementById('rust-prime-count'),
  
  // Matrix results
  matrixResults: document.getElementById('matrix-results'),
  jsMatrixTime: document.getElementById('js-matrix-time'),
  rustMatrixTime: document.getElementById('rust-matrix-time'),
  jsMatrixOps: document.getElementById('js-matrix-ops'),
  rustMatrixOps: document.getElementById('rust-matrix-ops'),
  
  // Blur results
  blurResults: document.getElementById('blur-results'),
  jsBlurCanvas: document.getElementById('js-blur-canvas'),
  rustBlurCanvas: document.getElementById('rust-blur-canvas'),
  jsBlurTime: document.getElementById('js-blur-time'),
  rustBlurTime: document.getElementById('rust-blur-time'),
  
  // Summary
  summary: document.getElementById('summary'),
  winnerBadge: document.getElementById('winner-badge'),
  summaryText: document.getElementById('summary-text'),
  
  // Footer
  footerHint: document.getElementById('footer-hint'),
};

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initWasm() {
  try {
    const wasm = await import('./wasm/rust_compute.js');
    const instance = await wasm.default();
    wasmModule = wasm;
    wasmMemory = instance.memory;
    updateStatus('WASM loaded — ready to compute!');
    return true;
  } catch (err) {
    console.error('Failed to load WASM:', err);
    updateStatus('⚠️ WASM not found. Run: npm run build:wasm');
    return false;
  }
}

// ============================================================================
// UI HELPERS
// ============================================================================

function updateStatus(message, isRunning = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle('running', isRunning);
}

function formatTime(ms) {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(1)}µs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(1)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

function formatNumber(n) {
  return n.toLocaleString();
}

function switchComputation(comp) {
  currentComputation = comp;
  
  // Update buttons
  elements.compButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.comp === comp);
  });
  
  // Show/hide controls and results
  elements.mandelbrotControls.classList.toggle('hidden', comp !== 'mandelbrot');
  elements.mandelbrotResults.classList.toggle('hidden', comp !== 'mandelbrot');
  elements.primesControls.classList.toggle('hidden', comp !== 'primes');
  elements.primesResults.classList.toggle('hidden', comp !== 'primes');
  elements.matrixControls.classList.toggle('hidden', comp !== 'matrix');
  elements.matrixResults.classList.toggle('hidden', comp !== 'matrix');
  elements.blurControls.classList.toggle('hidden', comp !== 'blur');
  elements.blurResults.classList.toggle('hidden', comp !== 'blur');
  
  // Update footer hint
  const hints = {
    mandelbrot: 'Click on a canvas to zoom in at that point',
    primes: 'Try larger limits to see bigger performance differences',
    matrix: 'Matrix multiplication has O(N³) complexity',
    blur: 'Each pixel samples (2r+1)² neighbors'
  };
  elements.footerHint.textContent = hints[comp] || '';
  
  // Hide summary
  elements.summary.hidden = true;
  
  // Clear winner highlights
  document.querySelectorAll('.winner').forEach(el => el.classList.remove('winner'));
}

function showSummary(jsTime, rustTime, context = '') {
  const jsCard = document.querySelector(`.${currentComputation === 'mandelbrot' ? 'render' : 'result'}-card.js-card`);
  const rustCard = document.querySelector(`.${currentComputation === 'mandelbrot' ? 'render' : 'result'}-card.rust-card`);
  
  // Clear previous winners in current view
  document.querySelectorAll('.winner').forEach(el => el.classList.remove('winner'));
  
  const diff = ((jsTime - rustTime) / jsTime) * 100;
  const absDiff = Math.abs(diff);
  const speedup = jsTime / rustTime;
  
  if (absDiff < 5) {
    elements.winnerBadge.textContent = "🤝 It's a tie!";
    elements.winnerBadge.className = 'winner-badge tie';
    elements.summaryText.textContent = `Both implementations performed within 5% of each other.`;
  } else if (rustTime < jsTime) {
    elements.winnerBadge.textContent = '🦀 Rust Wins!';
    elements.winnerBadge.className = 'winner-badge rust-winner';
    if (rustCard) rustCard.classList.add('winner');
    elements.summaryText.textContent = `Rust/WASM was ${speedup.toFixed(2)}× faster than JavaScript${context}.`;
  } else {
    elements.winnerBadge.textContent = '⚡ JavaScript Wins!';
    elements.winnerBadge.className = 'winner-badge js-winner';
    if (jsCard) jsCard.classList.add('winner');
    const jsSpeedup = rustTime / jsTime;
    elements.summaryText.textContent = `JavaScript was ${jsSpeedup.toFixed(2)}× faster than Rust/WASM${context}.`;
  }
  
  elements.summary.hidden = false;
}

// ============================================================================
// MANDELBROT
// ============================================================================

function renderToCanvas(canvas, pixels, width, height) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
  ctx.putImageData(imageData, 0, 0);
}

function runJsMandelbrot(width, height, centerX, centerY, zoom, maxIter) {
  const start = performance.now();
  const pixels = jsMandelbrot(width, height, centerX, centerY, zoom, maxIter);
  const elapsed = performance.now() - start;
  return { pixels, elapsed };
}

function runRustMandelbrot(width, height, centerX, centerY, zoom, maxIter) {
  const size = width * height * 4;
  
  if (wasmMemory) {
    const start = performance.now();
    wasmModule.mandelbrot_to_buffer(width, height, centerX, centerY, zoom, maxIter);
    const ptr = wasmModule.get_buffer_ptr(size);
    const pixels = new Uint8Array(wasmMemory.buffer, ptr, size);
    const elapsed = performance.now() - start;
    return { pixels: new Uint8Array(pixels), elapsed };
  } else {
    const start = performance.now();
    const pixels = wasmModule.mandelbrot(width, height, centerX, centerY, zoom, maxIter);
    const elapsed = performance.now() - start;
    return { pixels, elapsed };
  }
}

async function runMandelbrotComparison() {
  const width = parseInt(elements.resolution.value, 10);
  const height = width;
  const maxIter = parseInt(elements.iterations.value, 10);
  const zoom = parseFloat(elements.zoom.value);
  const centerX = parseFloat(elements.centerX.value);
  const centerY = parseFloat(elements.centerY.value);
  
  elements.runMandelbrotBtn.disabled = true;
  elements.summary.hidden = true;
  
  elements.jsTimeBadge.textContent = '...';
  elements.jsTimeBadge.classList.remove('has-time');
  elements.rustTimeBadge.textContent = '...';
  elements.rustTimeBadge.classList.remove('has-time');
  
  try {
    updateStatus('Running JavaScript...', true);
    await new Promise(r => setTimeout(r, 50));
    
    const jsResult = runJsMandelbrot(width, height, centerX, centerY, zoom, maxIter);
    renderToCanvas(elements.jsCanvas, jsResult.pixels, width, height);
    elements.jsTimeBadge.textContent = formatTime(jsResult.elapsed);
    elements.jsTimeBadge.classList.add('has-time');
    
    if (wasmModule) {
      updateStatus('Running Rust/WASM...', true);
      await new Promise(r => setTimeout(r, 50));
      
      const rustResult = runRustMandelbrot(width, height, centerX, centerY, zoom, maxIter);
      renderToCanvas(elements.rustCanvas, rustResult.pixels, width, height);
      elements.rustTimeBadge.textContent = formatTime(rustResult.elapsed);
      elements.rustTimeBadge.classList.add('has-time');
      
      showSummary(jsResult.elapsed, rustResult.elapsed);
      updateStatus(`Done! JS: ${formatTime(jsResult.elapsed)} | Rust: ${formatTime(rustResult.elapsed)}`);
    } else {
      updateStatus('JS rendered. WASM not available.');
    }
    
  } catch (err) {
    console.error('Render failed:', err);
    updateStatus(`Error: ${err.message}`);
  } finally {
    elements.runMandelbrotBtn.disabled = false;
  }
}

function handleCanvasClick(e) {
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top) * scaleY;
  
  const width = canvas.width;
  const height = canvas.height;
  const currentZoom = parseFloat(elements.zoom.value);
  const currentCenterX = parseFloat(elements.centerX.value);
  const currentCenterY = parseFloat(elements.centerY.value);
  
  const scale = 4.0 / (width * currentZoom);
  
  const newCenterX = (px - width / 2) * scale + currentCenterX;
  const newCenterY = (py - height / 2) * scale + currentCenterY;
  const newZoom = currentZoom * 2;
  
  elements.centerX.value = newCenterX.toFixed(10);
  elements.centerY.value = newCenterY.toFixed(10);
  elements.zoom.value = newZoom.toFixed(2);
  
  runMandelbrotComparison();
}

function handlePresetClick(e) {
  const btn = e.target;
  elements.centerX.value = btn.dataset.x;
  elements.centerY.value = btn.dataset.y;
  elements.zoom.value = btn.dataset.zoom;
  runMandelbrotComparison();
}

// ============================================================================
// PRIME SIEVE
// ============================================================================

function runJsPrimes(limit) {
  const start = performance.now();
  const count = jsCountPrimes(limit);
  const elapsed = performance.now() - start;
  return { count, elapsed };
}

function runRustPrimes(limit) {
  const start = performance.now();
  const count = wasmModule.count_primes(limit);
  const elapsed = performance.now() - start;
  return { count, elapsed };
}

async function runPrimesComparison() {
  const limit = parseInt(elements.primeLimit.value, 10);
  
  elements.runPrimesBtn.disabled = true;
  elements.summary.hidden = true;
  
  elements.jsPrimesTime.textContent = '...';
  elements.jsPrimesTime.classList.remove('has-time');
  elements.rustPrimesTime.textContent = '...';
  elements.rustPrimesTime.classList.remove('has-time');
  elements.jsPrimeCount.textContent = '...';
  elements.rustPrimeCount.textContent = '...';
  
  try {
    updateStatus(`Counting primes up to ${formatNumber(limit)}...`, true);
    await new Promise(r => setTimeout(r, 50));
    
    // Run JavaScript
    updateStatus('Running JavaScript...', true);
    await new Promise(r => setTimeout(r, 50));
    
    const jsResult = runJsPrimes(limit);
    elements.jsPrimesTime.textContent = formatTime(jsResult.elapsed);
    elements.jsPrimesTime.classList.add('has-time');
    elements.jsPrimeCount.textContent = formatNumber(jsResult.count);
    
    if (wasmModule) {
      updateStatus('Running Rust/WASM...', true);
      await new Promise(r => setTimeout(r, 50));
      
      const rustResult = runRustPrimes(limit);
      elements.rustPrimesTime.textContent = formatTime(rustResult.elapsed);
      elements.rustPrimesTime.classList.add('has-time');
      elements.rustPrimeCount.textContent = formatNumber(rustResult.count);
      
      showSummary(jsResult.elapsed, rustResult.elapsed, ` (found ${formatNumber(rustResult.count)} primes)`);
      updateStatus(`Done! Found ${formatNumber(rustResult.count)} primes. JS: ${formatTime(jsResult.elapsed)} | Rust: ${formatTime(rustResult.elapsed)}`);
    } else {
      updateStatus('JS computed. WASM not available.');
    }
    
  } catch (err) {
    console.error('Prime sieve failed:', err);
    updateStatus(`Error: ${err.message}`);
  } finally {
    elements.runPrimesBtn.disabled = false;
  }
}

// ============================================================================
// MATRIX MULTIPLICATION
// ============================================================================

function generateRandomMatrix(size) {
  const matrix = new Float64Array(size * size);
  for (let i = 0; i < matrix.length; i++) {
    matrix[i] = Math.random() * 10;
  }
  return matrix;
}

function runJsMatrix(a, b, size) {
  const start = performance.now();
  const result = jsMatrixMultiply(a, b, size);
  const elapsed = performance.now() - start;
  return { result, elapsed };
}

function runRustMatrix(a, b, size) {
  const start = performance.now();
  const result = wasmModule.matrix_multiply_optimized(a, b, size);
  const elapsed = performance.now() - start;
  return { result, elapsed };
}

async function runMatrixComparison() {
  const size = parseInt(elements.matrixSize.value, 10);
  const ops = size * size * size * 2; // multiply-add for each element
  
  elements.runMatrixBtn.disabled = true;
  elements.summary.hidden = true;
  
  elements.jsMatrixTime.textContent = '...';
  elements.jsMatrixTime.classList.remove('has-time');
  elements.rustMatrixTime.textContent = '...';
  elements.rustMatrixTime.classList.remove('has-time');
  elements.jsMatrixOps.textContent = '...';
  elements.rustMatrixOps.textContent = '...';
  
  try {
    updateStatus(`Generating ${size}×${size} matrices...`, true);
    await new Promise(r => setTimeout(r, 50));
    
    const a = generateRandomMatrix(size);
    const b = generateRandomMatrix(size);
    
    // Run JavaScript
    updateStatus('Running JavaScript...', true);
    await new Promise(r => setTimeout(r, 50));
    
    const jsResult = runJsMatrix(a, b, size);
    elements.jsMatrixTime.textContent = formatTime(jsResult.elapsed);
    elements.jsMatrixTime.classList.add('has-time');
    elements.jsMatrixOps.textContent = formatNumber(ops);
    
    if (wasmModule) {
      updateStatus('Running Rust/WASM...', true);
      await new Promise(r => setTimeout(r, 50));
      
      const rustResult = runRustMatrix(a, b, size);
      elements.rustMatrixTime.textContent = formatTime(rustResult.elapsed);
      elements.rustMatrixTime.classList.add('has-time');
      elements.rustMatrixOps.textContent = formatNumber(ops);
      
      showSummary(jsResult.elapsed, rustResult.elapsed, ` (${size}×${size} matrices)`);
      updateStatus(`Done! ${formatNumber(ops)} ops. JS: ${formatTime(jsResult.elapsed)} | Rust: ${formatTime(rustResult.elapsed)}`);
    } else {
      updateStatus('JS computed. WASM not available.');
    }
    
  } catch (err) {
    console.error('Matrix multiply failed:', err);
    updateStatus(`Error: ${err.message}`);
  } finally {
    elements.runMatrixBtn.disabled = false;
  }
}

// ============================================================================
// IMAGE BLUR
// ============================================================================

function runJsBlur(pixels, width, height, radius) {
  const start = performance.now();
  const result = jsBoxBlur(pixels, width, height, radius);
  const elapsed = performance.now() - start;
  return { result, elapsed };
}

function runRustBlur(pixels, width, height, radius) {
  const start = performance.now();
  const result = wasmModule.box_blur(pixels, width, height, radius);
  const elapsed = performance.now() - start;
  return { result, elapsed };
}

async function runBlurComparison() {
  const size = parseInt(elements.blurSize.value, 10);
  const radius = parseInt(elements.blurRadius.value, 10);
  
  elements.runBlurBtn.disabled = true;
  elements.summary.hidden = true;
  
  elements.jsBlurTime.textContent = '...';
  elements.jsBlurTime.classList.remove('has-time');
  elements.rustBlurTime.textContent = '...';
  elements.rustBlurTime.classList.remove('has-time');
  
  try {
    updateStatus(`Generating ${size}×${size} test image...`, true);
    await new Promise(r => setTimeout(r, 50));
    
    // Generate test image
    const testImage = jsGenerateTestImage(size, size);
    
    // Run JavaScript
    updateStatus(`Running JavaScript (radius=${radius})...`, true);
    await new Promise(r => setTimeout(r, 50));
    
    const jsResult = runJsBlur(testImage, size, size, radius);
    renderToCanvas(elements.jsBlurCanvas, jsResult.result, size, size);
    elements.jsBlurTime.textContent = formatTime(jsResult.elapsed);
    elements.jsBlurTime.classList.add('has-time');
    
    if (wasmModule) {
      updateStatus(`Running Rust/WASM (radius=${radius})...`, true);
      await new Promise(r => setTimeout(r, 50));
      
      const rustResult = runRustBlur(testImage, size, size, radius);
      renderToCanvas(elements.rustBlurCanvas, rustResult.result, size, size);
      elements.rustBlurTime.textContent = formatTime(rustResult.elapsed);
      elements.rustBlurTime.classList.add('has-time');
      
      const kernelSize = (radius * 2 + 1) ** 2;
      showSummary(jsResult.elapsed, rustResult.elapsed, ` (${kernelSize} samples/pixel)`);
      updateStatus(`Done! JS: ${formatTime(jsResult.elapsed)} | Rust: ${formatTime(rustResult.elapsed)}`);
    } else {
      updateStatus('JS computed. WASM not available.');
    }
    
  } catch (err) {
    console.error('Blur failed:', err);
    updateStatus(`Error: ${err.message}`);
  } finally {
    elements.runBlurBtn.disabled = false;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  await initWasm();
  
  // Computation selector
  elements.compButtons.forEach(btn => {
    btn.addEventListener('click', () => switchComputation(btn.dataset.comp));
  });
  
  // Mandelbrot
  elements.runMandelbrotBtn.addEventListener('click', runMandelbrotComparison);
  elements.jsCanvas.addEventListener('click', handleCanvasClick);
  elements.rustCanvas.addEventListener('click', handleCanvasClick);
  
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', handlePresetClick);
  });
  
  // Primes
  elements.runPrimesBtn.addEventListener('click', runPrimesComparison);
  
  // Matrix
  elements.runMatrixBtn.addEventListener('click', runMatrixComparison);
  
  // Blur
  elements.runBlurBtn.addEventListener('click', runBlurComparison);
  
  // Enter key
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (currentComputation === 'mandelbrot') {
          runMandelbrotComparison();
        } else if (currentComputation === 'primes') {
          runPrimesComparison();
        } else if (currentComputation === 'matrix') {
          runMatrixComparison();
        } else {
          runBlurComparison();
        }
      }
    });
  });
  
  // Initial run
  runMandelbrotComparison();
}

init();
