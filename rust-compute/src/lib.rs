use wasm_bindgen::prelude::*;

// Initialize panic hook for better error messages in browser console
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Placeholder computation function.
/// TODO: Replace with actual computation logic.
#[wasm_bindgen]
pub fn compute(input: &[u8]) -> Vec<u8> {
    // For now, just return a copy of the input
    input.to_vec()
}

/// Get the name of this computation module
#[wasm_bindgen]
pub fn get_module_name() -> String {
    "Rust/WASM".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute() {
        let input = vec![1, 2, 3, 4, 5];
        let result = compute(&input);
        assert_eq!(result, input);
    }
}

