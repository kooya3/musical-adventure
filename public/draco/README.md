# DRACO Decoder

This directory should contain the DRACO decoder files required for loading compressed glTF models.

The decoder files can be obtained from the Three.js distribution:
- draco_wasm_wrapper.js
- draco_wasm_wrapper.wasm
- draco_decoder.js
- draco_decoder.wasm

For now, the application will fall back to regular glTF loading if DRACO files are not available.