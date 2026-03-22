# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build TypeScript to /build
npm run build

# Run tests
npm test

# Run a single test file
npx jest src/__tests__/lookAtScene.test.ts

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format
npm run format

# Run example on iOS (uses bun)
npm run start

# Open iOS example in Xcode
npm run open:ios

# Clean build artifacts
npm run clean
```

Tooling: **Biome** for linting/formatting (not ESLint/Prettier). **ts-jest** for TypeScript tests. **expo-module-scripts** wraps Jest and the TypeScript build.

## Architecture

This is an **Expo native module** library that bridges [Spline](https://spline.design) 3D scenes into React Native.

### Layer Breakdown

```
JavaScript/TypeScript (src/)
  ├── ReactNativeSpline.types.ts   — all shared types (SplineEvent, SplineObject, props)
  ├── ReactNativeSplineModule.ts   — thin wrapper over the native Expo module; adds typed addEventListener()
  ├── ReactNativeSplineView.tsx    — the <SplineView> React component + gyroscope hook
  ├── useSpline.ts                 — React hook exposing full scene API (events, variables, objects, playback)
  └── lookAtScene.ts               — MessagePack decoder for .splineswift binary format (extracts lookAt configs)

Native (ios/)
  ├── ReactNativeSplineModule.swift — Expo module definition; bridges all SplineController methods to JS
  └── ReactNativeSplineView.swift   — ExpoView hosting a SwiftUI SplineView via UIHostingController
```

### Key Concepts

**Event flow**: Native Spline events → `ReactNativeSplineView.swift` listener → emitted to JS via `sendEvent` → `ReactNativeSplineModule.ts` filters by event name → `useSpline` hook callbacks.

**Active view pattern**: `ReactNativeSplineModule.swift` stores a `weak var activeView` reference so imperative module methods (setZoom, emitEvent, etc.) can call `SplineController` on the currently displayed view. Only one active view at a time.

**Gyroscope-driven lookAt**: On iOS, `useGyroscopeDrivenLookAt` inside `ReactNativeSplineView.tsx` reads the scene's `.splineswift` file via MessagePack, finds objects configured as cursor-driven "look at" objects, then applies gyroscope data (16ms interval) with damping/gain to rotate those objects.

**`useSpline` hook** is the primary developer API. It returns memoized methods for: emitting events, controlling playback, zoom, rotation, background color, querying/setting typed variables, and finding objects by ID/name.

### Module Entry Point

`src/index.ts` — exports `SplineView` (component), `useSpline` (hook), and all types.

Build output goes to `build/` (TypeScript compiled), which is what consumers import.

### Testing

Tests live in `src/__tests__/`. They use Jest + ts-jest with a Node environment. The native module is mocked via Jest — tests cover JS-layer logic only (event filtering, MessagePack scene parsing).

### Example App

`example/` is a standalone Expo app. `example/App.tsx` demonstrates loading a scene URL, subscribing to events via `useSpline`, and displaying the latest event. Run it with `npm run start` (requires iOS simulator).
