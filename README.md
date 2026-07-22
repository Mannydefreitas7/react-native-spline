<div align="center">

<img src="hero.png" alt="react-native-spline — Spline 3D scenes in React Native" width="720" />

# react-native-spline

**Interactive [Spline](https://spline.design) 3D scenes in React Native — fully native, no WebView.**

Powered by the official Spline runtimes for iOS and Android, wrapped as an Expo native module with a zero-config plugin.

[![npm version](https://img.shields.io/npm/v/react-native-spline.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/react-native-spline)
[![CI](https://github.com/emmanuel-defreitas/react-native-spline/actions/workflows/ci.yml/badge.svg)](https://github.com/emmanuel-defreitas/react-native-spline/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![platforms](https://img.shields.io/badge/platforms-iOS%2016%2B%20%7C%20Android-8A2BE2)](#requirements)
[![made with Expo](https://img.shields.io/badge/made%20with-Expo%20Modules-000020?logo=expo)](https://docs.expo.dev/modules/overview/)

<br />

```tsx
<SplineView url="https://build.spline.design/.../scene.splineswift" style={{ flex: 1 }} />
```

*That's it. A real, GPU-rendered, interactive 3D scene in your app.*

</div>

---

## Why react-native-spline?

|  | |
| --- | --- |
| 🚀 **Truly native** | Renders through Spline's official Swift and Android runtimes — not a WebView. Full 60fps, native gestures, native memory. |
| 🔌 **Zero-config setup** | One config plugin wires up the SplineRuntime Swift Package, Gradle dependencies, permissions, and deployment targets. `expo prebuild` and go. |
| 🎮 **Full scene control** | Emit events, play/pause, zoom, rotate objects, recolor the background — all from JavaScript via `useSpline()`. |
| 🔄 **Reactive variables** | `useVariable()` is `useState` for your Spline scene — read and write scene variables with React ergonomics. |
| 📱 **Gyroscope look-at** | On iOS, objects with a cursor "Look At" interaction automatically follow device motion. Your scene literally looks back at the user. |
| 🧩 **TypeScript first** | Every event, object, and prop is fully typed. |

## Requirements

- A recent Expo SDK — developed against SDK 55 (or bare React Native with [Expo Modules](https://docs.expo.dev/bare/installing-expo-modules/) installed)
- iOS 16.0+ (required by Spline's iOS runtime)
- A hosted **`.splineswift`** scene URL — export via **Spline → Export → Code → Swift** ([docs](https://docs.spline.design/exporting-your-scene/apple-platform/code-api-for-swift-ui))

## Installation

**1. Install the package**

```bash
npx expo install react-native-spline
# or
bun add react-native-spline
```

**2. Add the config plugin** to `app.json` / `app.config.js`:

```json
{
  "expo": {
    "plugins": ["react-native-spline"]
  }
}
```

**3. Prebuild and run**

```bash
npx expo prebuild
npx expo run:ios     # or run:android
```

<details>
<summary><b>What does the config plugin do?</b></summary>

<br />

**iOS**

- sets the deployment target to iOS 16.0 (Podfile properties + Xcode project)
- adds the [`SplineRuntime`](https://github.com/splinetool/spline-ios) Swift Package to your Xcode project
- patches Podfile framework search paths so the module can `import SplineRuntime`

**Android**

- adds `design.spline:spline-runtime:0.2.3`
- adds `androidx.lifecycle:lifecycle-common-java8:2.6.2` and `androidx.lifecycle:lifecycle-runtime-ktx:2.6.2`
- ensures `INTERNET` and `ACCESS_NETWORK_STATE` permissions are declared

Everything is idempotent — re-running prebuild never duplicates entries.

</details>

<details>
<summary><b>Using bare React Native (no prebuild)?</b></summary>

<br />

First [install Expo Modules](https://docs.expo.dev/bare/installing-expo-modules/), then apply the native setup by hand:

**iOS** — add the `SplineRuntime` Swift Package (`https://github.com/splinetool/spline-ios`) in Xcode, set your deployment target to 16.0+, then:

```bash
npx pod-install
```

**Android** — add to your app module's `build.gradle`:

```gradle
dependencies {
  implementation("design.spline:spline-runtime:0.2.3")
  implementation("androidx.lifecycle:lifecycle-common-java8:2.6.2")
  implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
}
```

and declare in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

</details>

## Quick Start

```tsx
import { useEffect, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import {
  SplineView,
  useSpline,
  type SplineEventPayload,
} from 'react-native-spline';

export default function App() {
  const { addEventListener, emitEvent } = useSpline();
  const [latestEvent, setLatestEvent] = useState<SplineEventPayload | null>(null);

  useEffect(() => {
    const subscription = addEventListener('mouseUp', setLatestEvent);
    return () => subscription.remove();
  }, [addEventListener]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SplineView
        url="https://build.spline.design/MEB5dcTLGkXFu2uqul4b/scene.splineswift"
        onLoad={() => emitEvent('start', 'Cube')}
        style={{ flex: 1 }}
      />
      <Text style={{ padding: 16 }}>
        {latestEvent
          ? `${latestEvent.event} on ${latestEvent.objectName ?? latestEvent.objectId ?? 'unknown'}`
          : 'Interact with the scene'}
      </Text>
    </SafeAreaView>
  );
}
```

## API

### `<SplineView />`

The component that renders your scene.

| Prop | Type | Description |
| --- | --- | --- |
| `url` | `string` | **Required.** Hosted `.splineswift` scene URL. |
| `onLoad` | `(event) => void` | **Required.** Fires when the scene finishes loading. `event.nativeEvent.url` echoes the scene URL. |
| `onSplineEvent` | `(event) => void` | Fires for every Spline interaction event (`event.nativeEvent` is a [`SplineEventPayload`](#events)). |
| `useDeviceGyroscopeForLookAt` | `boolean` | iOS only, default `true`. Drives "Look At" objects with device motion. |
| `gyroscopeLookAtObjectIds` | `string[]` | Explicit object UUIDs to drive with the gyroscope (skips scene auto-detection). |
| `style` | `StyleProp<ViewStyle>` | Standard view styling. |

### `useSpline()`

A hook returning stable, memoized controls for the active scene — mirrors Spline's [Code API](https://docs.spline.design/exporting-your-scene/apple-platform/code-api-for-swift-ui#api).

| Method | Signature | Description |
| --- | --- | --- |
| `emitEvent` | `(event, nameOrUUID) => void` | Trigger an interaction event on an object. |
| `emitEventReverse` | `(event, nameOrUUID) => void` | Trigger the event's reverse animation. |
| `findObjectById` | `(uuid) => Promise<SplineObject \| null>` | Look up an object by UUID. |
| `findObjectByName` | `(name) => Promise<SplineObject \| null>` | Look up an object by name. |
| `setObjectRotation` | `(nameOrUUID, { x, y, z }) => void` | Set an object's rotation (radians). |
| `setZoom` | `(value) => void` | Set the camera zoom level. |
| `setBackgroundColor` | `({ r, g, b, a }) => void` | Set the scene background (RGBA, 0–255). |
| `play` / `stop` | `() => void` | Resume / pause scene playback. |
| `addEventListener` | `(event, callback) => Subscription` | Subscribe to a scene event. Call `.remove()` on cleanup. |

```tsx
const { setZoom, play, findObjectByName } = useSpline();

async function focusScene() {
  setZoom(1.2);
  play();
  const cube = await findObjectByName('Cube');
  console.log(cube?.rotation);
}
```

> [!TIP]
> Scene methods act on the currently loaded view. Call them after `onLoad`, or from event handlers and effects that run once the scene is mounted.

### `useVariable()`

`useState`, but wired to a Spline scene variable. Reads the native value on mount, then keeps React state and the scene in sync on every set.

```tsx
const [opacity, setOpacity] = useVariable<number>('opacity', 1);
const [visible, setVisible] = useVariable<boolean>('visible', true);
const [label, setLabel] = useVariable<string>('label', '');
```

### Events

`SplineEventPayload` — `{ event, objectName?, objectId? }`

Supported events: `mouseUp` · `mouseDown` · `mousePress` · `mouseHover` · `keyUp` · `keyDown` · `keyPress` · `start` · `lookAt` · `follow`

### Gyroscope look-at (iOS)

If your scene has objects with a cursor **Look At** interaction, `SplineView` decodes the `.splineswift` file, finds them automatically, and rotates them with device motion — so a character that follows the cursor on the web follows the phone's tilt in your app. Disable with `useDeviceGyroscopeForLookAt={false}`, or pin specific objects with `gyroscopeLookAtObjectIds`.

## Example App

A full Expo example lives in [`example/`](./example):

```bash
bun install
bun run start:ios      # or start:android
```

## Troubleshooting

<details>
<summary><code>import SplineRuntime</code> fails on iOS</summary>

Re-run `npx expo prebuild --clean` so the config plugin can patch the freshly generated project, then reopen the workspace and build once from Xcode to let SPM resolve packages.

</details>

<details>
<summary>Scene doesn't load / blank view</summary>

Make sure the URL is a **`.splineswift`** export (not `.splinecode`, which is the web export) and that the device has network access. The scene must be hosted (Spline's "Export → Code → Swift" gives you the URL).

</details>

<details>
<summary>Android build errors about lifecycle classes</summary>

Verify the config plugin ran (check `android/app/build.gradle` for the `design.spline:spline-runtime` dependency). If you manage native projects manually, add the three Gradle dependencies listed in the bare setup section.

</details>

## Contributing

PRs welcome! This repo uses **bun**, **Biome**, and **Conventional Commits** (enforced by commitlint).

```bash
bun install        # install deps
bun run check      # lint + typecheck
bun run test       # jest
bun run build      # compile to build/
```

Repository layout:

```text
src/       TypeScript public API (SplineView, useSpline, useVariable)
ios/       Swift Expo module bridging SplineRuntime
android/   Kotlin Expo module bridging the Android Spline runtime
plugin/    Expo config plugin (SPM + Gradle + permissions injection)
example/   Expo example app
```

Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release) — merge to `main` with a conventional commit and CI handles versioning, changelog, npm publish, and the GitHub release.

## License

[MIT](./LICENSE) © [Emmanuel De Freitas](https://github.com/emmanuel-defreitas)

---

<div align="center">
<sub>Built with <a href="https://docs.expo.dev/modules/overview/">Expo Modules</a> · Powered by <a href="https://spline.design">Spline</a> · Not affiliated with Spline</sub>
</div>
