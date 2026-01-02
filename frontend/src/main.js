import { compute as jsCompute, getModuleName as jsModuleName } from '../../js-compute/index.js';

// WASM module - will be loaded dynamically
let wasmModule = null;

/**
 * Initialize the WASM module
 */
async function initWasm() {
  try {
    const wasm = await import('./wasm/rust_compute.js');
    await wasm.default();
    wasmModule = wasm;
    updateStatus('WASM loaded successfully');
    return true;
  } catch (err) {
    console.error('Failed to load WASM:', err);
    updateStatus('Failed to load WASM module. Run: npm run build:wasm');
    return false;
  }
}

/**
 * Generate random input data
 */
function generateInput(size) {
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = Math.floor(Math.random() * 256);
  }
  return data;
}

/**
 * Run a benchmark for a compute function
 */
function runBenchmark(computeFn, input, iterations) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    computeFn(input);
    const end = performance.now();
    times.push(end - start);
  }
  
  return {
    times,
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
  };
}

/**
 * Format time in milliseconds
 */
function formatTime(ms) {
  if (ms < 0.01) {
    return `${(ms * 1000).toFixed(2)} µs`;
  } else if (ms < 1) {
    return `${ms.toFixed(3)} ms`;
  } else {
    return `${ms.toFixed(2)} ms`;
  }
}

/**
 * Update status message
 */
function updateStatus(message, isRunning = false) {
  const el = document.getElementById('status-message');
  el.textContent = message;
  el.classList.toggle('running', isRunning);
}

/**
 * Update result card metrics
 */
function updateCard(prefix, results) {
  document.getElementById(`${prefix}-time`).textContent = formatTime(results.avg);
  document.getElementById(`${prefix}-min`).textContent = formatTime(results.min);
  document.getElementById(`${prefix}-max`).textContent = formatTime(results.max);
}

/**
 * Show comparison summary
 */
function showSummary(jsResults, rustResults) {
  const summary = document.getElementById('summary');
  const badge = document.getElementById('winner-badge');
  const text = document.getElementById('summary-text');
  
  const jsCard = document.querySelector('.js-card');
  const rustCard = document.querySelector('.rust-card');
  
  jsCard.classList.remove('winner');
  rustCard.classList.remove('winner');
  
  const diff = ((jsResults.avg - rustResults.avg) / jsResults.avg) * 100;
  const absDiff = Math.abs(diff);
  
  if (absDiff < 5) {
    badge.textContent = "It's a tie!";
    badge.className = 'winner-badge tie';
    text.textContent = `Both implementations performed within 5% of each other.`;
  } else if (rustResults.avg < jsResults.avg) {
    badge.textContent = '🦀 Rust Wins!';
    badge.className = 'winner-badge rust-winner';
    rustCard.classList.add('winner');
    text.textContent = `Rust/WASM was ${absDiff.toFixed(1)}% faster than JavaScript.`;
  } else {
    badge.textContent = '⚡ JavaScript Wins!';
    badge.className = 'winner-badge js-winner';
    jsCard.classList.add('winner');
    text.textContent = `JavaScript was ${absDiff.toFixed(1)}% faster than Rust/WASM.`;
  }
  
  summary.hidden = false;
}

/**
 * Run the comparison
 */
async function runComparison() {
  const sizeInput = document.getElementById('input-size');
  const iterInput = document.getElementById('iterations');
  const runBtn = document.getElementById('run-btn');
  
  const size = parseInt(sizeInput.value, 10);
  const iterations = parseInt(iterInput.value, 10);
  
  if (size < 100 || iterations < 1) {
    updateStatus('Invalid input values');
    return;
  }
  
  runBtn.disabled = true;
  
  try {
    // Generate input
    updateStatus(`Generating ${size.toLocaleString()} bytes of input...`, true);
    await new Promise(r => setTimeout(r, 50)); // Let UI update
    const input = generateInput(size);
    
    // Run JS benchmark
    updateStatus(`Running JavaScript (${iterations} iterations)...`, true);
    await new Promise(r => setTimeout(r, 50));
    const jsResults = runBenchmark(jsCompute, input, iterations);
    updateCard('js', jsResults);
    
    // Run WASM benchmark
    if (wasmModule) {
      updateStatus(`Running Rust/WASM (${iterations} iterations)...`, true);
      await new Promise(r => setTimeout(r, 50));
      const rustResults = runBenchmark(wasmModule.compute, input, iterations);
      updateCard('rust', rustResults);
      
      showSummary(jsResults, rustResults);
      updateStatus('Comparison complete!');
    } else {
      updateStatus('WASM module not loaded. JS-only results shown.');
    }
    
  } catch (err) {
    console.error('Comparison failed:', err);
    updateStatus(`Error: ${err.message}`);
  } finally {
    runBtn.disabled = false;
  }
}

// Initialize
async function init() {
  await initWasm();
  
  const runBtn = document.getElementById('run-btn');
  runBtn.addEventListener('click', runComparison);
  
  // Allow Enter key to run
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runComparison();
    });
  });
}

init();

