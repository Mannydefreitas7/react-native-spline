// Reexport the native module on native platforms to ReactNativeSplineModule.ts

export * from './ReactNativeSpline.types'
export { default as ReactNativeSpline } from './ReactNativeSplineModule'
export { default as SplineView, ReactNativeSplineView } from './ReactNativeSplineView'
export type { UseSplineResult } from './useSpline'
export { useSpline } from './useSpline'
export { useVariable } from './useVariable'
