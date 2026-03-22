import { useCallback } from 'react'

import ReactNativeSpline from './ReactNativeSplineModule'
import type { SplineEvent, SplineObject } from './ReactNativeSpline.types'

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
  /** Set the scene background color using RGBA components (0–255). */
  setBackgroundColor: (color: { r: number; g: number; b: number; a: number }) => void
  /** Start / resume scene playback. */
  play: () => void
  /** Stop / pause scene playback. */
  stop: () => void
  /** Set a numeric variable by name. */
  setNumberVariable: (name: string, value: number) => void
  /** Set a boolean variable by name. */
  setBoolVariable: (name: string, value: boolean) => void
  /** Set a string variable by name. */
  setStringVariable: (name: string, value: string) => void
  /** Get a numeric variable by name. */
  getNumberVariable: (name: string) => Promise<number | null>
  /** Get a boolean variable by name. */
  getBoolVariable: (name: string) => Promise<boolean | null>
  /** Get a string variable by name. */
  getStringVariable: (name: string) => Promise<string | null>
  /**
   * Add a listener for a Spline scene event.
   * Call this inside a `useEffect` and ensure you remove the listener on cleanup
   * by calling `ReactNativeSpline.removeAllListeners(event)` (or unmounting the view).
   */
  addEventListener: (event: SplineEvent, callback: (payload: SplineEvent) => void) => void
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

  const findObjectById = useCallback(
    (id: string) => ReactNativeSpline.findObjectById(id),
    []
  )

  const findObjectByName = useCallback(
    (name: string) => ReactNativeSpline.findObjectByName(name),
    []
  )

  const setZoom = useCallback((value: number) => ReactNativeSpline.setZoom(value), [])

  const setBackgroundColor = useCallback(
    (color: { r: number; g: number; b: number; a: number }) =>
      ReactNativeSpline.setBackgroundColor(color),
    []
  )

  const play = useCallback(() => ReactNativeSpline.play(), [])

  const stop = useCallback(() => ReactNativeSpline.stop(), [])

  const setNumberVariable = useCallback(
    (name: string, value: number) => ReactNativeSpline.setNumberVariable(name, value),
    []
  )

  const setBoolVariable = useCallback(
    (name: string, value: boolean) => ReactNativeSpline.setBoolVariable(name, value),
    []
  )

  const setStringVariable = useCallback(
    (name: string, value: string) => ReactNativeSpline.setStringVariable(name, value),
    []
  )

  const getNumberVariable = useCallback(
    (name: string) => ReactNativeSpline.getNumberVariable(name),
    []
  )

  const getBoolVariable = useCallback(
    (name: string) => ReactNativeSpline.getBoolVariable(name),
    []
  )

  const getStringVariable = useCallback(
    (name: string) => ReactNativeSpline.getStringVariable(name),
    []
  )

  const addEventListener = useCallback(
    (event: SplineEvent, callback: (payload: SplineEvent) => void) =>
      ReactNativeSpline.addEventListener(event, callback),
    []
  )

  return {
    emitEvent,
    emitEventReverse,
    findObjectById,
    findObjectByName,
    setZoom,
    setBackgroundColor,
    play,
    stop,
    setNumberVariable,
    setBoolVariable,
    setStringVariable,
    getNumberVariable,
    getBoolVariable,
    getStringVariable,
    addEventListener,
  }
}
