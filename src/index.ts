// Reexport the native module on native platforms to ReactNativeSplineModule.ts
export { default as ReactNativeSpline } from './ReactNativeSplineModule';
export { default as SplineView, ReactNativeSplineView } from './ReactNativeSplineView';
export * from './ReactNativeSpline.types';
export { useSpline } from './useSpline';
export type { UseSplineResult } from './useSpline';
export { useVariable } from './useVariable';
