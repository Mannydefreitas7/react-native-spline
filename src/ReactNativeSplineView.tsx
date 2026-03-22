import { Gyroscope } from 'expo-sensors';
import { requireNativeView } from 'expo';
import * as React from 'react';
import { Platform } from 'react-native';

import type { ReactNativeSplineViewProps, SplineObject } from './ReactNativeSpline.types';
import ReactNativeSplineModule from './ReactNativeSplineModule';
import { loadCursorLookAtConfigs } from './lookAtScene';

const NativeView: React.ComponentType<ReactNativeSplineViewProps> =
  requireNativeView('ReactNativeSpline');

const GYROSCOPE_INTERVAL_MS = 16;
const LOOK_AT_GAIN = 0.35;
const MAX_ROTATION_OFFSET = 0.9;

type Rotation = SplineObject['rotation'];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function useGyroscopeDrivenLookAt(
  url: string,
  enabled: boolean,
  isLoaded: boolean,
  explicitObjectIds?: string[]
) {
  const configsRef = React.useRef<Awaited<ReturnType<typeof loadCursorLookAtConfigs>>>([]);
  const baseRotationsRef = React.useRef<Map<string, Rotation>>(new Map());
  const orientationRef = React.useRef({ pitch: 0, yaw: 0 });
  const lastTimestampRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      configsRef.current = [];
      baseRotationsRef.current.clear();
      orientationRef.current = { pitch: 0, yaw: 0 };
      lastTimestampRef.current = null;
      return;
    }

    let isCancelled = false;

    async function prepareLookAt() {
      const configs = explicitObjectIds?.length
        ? explicitObjectIds.map((objectId) => ({ objectId }))
        : await loadCursorLookAtConfigs(url);
      if (isCancelled) {
        return;
      }

      configsRef.current = configs;

      const baseRotations = await Promise.all(
        configs.map(async ({ objectId }) => {
          const object = await ReactNativeSplineModule.findObjectById(objectId);
          return object ? [objectId, object.rotation] as const : null;
        })
      );

      if (isCancelled) {
        return;
      }

      baseRotationsRef.current = new Map(
        baseRotations.filter((entry): entry is readonly [string, Rotation] => entry !== null)
      );
      orientationRef.current = { pitch: 0, yaw: 0 };
      lastTimestampRef.current = null;
    }

    prepareLookAt().catch((error) => {
      console.warn('[ReactNativeSpline] Failed to prepare gyroscope lookAt support.', error);
      configsRef.current = [];
      baseRotationsRef.current.clear();
    });

    return () => {
      isCancelled = true;
    };
  }, [enabled, explicitObjectIds, url]);

  React.useEffect(() => {
    if (!enabled || !isLoaded) {
      return;
    }

    let isCancelled = false;
    let subscription: { remove(): void } | null = null;

    async function subscribe() {
      const isAvailable = await Gyroscope.isAvailableAsync();
      if (!isAvailable || isCancelled) {
        return;
      }

      Gyroscope.setUpdateInterval(GYROSCOPE_INTERVAL_MS);
      subscription = Gyroscope.addListener((measurement) => {
        const configs = configsRef.current;
        if (!configs.length) {
          return;
        }

        const timestamp = measurement.timestamp;
        const lastTimestamp = lastTimestampRef.current;
        lastTimestampRef.current = timestamp;

        const dt =
          lastTimestamp == null || timestamp <= lastTimestamp
            ? GYROSCOPE_INTERVAL_MS / 1000
            : timestamp - lastTimestamp;

        const distanceGain = clamp(
          ((configs[0]?.distance ?? 1000) as number) / 1000,
          0.35,
          1.25
        );
        const nextPitch = clamp(
          orientationRef.current.pitch + measurement.x * dt * LOOK_AT_GAIN * distanceGain,
          -MAX_ROTATION_OFFSET,
          MAX_ROTATION_OFFSET
        );
        const nextYaw = clamp(
          orientationRef.current.yaw + measurement.y * dt * LOOK_AT_GAIN * distanceGain,
          -MAX_ROTATION_OFFSET,
          MAX_ROTATION_OFFSET
        );

        orientationRef.current = { pitch: nextPitch, yaw: nextYaw };

        for (const { objectId } of configs) {
          const baseRotation = baseRotationsRef.current.get(objectId);
          if (!baseRotation) {
            continue;
          }

          ReactNativeSplineModule.setObjectRotation(
            objectId,
            baseRotation.x + nextPitch,
            baseRotation.y + nextYaw,
            baseRotation.z
          );
        }
      });
    }

    subscribe().catch((error) => {
      console.warn('[ReactNativeSpline] Failed to subscribe to the gyroscope.', error);
    });

    return () => {
      isCancelled = true;
      subscription?.remove();
    };
  }, [enabled, isLoaded]);
}

export default function ReactNativeSplineView(props: ReactNativeSplineViewProps) {
  const {
    onLoad,
    url,
    gyroscopeLookAtObjectIds,
    useDeviceGyroscopeForLookAt = true,
    ...nativeProps
  } = props;
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsLoaded(false);
  }, [url]);

  useGyroscopeDrivenLookAt(
    url,
    Platform.OS === 'ios' && useDeviceGyroscopeForLookAt,
    isLoaded,
    gyroscopeLookAtObjectIds
  );

  return (
    <NativeView
      {...nativeProps}
      url={url}
      onLoad={(event) => {
        setIsLoaded(true);
        onLoad(event);
      }}
    />
  );
}
