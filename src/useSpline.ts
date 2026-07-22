import { useCallback } from 'react'
import type {
  SplineEvent,
  SplineEventPayload,
  SplineEventSubscription,
  SplineObject,
} from './ReactNativeSpline.types'
import ReactNativeSpline from './ReactNativeSplineModule'

export interface UseSplineResult {
  /** Emit an event on the object with the given name or UUID. */
  emitEvent: (event: SplineEvent, nameOrUUID: string) => void
  /** Emit an event in reverse on the object with the given name or UUID. */
  emitEventReverse: (event: SplineEvent, nameOrUUID: string) => void
  /** Find a scene object by its UUID. */
  findObjectById: (id: string) => Promise<SplineObject | null>
  /** Find a scene object by its name. */
  findObjectByName: (name: string) => Promise<SplineObject | null>
  /** Set the scene zoom level. */
  setZoom: (value: number) => void
  /** Set an object's rotation in radians. */
  setObjectRotation: (nameOrUUID: string, rotation: { x: number; y: number; z: number }) => void
  /** Set the scene background color using RGBA components (0–255). */
  setBackgroundColor: (color: { r: number; g: number; b: number; a: number }) => void
  /** Start / resume scene playback. */
  play: () => void
  /** Stop / pause scene playback. */
  stop: () => void
  /**
   * Add a listener for a Spline scene event.
   * Call this inside a `useEffect` and remove the returned subscription on cleanup.
   */
  addEventListener: (
    event: SplineEvent,
    callback: (payload: SplineEventPayload) => void
  ) => SplineEventSubscription
}

/**
 * `useSpline` returns a stable set of methods for interacting with the
 * Spline scene at runtime, mirroring the Spline Code API described at
 * https://docs.spline.design/exporting-your-scene/apple-platform/code-api-for-swift-ui#api
 */
export function useSpline(): UseSplineResult {
  const emitEvent = useCallback(
    (event: SplineEvent, nameOrUUID: string) => ReactNativeSpline.emitEvent(event, nameOrUUID),
    []
  )

  const emitEventReverse = useCallback(
    (event: SplineEvent, nameOrUUID: string) =>
      ReactNativeSpline.emitEventReverse(event, nameOrUUID),
    []
  )

  const findObjectById = useCallback((id: string) => ReactNativeSpline.findObjectById(id), [])

  const findObjectByName = useCallback(
    (name: string) => ReactNativeSpline.findObjectByName(name),
    []
  )

  const setZoom = useCallback((value: number) => ReactNativeSpline.setZoom(value), [])

  const setObjectRotation = useCallback(
    (nameOrUUID: string, rotation: { x: number; y: number; z: number }) =>
      ReactNativeSpline.setObjectRotation(nameOrUUID, rotation.x, rotation.y, rotation.z),
    []
  )

  const setBackgroundColor = useCallback(
    (color: { r: number; g: number; b: number; a: number }) =>
      ReactNativeSpline.setBackgroundColor(color),
    []
  )

  const play = useCallback(() => ReactNativeSpline.play(), [])

  const stop = useCallback(() => ReactNativeSpline.stop(), [])

  const addEventListener = useCallback(
    (event: SplineEvent, callback: (payload: SplineEventPayload) => void) =>
      ReactNativeSpline.addEventListener(event, callback),
    []
  )

  return {
    emitEvent,
    emitEventReverse,
    findObjectById,
    findObjectByName,
    setZoom,
    setObjectRotation,
    setBackgroundColor,
    play,
    stop,
    addEventListener,
  }
}
