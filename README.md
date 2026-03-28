# react-native-spline

![react-native-spline banner](./docs/hero.jpeg)

React Native bindings for [Spline](https://spline.design) scenes, built as an Expo native module.

This package lets you:

- render hosted `.splineswift` scenes inside React Native
- listen to Spline interaction events from JavaScript
- control the active scene imperatively with `useSpline()`
- read and update Spline scene variables
- drive iOS `lookAt` interactions from the device gyroscope

## Status

This repository is under active development. The iOS and Android example apps are intended to be the source of truth for current integration behavior.

## Features

- Expo native module with an Expo config plugin
- `SplineView` component for rendering scenes
- `useSpline()` hook for runtime scene control
- `useVariable()` hook for typed Spline variables
- iOS Swift Package Manager integration for `SplineRuntime`
- Android Gradle dependency and permission setup via config plugin

## Installation

### Expo projects

Install the package:

```bash
bun add react-native-spline
```

Add the config plugin to your Expo config:

```json
{
  "expo": {
    "plugins": ["react-native-spline"]
  }
}
```

Then run prebuild for native changes:

```bash
bunx expo prebuild
```

What the plugin does:

- iOS
  - sets the deployment target to iOS 16
  - adds the `SplineRuntime` Swift package from `https://github.com/splinetool/spline-ios`
  - updates Podfile framework search paths so the Expo module can import `SplineRuntime`
- Android
  - adds `design.spline:spline-runtime:0.2.3`
  - adds `androidx.lifecycle:lifecycle-common-java8:2.6.2`
  - adds `androidx.lifecycle:lifecycle-runtime-ktx:2.6.2`
  - ensures `INTERNET` and `ACCESS_NETWORK_STATE` permissions are present

### Bare React Native projects with Expo modules

First install and configure Expo modules if you have not already:

- [Expo modules in bare React Native](https://docs.expo.dev/bare/installing-expo-modules/)

Install the package:

```bash
bun add react-native-spline
```

Then apply the equivalent native setup.

#### iOS

- add the `SplineRuntime` Swift package to your Xcode project
- ensure your iOS deployment target is 16.0 or newer
- run:

```bash
bunx pod-install
```

#### Android

Add these dependencies to your library or app module:

```gradle
dependencies {
  implementation("design.spline:spline-runtime:0.2.3")
  implementation("androidx.lifecycle:lifecycle-common-java8:2.6.2")
  implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
}
```

Also declare:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Quick Start

```tsx
import { useEffect, useState } from 'react';
import {
  SplineView,
  useSpline,
  type SplineEventPayload,
} from 'react-native-spline';
import { SafeAreaView, Text } from 'react-native';

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

### `SplineView`

Props:

- `url: string`
- `onLoad: ({ nativeEvent: { url } }) => void`
- `onSplineEvent?: ({ nativeEvent }) => void`
- `useDeviceGyroscopeForLookAt?: boolean`
- `gyroscopeLookAtObjectIds?: string[]`
- `style?: StyleProp<ViewStyle>`

Example:

```tsx
<SplineView
  url="https://build.spline.design/MEB5dcTLGkXFu2uqul4b/scene.splineswift"
  onLoad={({ nativeEvent }) => console.log('Loaded', nativeEvent.url)}
  onSplineEvent={({ nativeEvent }) => console.log(nativeEvent.event)}
  style={{ flex: 1 }}
/>
```

### `useSpline()`

Returns scene controls for the currently active native Spline view:

- `emitEvent(event, nameOrUUID)`
- `emitEventReverse(event, nameOrUUID)`
- `findObjectById(id)`
- `findObjectByName(name)`
- `setZoom(value)`
- `setObjectRotation(nameOrUUID, rotation)`
- `setBackgroundColor({ r, g, b, a })`
- `play()`
- `stop()`
- `addEventListener(event, callback)`

Supported event names:

- `mouseUp`
- `mouseDown`
- `mousePress`
- `mouseHover`
- `keyUp`
- `keyDown`
- `keyPress`
- `start`
- `lookAt`
- `follow`

Example:

```tsx
const { setZoom, play, stop, findObjectByName } = useSpline();

async function focusScene() {
  setZoom(1.2);
  play();

  const cube = await findObjectByName('Cube');
  console.log(cube?.rotation);
}
```

### `useVariable()`

`useVariable()` works like `useState`, but syncs with a Spline scene variable.

```tsx
const [opacity, setOpacity] = useVariable<number>('opacity', 1);
const [visible, setVisible] = useVariable<boolean>('visible', true);
const [label, setLabel] = useVariable<string>('label', '');
```

## Spline Scene Notes

- Use hosted `.splineswift` scene URLs for native embeds.
- Scene methods depend on the active loaded view. Call scene APIs after `onLoad` or from event handlers/effects once the scene is mounted.
- Object and variable names should match what you configured in Spline.
- On iOS, gyroscope-driven look-at support is enabled by default and only runs when compatible objects are found.

## Example App

The repository includes an Expo example app in [example/](./example).

Useful commands:

```bash
bun run start:ios
bun run start:android
```

## Repository Layout

```text
src/            JavaScript and TypeScript public API
ios/            iOS Expo module and SwiftUI Spline bridge
android/        Android Expo module and native Spline bridge
plugin/         Expo config plugin source and built output
example/        Expo example app
```

## Contributing

This repository uses `bun` for package management.

```bash
# Install dependencies
bun install

# Build TypeScript output
bun run build

# Run tests
bun test

# Lint
bun run lint

# Format
bun run format

# Run example apps
bun run start:ios
bun run start:android
```

Additional notes:

- TypeScript output is generated into `build/`
- the Expo config plugin source lives in `plugin/src`
- if you change the plugin source, rebuild the plugin output so `plugin/build` stays in sync
- Android native integration depends on the pinned Spline runtime and AndroidX lifecycle dependencies documented above

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a list of changes and release notes. This project follows [Semantic Versioning](https://semver.org/) and uses [Conventional Commits](https://www.conventionalcommits.org/) to automatically generate the changelog.

## License

MIT
