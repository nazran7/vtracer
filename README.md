# VTracer Modern

A clean, modern rebuild of VTracer focused on the web app only. The legacy Rust codebase is preserved under `legacy/` for reference.

## What this is

- Vite + React + TypeScript UI
- Worker-based raster-to-SVG vectorization pipeline in TypeScript
- Feature parity targets: same controls, presets, and outputs as the legacy web app

## Quick start

```sh
npm install
npm run dev
```

Then open the printed local URL.

## Project layout

- `src/app` – top-level layout and orchestration
- `src/components` – UI panels and controls
- `src/features/vectorize` – worker, pipeline, presets, and types
- `public/assets` – sample images and icons
- `legacy/` – original Rust + WASM implementation and docs

## Notes

This is an active rewrite. The worker pipeline is modular so the clustering and tracing steps can be iterated on without touching the UI.
