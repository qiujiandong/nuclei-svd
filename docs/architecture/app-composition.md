# App Composition Architecture

This document describes the React app composition layer for the Nuclei SVD editor.
It is intentionally focused on app-local ownership boundaries, not on the SVD domain model itself.

## Module Map

- `src/App.tsx` is the small public composition root imported by `src/main.tsx`.
- `src/app/EditorApp.tsx` owns the current editor screen composition and wires controller state to page content.
- `src/app/appNavigation.ts` is the single source of truth for page IDs, sidebar groups, page titles, and page eyebrows.
- `src/app/fieldHints.ts` owns static label-to-tooltip copy.
- `src/app/useFieldHints.ts` binds field hints to rendered labels.
- `src/app/editor/AccessSelect.tsx` owns the reusable access-permission select control.
- `src/app/pages/DeviceInfoPage.tsx` owns the device profile form boundary.
- `src/app/pages/IRegionTemplatePage.tsx` is the IREGION page boundary.
- `src/app/pages/RegisterTemplatePage.tsx` is the register-template page boundary.
- `src/app/pages/PeripheralConfigPage.tsx` owns the current peripheral-configuration placeholder.
- `src/app/pages/PreviewPage.tsx` owns conversion controls, status output, and XML preview rendering.
- `src/app/useEditorController.ts` documents the controller grouping shape for device, template, peripheral, register, and conversion responsibilities.
- `src/lib/*` remains the domain layer for editor defaults, validation, normalization, and SVD XML generation.
- `src/components/*` remains the shared presentational component layer.

## Ownership Boundaries

App-local modules under `src/app/` should handle UI composition, page routing, form binding, and editor orchestration.
They should call existing domain functions from `src/lib/` instead of reimplementing validation or SVD transformation rules.

Shared components under `src/components/` should stay generic enough to be reused by more than one page.
Domain modules under `src/lib/` should remain React-free.

## Data Flow

The current data flow is:

1. `src/App.tsx` renders `EditorApp`.
2. `EditorApp` owns editor state, active page state, conversion state, and sidebar navigation.
3. Page-specific JSX receives state and callbacks from `EditorApp`.
4. Conversion calls `buildSvdInputFromEditor`, `validateSvdInput`, and `transformToSvd`.
5. The preview page displays the conversion status and XML output.

The long-term direction is to move the remaining editor mutations from `EditorApp` into `src/app/useEditorController.ts` while preserving the same grouped responsibility shape: device, template, peripheral, register, and conversion.

## Adding A New Page

1. Add a page ID and sidebar entry in `src/app/appNavigation.ts`.
2. Create a named component under `src/app/pages/`.
3. Render the page from `src/app/EditorApp.tsx`.
4. Keep labels and headings stable enough for accessibility queries.
5. Add or update tests in `src/App.test.tsx` for sidebar switching and the page's primary visible controls.

## Editing Field Hints

Edit static tooltip copy in `src/app/fieldHints.ts`.
The hint key must match the visible label text inside a label's first `span`.
Do not add page-specific tooltip binding logic in individual page components; `src/app/useFieldHints.ts` owns the binding behavior.

## Verification Expectations

Before claiming app composition changes complete, run:

- `npm test`
- `npm run lint`
- `npm run build`
- a line-count check proving `src/App.tsx` remains a small composition root
- a path check for every source file referenced in this document

Behavior-sensitive refactors must preserve sidebar labels, page headings, conversion/download behavior, template-derived peripherals and registers, IREGION address resolution, and reset behavior.
