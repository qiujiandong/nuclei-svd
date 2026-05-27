[![Deploy GitHub Pages](https://github.com/qiujiandong/nuclei-svd/actions/workflows/pages.yml/badge.svg)](https://github.com/qiujiandong/nuclei-svd/actions/workflows/pages.yml)
![GitHub last commit](https://img.shields.io/github/last-commit/qiujiandong/nuclei-svd)

# Nuclei SVD

[Nuclei SVD](https://qiujiandong.github.io/nuclei-svd/) is a browser-based editor
for building CMSIS-SVD files for SoC platforms based on Nuclei CPUs.
It provides an interactive workflow for configuring device metadata,
IREGION-generated peripherals, reusable peripheral templates, custom
peripheral instances, registers, and bit fields, then validating and
generating the final `.svd` output.

## Key Features

- Interactive editor for CMSIS-SVD generation
- IREGION peripheral generation from configurable CPU and module settings
- Reusable peripheral template workflow with linked and detached instances
- Register and bit-field editing with automatic reserved-bit generation
- XML preview with validation feedback before download
- Local browser persistence for restoring the latest editor state after reload

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm run test
```

Run the linter:

```bash
npm run lint
```

Preview the production build locally:

```bash
npm run preview
```
